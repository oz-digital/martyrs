import jwt from 'jsonwebtoken';

const middlewareFactory = db => {
  console.log('[Middleware Factory] Initializing middleware factory');
  
  const User = db.user;
  const Role = db.role;
  
  const verifyToken = (continueOnFail = false) => {
    console.log('[Middleware Factory] Creating verifyToken middleware, continueOnFail:', continueOnFail);
    
    return async (req, res, next) => {
      console.log('[VerifyToken] Middleware called');
      console.log('[VerifyToken] Headers:', req.headers);
      console.log('[VerifyToken] Cookies:', req.cookies);
      
      try {
        let token = req.headers['x-access-token'];
        console.log('[VerifyToken] Token from header:', token);
        
        if (!token && req.cookies && req.cookies.user) {
          console.log('[VerifyToken] Trying to get token from cookies');
          let user = JSON.parse(req.cookies.user);
          token = user.accessToken;
          console.log('[VerifyToken] Token from cookies:', token);
        }
        
        if (req.headers['x-service-key']) {
          console.log('[VerifyToken] Service key detected');
          const serviceKey = req.headers['x-service-key'];
          const validServiceKey = process.env.SERVICE_KEY;
          
          if (serviceKey !== validServiceKey) {
            console.log('[VerifyToken] Invalid service key');
            return res.status(403).send({ message: 'Unauthorized: Invalid service key' });
          }
          
          req.isServiceRequest = true;
          console.log('[VerifyToken] Service request validated');
          return next();
        }
        
        if (!token) {
          console.log('[VerifyToken] No token found');
          req.userId = null;
          
          if (continueOnFail) {
            console.log('[VerifyToken] Continue on fail enabled, proceeding');
            return next();
          } else {
            console.log('[VerifyToken] Returning 401 - No token');
            return res.status(401).send({ message: 'Unauthorized: No token provided' });
          }
        }
        
        console.log('[VerifyToken] Verifying token with secret');
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log('[VerifyToken] Token decoded:', decoded);
        
        req.userId = decoded._id;
        req.user = {
          _id: decoded._id,
        };
        
        console.log('[VerifyToken] userId set to:', req.userId);
        next();
      } catch (err) {
        console.log('[VerifyToken] Error:', err.message);
        req.userId = null;
        
        if (continueOnFail) {
          console.log('[VerifyToken] Error but continue on fail enabled');
          next();
        } else {
          console.log('[VerifyToken] Returning 401 - Invalid token');
          res.status(401).send({ message: 'Unauthorized: Invalid token' });
        }
      }
    };
  };
  
  const checkRole = roleToCheck => async (req, res, next) => {
    console.log('[CheckRole] Checking role:', roleToCheck);
    console.log('[CheckRole] userId:', req.userId);
    
    try {
      const user = await User.findById(req.userId).exec();
      if (!user) {
        console.log('[CheckRole] User not found');
        return res.status(404).send({ message: 'User Not found.' });
      }
      
      const roles = await Role.find({ _id: { $in: user.roles } }).exec();
      console.log('[CheckRole] User roles:', roles.map(r => r.name));
      
      for (let role of roles) {
        if (role.name === roleToCheck) {
          console.log('[CheckRole] Role found, proceeding');
          next();
          return;
        }
      }
      
      console.log('[CheckRole] Role not found');
      res.status(403).send({ message: `Require ${roleToCheck} Role!` });
    } catch (err) {
      console.log('[CheckRole] Error:', err.message);
      res.status(500).send({ message: err.message });
    }
  };
  
  const isAdmin = checkRole('admin');
  const isModerator = checkRole('moderator');
  
  const authJwt = {
    verifyToken,
    isAdmin,
    isModerator,
  };
  
  console.log('[Middleware Factory] Returning authJwt object:', Object.keys(authJwt));
  
  return authJwt;
};

export default middlewareFactory;