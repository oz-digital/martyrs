const middlewareFactory = db => {
  const User = db.user;
  const Organization = db.organization;
  const Department = db.department;
  const verifyAccess = (resource, accessType) => {
    return async (req, res, next) => {
      try {
        const userId = req.userId ? new db.mongoose.Types.ObjectId(req.userId) : null;
        let ownerData = req.body.owner || req.query.owner;
        let accessResult = {
          isAuthenticated: userId !== null,
          isOrgOwner: false,
          isOrgMember: false,
          isAuthorized: false,
          isPersonalOwner: false,
        };
        // Проверка, является ли owner объектом
        if (typeof ownerData === 'object' && ownerData !== null) {
          if (ownerData.type === 'Organization') {
            ownerData = ownerData.target;
          } else if (ownerData.type === 'User') {
            accessResult.isPersonalOwner = ownerData.target === userId.toString();
          }
        }
        // Если это личный ресурс пользователя
        if (accessResult.isPersonalOwner) {
          accessResult.isAuthorized = true;
          req.accessResult = accessResult;
          return next();
        }
        // Если owner - организация
        if (!accessResult.isPersonalOwner) {
          console.log('owner data', ownerData);
          const ownerOrgId = new db.mongoose.Types.ObjectId(ownerData);
          // Проверка на владельца организации
          accessResult.isOrgOwner = await Organization.exists({
            _id: ownerOrgId,
            owner: userId,
          });
          if (accessResult.isOrgOwner) {
            accessResult.isAuthorized = true;
            req.accessResult = accessResult;
            return next();
          }
          // Проверка членства в организации
          const departments = await Department.find({
            organization: ownerOrgId,
            'members.user': userId,
          });
          accessResult.isOrgMember = departments.length > 0;
          if (accessResult.isOrgMember) {
            // Проверка прав доступа
            accessResult.isAuthorized = departments.some(department => {
              const accessRights = department.accesses[resource];
              return accessRights && accessRights[accessType];
            });
          }
        }
        req.accessResult = accessResult;
        next();
      } catch (err) {
        console.error('Access control errorCode:', err);
        return res.status(403).json({ errorCode: 'ACCESS_DENIED' });
      }
    };
  };
  const handleAccessResult = (options = {}) => {
    return (req, res, next) => {
      const { accessResult } = req;
      console.log('accesses is', accessResult);
      if (!accessResult) {
        return res.status(500).json({ errorCode: 'INTERNAL_ERROR' });
      }
      // Проверка аутентификации
      if (!accessResult.isAuthenticated && !options.allowUnauthenticated) {
        return res.status(401).json({ errorCode: 'UNAUTHORIZED' });
      }
      // Обработка различных сценариев доступа
      if (accessResult.isAuthorized || accessResult.isPersonalOwner) {
        // Пользователь авторизован или является личным владельцем, разрешаем доступ
        return next();
      } else if (options.allowPublished && req.method === 'GET') {
        // Разрешаем доступ только к опубликованным ресурсам для GET-запросов
        req.query.status = 'published';
        return next();
      } else if (options.customCheck && options.customCheck(accessResult, req)) {
        // Пользовательская проверка доступа
        return next();
      }
      // Если ни одно из условий не выполнено, отказываем в доступе
      return res.status(403).json({ errorCode: 'ACCESS_DENIED' });
    };
  };
  return {
    verifyAccess,
    handleAccessResult,
  };
};
export default middlewareFactory;
