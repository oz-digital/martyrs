// Импортируем модули middleware
import authJwtModule from './authJwt.js';
import authSecretModule from './authSecret.js';
import verifySignUpModule from './verifySignUp.js';
import verifyUserModule from './verifyUser.js';
import verifyInvitesModule from './verifyInvites.js';

const middlewareIndexFactory = db => {
  const authJwt = authJwtModule(db);
  const authSecret = authSecretModule();
  const verifySignUp = verifySignUpModule(db);
  const verifyUser = verifyUserModule(db);
  const verifyInvites = verifyInvitesModule(db);
  
  return {
    authJwt,
    authSecret,
    verifySignUp,
    verifyUser,
    verifyInvites,
  };
};

export default middlewareIndexFactory;