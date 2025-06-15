import accessControl from '@martyrs/src/modules/access-control.js';
import mongoose from 'mongoose';
const { AccessControlManager, PolicyRule } = accessControl;
const middlewareFactory = db => {
  // Получаем модели из базы данных
  const User = db.user;
  const Organization = db.organization;
  const Department = db.department;
  // Создаем абстрактный менеджер контроля доступа
  const createAccessControlManager = resourceName => {
    const accessControlManager = new AccessControlManager({
      User,
      Organization,
      Department,
      [resourceName]: db[resourceName.toLowerCase()],
    });
    // Политика по умолчанию для владения личным ресурсом
    accessControlManager.registerPolicy(
      new PolicyRule('PersonalResourceOwnerPolicy', async attributes => {
        // Проверка личного владения ресурсом
        if (attributes.resource.owner?.type === 'User') {
          return {
            allowed: attributes.resource.owner.target === attributes.user.id,
            reason: 'Personal resource ownership',
          };
        }
        return { allowed: false };
      })
    );
    // Политика для организационных ресурсов
    accessControlManager.registerPolicy(
      new PolicyRule('OrganizationAccessPolicy', async attributes => {
        // Проверка доступа к ресурсам организации
        if (attributes.resource.owner?.type === 'Organization') {
          const orgId = attributes.resource.owner.target;
          // Проверка на владельца организации
          const isOrgOwner = await Organization.exists({
            _id: new mongoose.Types.ObjectId(orgId),
            owner: attributes.user.id,
          });
          if (isOrgOwner) {
            return {
              allow: true,
              force: true,
              reason: 'Organization Owner',
            };
          }
          // Проверка членства в организации и прав доступа
          const departments = await Department.find({
            organization: new mongoose.Types.ObjectId(orgId),
            'members.user': attributes.user.id,
          });
          // Динамическая проверка прав доступа для конкретного ресурса и действия
          const hasAccess = departments.some(department => {
            const accessRights = department.accesses[resourceName];
            return accessRights && accessRights[attributes.action.type];
          });
          return {
            allowed: hasAccess,
            reason: hasAccess ? 'Organization Member with Access Rights' : 'No Access Rights in Organization',
          };
        }
        return { allowed: false };
      })
    );
    return accessControlManager;
  };
  // Создаем методы verify и handle для совместимости со старым подходом
  const verifyAccess = (resource, accessType, options = {}) => {
    return async (req, res, next) => {
      const accessControlManager = createAccessControlManager(resource);
      const context = {
        userId: req.userId ? new db.mongoose.Types.ObjectId(req.userId) : null,
        userRoles: req.user ? req.user.roles : [],
        userDepartments: req.user ? req.user.departments : [],
        resourceType: resource,
        resourceOwner: req.body.owner || req.query.owner,
        resourceStatus: req.body?.status || req.query?.status,
        actionType: accessType,
        requestMethod: req.method,
        ipAddress: req.ip,
        deviceType: req.get('User-Agent'),
      };
      const accessResult = await accessControlManager.checkAccess(context);
      // Формируем accessResult в старом формате для обратной совместимости
      req.accessResult = {
        isAuthenticated: context.userId !== null,
        isOrgOwner: accessResult.reason === 'Organization Owner',
        isOrgMember: accessResult.reason.includes('Organization Member'),
        isAuthorized: accessResult.allowed,
        isPersonalOwner: accessResult.reason === 'Personal resource ownership',
      };
      next();
    };
  };
  const handleAccessResult = (options = {}) => {
    return (req, res, next) => {
      const { accessResult } = req;
      if (!accessResult) {
        return res.status(500).json({ errorCode: 'INTERNAL_ERROR' });
      }
      // Проверка аутентификации
      if (!accessResult.isAuthenticated && !options.allowUnauthenticated) {
        return res.status(401).json({ errorCode: 'UNAUTHORIZED' });
      }
      // Обработка различных сценариев доступа
      if (accessResult.isAuthorized || accessResult.isPersonalOwner) {
        return next();
      } else if (options.allowPublished && req.method === 'GET') {
        req.query.status = 'published';
        return next();
      } else if (options.customCheck && options.customCheck(accessResult, req)) {
        return next();
      }
      return res.status(403).json({ errorCode: 'ACCESS_DENIED' });
    };
  };
  return {
    verifyAccess,
    handleAccessResult,
  };
};
export default middlewareFactory;
