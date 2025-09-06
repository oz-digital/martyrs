import Validator from '@martyrs/src/modules/globals/controllers/classes/globals.validator.js';
import Verifier from '@martyrs/src/modules/globals/controllers/classes/globals.verifier.js';

export default (function initializeOrganizationPolicies(abacAccessControl, db) {
  const Organization = db.organization;
  const Department = db.department;
  
  // Инициализация валидатора с конфигурацией для публичного доступа
  const publicAccessVerifier = new Verifier({
    status: {
      rule: 'optional',
      validator: Validator.schema({ context: 'Status' }).string().required().oneOf(['published', 'active', 'featured']),
    },
  });

  // Удобные методы для проверки прав
  const organizationHelpers = {
    // Проверка, является ли пользователь владельцем организации
    async isOrganizationOwner(userId, orgId) {
      if (!userId || !orgId) return false;
      try {
        const objectId = new db.mongoose.Types.ObjectId(orgId);
        return await Organization.exists({
          _id: objectId,
          owner: userId,
        });
      } catch (error) {
        console.error('Error checking organization ownership:', error);
        return false;
      }
    },

    // Получить права пользователя в организации
    async getUserOrganizationRights(userId, orgId) {
      if (!userId || !orgId) return null;
      try {
        const objectId = new db.mongoose.Types.ObjectId(orgId);
        
        // Проверяем владельца
        const isOwner = await this.isOrganizationOwner(userId, orgId);
        if (isOwner) {
          // Владелец имеет все права
          const defaultAccesses = new Department().accesses;
          return {
            isOwner: true,
            rights: defaultAccesses,
            departments: []
          };
        }

        // Проверяем департаменты
        const departments = await Department.find({
          organization: objectId,
          'members.user': userId,
        });

        if (!departments.length) return null;

        // Объединяем права из всех департаментов
        const combinedRights = {};
        departments.forEach(dept => {
          Object.entries(dept.accesses).forEach(([resource, rights]) => {
            if (!combinedRights[resource]) {
              combinedRights[resource] = {};
            }
            Object.entries(rights).forEach(([action, allowed]) => {
              combinedRights[resource][action] = combinedRights[resource][action] || allowed;
            });
          });
        });

        return {
          isOwner: false,
          rights: combinedRights,
          departments: departments.map(d => ({
            _id: d._id,
            name: d.name,
            accesses: d.accesses,
            members: d.members // Добавляем members для проверки permissions
          }))
        };
      } catch (error) {
        console.error('Error getting user organization rights:', error);
        return null;
      }
    },

    // Проверка конкретного права
    async hasOrganizationRight(userId, orgId, resource, action) {
      const rights = await this.getUserOrganizationRights(userId, orgId);
      return rights?.rights?.[resource]?.[action] || false;
    },

    // Получить организацию из контекста
    getOrganizationId(context) {
      const { currentResource, data } = context;
      
      if (currentResource?.owner?.type === 'organization') {
        return String(currentResource.owner.target);
      }
      if (data?.owner?.type === 'organization') {
        return String(data.owner.target);
      }
      if (data?.organization) {
        return String(data.organization);
      }
      if (currentResource?.organization) {
        return String(currentResource.organization);
      }
      
      return null;
    }
  };

  // Функция для добавления хелперов в контекст
  const enhanceContext = (context) => {
    context.organizationHelpers = organizationHelpers;
    context.checkOrganizationOwner = async (orgId = null) => {
      const organizationId = orgId || organizationHelpers.getOrganizationId(context);
      if (!organizationId || !context.user) return false;
      return organizationHelpers.isOrganizationOwner(context.user, organizationId);
    };
    context.checkOrganizationRight = async (resource, action, orgId = null) => {
      const organizationId = orgId || organizationHelpers.getOrganizationId(context);
      if (!organizationId || !context.user) return false;
      return organizationHelpers.hasOrganizationRight(context.user, organizationId, resource, action);
    };
    context.getOrganizationRights = async (orgId = null) => {
      const organizationId = orgId || organizationHelpers.getOrganizationId(context);
      if (!organizationId || !context.user) return null;
      return organizationHelpers.getUserOrganizationRights(context.user, organizationId);
    };
  };

  // ВАЖНО: Регистрируем расширение для обогащения ВСЕХ контекстов
  abacAccessControl.registerExtension('OrganizationHelpers', async (context) => {
    // Добавляем хелперы во все контексты
    enhanceContext(context);
    
    // Расширение должно возвращать результат проверки
    // В данном случае просто разрешаем продолжить проверку
    return {
      allow: true,
      reason: 'ORGANIZATION_HELPERS_ADDED'
    };
  });

  // Регистрация глобальной политики
  abacAccessControl.registerGlobalPolicy('OrganizationAccessPolicy', async context => {
    // Хелперы уже добавлены через расширение, но для совместимости добавим еще раз
    if (!context.checkOrganizationOwner) {
      enhanceContext(context);
    }
    
    const { user, resource, data, action, currentResource, req } = context;
    
    if (!resource || !action) {
      return {
        allow: false,
        force: false,
        reason: 'MISSING_REQUIRED_PARAMETERS',
      };
    }
    
    // Безопасный поиск ID организации
    const orgId = organizationHelpers.getOrganizationId(context);
    
    // Если не связано с организацией, пропускаем эту политику
    if (!orgId) {
      return {
        allow: true,
        force: false,
        reason: 'NOT_ORGANIZATION_RESOURCE',
      };
    }
    
    // Если пользователь указан, проверяем его доступы
    if (user) {
      try {
        // Проверяем, является ли пользователь владельцем организации
        const isOrgOwner = await organizationHelpers.isOrganizationOwner(user, orgId);
        
        if (isOrgOwner) {
          return {
            allow: true,
            force: true, // Владелец организации получает принудительный доступ
            reason: 'ORGANIZATION_OWNER_ACCESS',
          };
        }
        
        // Проверяем доступы в департаментах
        const hasAccess = await organizationHelpers.hasOrganizationRight(user, orgId, resource, action);
        
        if (hasAccess) {
          return {
            allow: true,
            force: false, // Доступ через департамент не является принудительным
            reason: 'DEPARTMENT_MEMBER_ACCESS',
          };
        }
      } catch (error) {
        console.error('Error checking user access:', error);
        return {
          allow: false,
          force: false,
          reason: 'ORGANIZATION_ACCESS_CHECK_ERROR',
        };
      }
    }
    
    // Если доступа у пользователя нет, переходим к валидации query для публичного доступа
    if (action === 'read' && req && req.query) {
      try {
        // Валидируем параметры запроса
        const validationResult = publicAccessVerifier.verify(req.query, {
          only: ['status'],
        });
        
        // Обновляем query параметры в запросе
        req.query = validationResult.verifiedData;
        
        // Сохраняем результаты валидации
        req.queryValidation = validationResult;
        
        // Проверяем статус ресурса, если он есть
        if (currentResource && !publicAccessVerifier.verifyParam('status', currentResource.status)) {
          return {
            allow: false,
            force: false, // Принудительно запрещаем доступ к непубличным ресурсам
            reason: 'INVALID_RESOURCE_STATUS_FOR_PUBLIC_ACCESS',
          };
        }
        
        if (validationResult.isValid) {
          return {
            allow: true,
            force: false,
            reason: 'PUBLIC_ACCESS_ALLOWED',
          };
        } else {
          return {
            allow: false,
            force: false, // Принудительно запрещаем, если невалидные параметры
            reason: 'INVALID_PUBLIC_ACCESS_PARAMETERS',
          };
        }
      } catch (error) {
        console.error('Error validating query:', error);
        return {
          allow: false,
          force: false,
          reason: 'QUERY_VALIDATION_ERROR',
        };
      }
    }
    
    // Для других операций, кроме read (create, edit, delete),
    // если пользователь не имеет прав, принудительно запрещаем
    if (action !== 'read') {
      return {
        allow: false,
        force: false,
        reason: 'ORGANIZATION_RESOURCE_OPERATION_FORBIDDEN',
      };
    }
    
    // Для read, если не прошли ни одну проверку,
    // принудительно запрещаем доступ к ресурсу организации
    return {
      allow: false,
      force: false,
      reason: 'ORGANIZATION_RESOURCE_ACCESS_DENIED',
    };
  });
  
  // Добавляем методы для управления валидатором в ABAC с защитой от внедрения
  abacAccessControl.updatePublicAccessConfig = newConfig => {
    if (typeof newConfig !== 'object' || newConfig === null) {
      throw new TypeError('Config must be an object');
    }
    publicAccessVerifier.updateConfig(newConfig);
  };
  
  abacAccessControl.getPublicAccessConfig = () => {
    return publicAccessVerifier.getConfig();
  };
  
  // Добавляем сам валидатор для возможности использования в других местах
  abacAccessControl.publicAccessVerifier = publicAccessVerifier;
  
  // Экспортируем хелперы для использования вне политик
  abacAccessControl.organizationHelpers = organizationHelpers;
  
  return abacAccessControl;
});