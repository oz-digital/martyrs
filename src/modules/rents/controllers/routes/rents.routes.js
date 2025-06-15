import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import globalsabac from '@martyrs/src/modules/globals/controllers/classes/globals.abac.js';
import controllerFactory from '../services/rents.services.js';
// const middlewareFactoryRents = require('../middlewares/rent');
// ABAC
const { getInstance } = globalsabac;
export default (function (app, db) {
  const controller = controllerFactory(db);
  const abac = getInstance(db);
  // Middleware для аутентификации
  const { authJwt } = middlewareFactoryAuth(db);
  // Middleware для валидации rent-specific данных
  // const { verifyRent } = middlewareFactoryRents(db);
  // Чтение записей об аренде
  app.get(
    '/api/rents',
    [
      authJwt.verifyToken(), // Требуется аутентификация
      abac.middleware('rents', 'read'),
    ],
    controller.read
  );
  // Создание записи об аренде
  app.post(
    '/api/rents',
    [
      authJwt.verifyToken(), // Требуется аутентификация
      abac.middleware('rents', 'create'), // Проверка прав доступа
      // verifyRent.checkRequiredFields, // Проверка обязательных полей
      // verifyRent.checkAvailability // Проверка доступности
    ],
    controller.create
  );
  // Обновление записи об аренде
  app.put(
    '/api/rents/update',
    [
      authJwt.verifyToken(), // Требуется аутентификация
      abac.middleware('rents', 'update'), // Проверка прав доступа
    ],
    controller.update
  );
  // Удаление записи об аренде
  app.delete(
    '/api/rents/:id',
    [
      authJwt.verifyToken(), // Требуется аутентификация
      abac.middleware('rents', 'delete'), // Проверка прав доступа
    ],
    controller.delete
  );
  // Проверка доступности
  app.get(
    '/api/rents/availability',
    [
      authJwt.verifyToken(true),
      abac.middleware('rents', 'read', {
        allowUnauthenticated: true, // Разрешить неаутентифицированным пользователям
      }),
    ],
    controller.getAvailability
  );
});
