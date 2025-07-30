import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import controllerFactory from '../controllers/invites.controller.js';
export default (function (app, db) {
  const controller = controllerFactory(db);
  const { verifyInvites } = middlewareFactoryAuth(db);
  // Read invites with query parameters
  app.get('/api/invites/read', controller.read);
  // Get one invite by code
  app.get('/api/invites/get/:_id', controller.getOneByCode);
  // Create invite in organization
  app.post('/api/invites/create', [verifyInvites.checkInviteExist, verifyInvites.checkUsersExist], controller.create);
  // Update invite
  app.put('/api/invites/update', controller.update);
  // Delete invite in organization
  app.post('/api/invites/delete', controller.delete);
});
