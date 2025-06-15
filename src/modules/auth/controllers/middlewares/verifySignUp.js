// Фабрика для middleware
const middlewareFactory = db => {
  const User = db.user;
  const Role = db.role;
  const checkDuplicateUsernameOrEmail = async (req, res, next) => {
    const { type, email, phone } = req.body;
    console.log(req.body);
    let query;
    if (type === 'phone' && phone) {
      query = { phone };
    }
    if (type === 'email' && email) {
      query = { email };
    }
    try {
      const user = await User.findOne(query).exec();
      if (user) {
        console.log(`USER_ALREADY_REGISTERED`);
        res.status(400).send({ errorCode: 'USER_ALREADY_REGISTERED' });
        return;
      }
      next();
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: err.message });
    }
  };
  const checkRolesExisted = (req, res, next) => {
    // if (req.body.roles) {
    //   for (let i = 0; i < req.body.roles.length; i++) {
    //     if (!ROLES.includes(req.body.roles[i])) {
    //       console.log(`Failed! Role ${req.body.roles[i]} does not exist!`)
    //       res.status(400).send({
    //         message: `Failed! Role ${req.body.roles[i]} does not exist!`
    //       });
    //       return;
    //     }
    //   }
    // }
    next();
  };
  return {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted,
  };
};
export default middlewareFactory;
