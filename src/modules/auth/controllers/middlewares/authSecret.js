import crypto from 'crypto';
const middlewareFactory = () => {
  const verifySecret = (method, endpoint, secret) => async (req, res, next) => {
    const requestSignature = req.headers.signature;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(method + endpoint)
      .digest('hex');
    if (signature === requestSignature) {
      return next();
    }
    res.status(403).send('Forbidden');
  };
  return { verifySecret };
};
export default middlewareFactory;
