import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import rewardsControllerFactory from '../factories/rewards.factory.js';
export default (app, db, wss, wdmClient, origins) => {
  const controller = rewardsControllerFactory(db, wdmClient, wss);
  const { authJwt, authSecret } = middlewareFactoryAuth(db);
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');
    next();
  });
  app.get('/api/crypto/rewards', [authJwt.verifyToken], controller.listRewards);
  app.post('/api/crypto/collect', [authJwt.verifyToken], controller.collectTokens);
  app.post('/api/crypto/deposit', [authJwt.verifyToken], controller.requestDeposit);
  app.post('/api/crypto/deposit/cancel', [authJwt.verifyToken], controller.cancelDeposit);
  app.post('/api/crypto/deposit/update', [authSecret.verifySecret('POST', '/api/crypto/deposit/update', process.env.WDM_SECRET)], controller.handleDepositUpdate);
  app.get('/api/crypto/deposit/config', [], controller.getDepositConfig);
};
