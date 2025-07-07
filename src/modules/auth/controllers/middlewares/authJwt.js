import jwt from 'jsonwebtoken';

const middlewareFactory = db => {
  
  const User = db.user;
  const Role = db.role;
  
  const verifyToken = (continueOnFail = false) => {
    
    return async (req, res, next) => {
      
      try {
        let token = req.headers['x-access-token'];
        
        if (!token && req.cookies && req.cookies.user) {
          let user = JSON.parse(req.cookies.user);
          token = user.accessToken;
        }
        
        if (req.headers['x-service-key']) {
          const serviceKey = req.headers['x-service-key'];
          const validServiceKey = process.env.SERVICE_KEY;
          
          if (serviceKey !== validServiceKey) {
            return res.status(403).send({ message: 'Unauthorized: Invalid service key' });
          }
          
          req.isServiceRequest = true;
          return next();
        }
        
        if (!token) {
          req.userId = null;
          
          if (continueOnFail) {
            return next();
          } else {
            return res.status(401).send({ message: 'Unauthorized: No token provided' });
          }
        }
        
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        req.userId = decoded._id;
        req.user = {
          _id: decoded._id,
        };
        
        next();
      } catch (err) {
        req.userId = null;
        
        if (continueOnFail) {
          next();
        } else {
          res.status(401).send({ message: 'Unauthorized: Invalid token' });
        }
      }
    };
  };
  
  const checkRole = roleToCheck => async (req, res, next) => {
    
    try {
      const user = await User.findById(req.userId).exec();
      if (!user) {
        console.log('[CheckRole] User not found');
        return res.status(404).send({ message: 'User Not found.' });
      }
      
      const roles = await Role.find({ _id: { $in: user.roles } }).exec();
      
      for (let role of roles) {
        if (role.name === roleToCheck) {
          next();
          return;
        }
      }
      res.status(403).send({ message: `Require ${roleToCheck} Role!` });
    } catch (err) {
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
  
  return authJwt;
};

export default middlewareFactory;