import crypto from 'crypto';
const fingerprintCache = new Map();
const generateFingerprint = req => {
  const { ip, headers } = req;
  const userAgent = headers['user-agent'];
  const acceptLanguage = headers['accept-language'];
  const key = `${ip}-${userAgent}-${acceptLanguage}`;
  if (fingerprintCache.has(key)) {
    return fingerprintCache.get(key);
  }
  const hash = crypto.createHash('sha256');
  hash.update(key);
  const digest = hash.digest('hex');
  fingerprintCache.set(key, digest);
  return digest;
};
const modelsFactory = db => {
  const Visitor = db.visitor;
  const Request = db.request;
  const visitorLogger = async (req, res, next) => {
    const fingerprint = generateFingerprint(req);
    try {
      // Check if the visitor already exists
      let visitor = await Visitor.findOne({ fingerprint: fingerprint });
      // If visitor does not exist, create a new one
      if (!visitor) {
        visitor = new Visitor({
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          acceptLanguage: req.headers['accept-language'],
          fingerprint: fingerprint,
        });
        await visitor.save();
      }
      // Log the request in a separate model
      const newRequest = new Request({
        visitor: visitor._id,
        path: req.path,
        method: req.method,
        timestamp: new Date(),
      });
      await newRequest.save();
      next();
    } catch (error) {
      console.error('Error processing visitor and request data:', error);
      next();
    }
  };
  return {
    visitorLogger,
  };
};
export default modelsFactory;
