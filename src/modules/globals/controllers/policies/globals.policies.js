export default (function initializeDefaultPolicies(abacAccessControl) {
  // Политика личного владения ресурсом
  abacAccessControl.registerGlobalPolicy('AdminModeratorAccessPolicy', async context => {
    const { user, req } = context;
    // Если пользователь не указан, политика не применяется
    if (!user) {
      return { allow: true, force: false };
    }
    try {
      // Вариант 3: загружаем пользователя из базы данных
      const userModel = abacAccessControl.db.user;
      const userDoc = await userModel.findById(user).populate('roles');
      let userRoles = [];
      if (userDoc && userDoc.roles) {
        // Сохраняем документ пользователя в контексте для других политик
        context.userDoc = userDoc;
        // Извлекаем роли из документа
        userRoles = userDoc.roles.map(role => (typeof role === 'string' ? role : role.name || role));
      }
      // Проверяем наличие ролей администратора или модератора
      const isAdmin = userRoles.includes('admin');
      const isModerator = userRoles.includes('moderator');
      
      if (isAdmin || isModerator) {
        if (context.req) {
          context.req.skipFieldPolicies = true;
        }
        // Возвращаем стопроцентный доступ
        return {
          allow: true,
          force: true,
          reason: isAdmin ? 'ADMIN_ACCESS_GRANTED' : 'MODERATOR_ACCESS_GRANTED',
        };
      }
      // Для обычных пользователей не влияем на решение
      return { allow: true, force: false };
    } catch (error) {
      console.error('Error in AdminModeratorPolicy:', error);
      // При ошибке не блокируем доступ, продолжаем другие проверки
      return { allow: true, force: false };
    }
  });
  abacAccessControl.registerGlobalPolicy('PersonalResourceOwnerPolicy', async context => {
    let { user, action, data, currentResource, options } = context;
    const ObjectId = abacAccessControl.db.mongoose.Types.ObjectId;
    // Для create операций с владением пользователя
    if (action === 'create' && data.owner?.type === 'user') {
      // Проверяем, что пользователь создает ресурс от своего имени
      if (data.owner.target === user && data.creator.target === user) {
        return { allow: true, force: false };
      } else {
        return {
          allow: false,
          force: false,
          reason: 'UNAUTHORIZED_RESOURCE_CREATION',
        };
      }
    }
    if (action === 'read') {
      // Список разрешенных статусов для неавторизованных пользователей
      const allowedPublicStatuses = ['published', 'active', 'featured'];
      // Для неавторизованных пользователей или не владельцев
      if (!user || (currentResource && currentResource.creator && !currentResource.creator.target.equals(new ObjectId(user)))) {
        if (context.req && context.req.query) {
          // Если статус указан в запросе, проверяем его
          if (context.req.query.status) {
            // Проверка массива статусов
            if (Array.isArray(context.req.query.status)) {
              // Проверяем, что каждый статус из массива находится в списке разрешенных
              for (const queryStatus of context.req.query.status) {
                if (!allowedPublicStatuses.includes(queryStatus)) {
                  return {
                    allow: false,
                    force: true, // Стопроцентный запрет для неразрешенных статусов
                    reason: 'UNAUTHORIZED_STATUS_ACCESS',
                  };
                }
              }
            } else {
              // Проверка одиночного статуса
              if (!allowedPublicStatuses.includes(context.req.query.status)) {
                return {
                  allow: false,
                  force: true, // Стопроцентный запрет для неразрешенных статусов
                  reason: 'UNAUTHORIZED_STATUS_ACCESS',
                };
              }
            }
          }
        }
        // Для единичного ресурса
        if (currentResource && !allowedPublicStatuses.includes(currentResource.status)) {
          return {
            allow: false,
            force: true, // Стопроцентный запрет для неразрешенных статусов
            reason: 'UNAUTHORIZED_RESOURCE_ACCESS',
          };
        }
      }
      // По умолчанию не влияем на решение для read
      return { allow: true, force: false };
    }
    // Для update и delete операций
    if ((action === 'edit' || action === 'delete') && currentResource && currentResource.owner?.type === 'user') {
      // Проверяем владельца
      if (currentResource.creator.target.equals(new ObjectId(user))) {
        return { allow: true, force: false };
      } else {
        return {
          allow: false,
          force: false,
          reason: 'NOT_RESOURCE_OWNER',
        };
      }
    }
    // По умолчанию не влияем на решение
    return { allow: true, force: false };
  });
  return abacAccessControl;
});
