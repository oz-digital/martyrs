// Создаем фабрику для middleware
const middlewareFactory = db => {
  const User = db.user;
  const Role = db.role;
  const checkDuplicateUsername = async (req, res, next) => {
    const { username } = req.body;
    // Если username не передан, пропускаем проверку
    if (!username) {
      return next();
    }
    try {
      // Ищем пользователя с таким же username, исключая текущего пользователя
      const user = await User.findOne({
        username,
        _id: { $ne: req.body._id }, // Исключаем текущего пользователя из поиска
      });
      if (user) {
        console.log(`USERNAME_ALREADY_USED`);
        res.status(400).send({ errorCode: 'USERNAME_ALREADY_USED' });
        return;
      }
      next();
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: err.message });
    }
  };
  // Ваш middleware для проверки существования пользователя
  const checkUserExist = async (req, res, next) => {
    const { type, email, phone } = req.body;
    let query;
    if (type === 'phone' && phone) {
      query = { phone };
    }
    if (type === 'email' && email) {
      query = { email };
    }
    try {
      const user = await User.findOne(query).exec();
      if (!user) {
        console.log(query);
        res.status(400).send({ errorCode: 'USER_NOT_REGISTERED_YET' });
        return;
      }
      next();
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
  return {
    checkDuplicateUsername,
    checkUserExist,
  };
};
export default middlewareFactory;
