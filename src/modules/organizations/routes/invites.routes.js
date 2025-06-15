import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import controllerFactory from '../controllers/invites.controller.js';
export default (function (app, db) {
  const controller = controllerFactory(db);
  const { verifyInvites } = middlewareFactoryAuth(db);
  // Get one invite
  app.get('/api/invites/get/:_id', controller.getOneByCode);
  // Get all organiztions invite
  app.get('/api/invites/:_id', controller.read);
  // Create invite in organization
  app.post('/api/invites/create', [verifyInvites.checkInviteExist, verifyInvites.checkUsersExist], controller.create);
  // Delete invite in organization
  app.delete('/api/invites/delete/:_id', controller.delete);
});
