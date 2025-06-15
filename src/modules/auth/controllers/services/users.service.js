import addMembersQuantity from '@martyrs/src/modules/organizations/controllers/utils/addMembersQuantity.js';
import addUserStatusFields from '@martyrs/src/modules/organizations/controllers/utils/addUserStatusFields.js';
import { Types } from 'mongoose';
const ObjectId = { Types }.Types.ObjectId;
const controllerFactory = db => {
  const User = db.user;
  const read = async (req, res) => {
    let query = [];
    let match = {};
    let skip = parseInt(req.query.skip) || 0;
    let limit = parseInt(req.query.limit) || 10;
    let matchConditions = [];
    // Модифицированная проверка _id
    if (req.query._id) {
      // Проверяем, является ли _id валидным ObjectId
      const isValidObjectId = ObjectId.isValid(req.query._id);
      if (isValidObjectId) {
        matchConditions.push({ _id: new ObjectId(req.query._id) });
      } else {
        // Если не ObjectId, ищем по username
        matchConditions.push({ username: req.query._id });
      }
    }
    let search = req.query.search;
    if (search) {
      let regexPattern = '';
      // Экранирование специальных символов в строке поиска
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Проверка, является ли строка поиска потенциальным email
      if (escapedSearch.includes('@')) {
        regexPattern = escapedSearch;
      }
      // Проверка, является ли строка поиска потенциальным телефонным номером
      else if (escapedSearch.match(/^\+?\d{0,14}$/)) {
        regexPattern = escapedSearch;
      }
      // Иначе, предполагаем, что это имя или username
      else {
        regexPattern = `.*${escapedSearch}.*`;
      }
      matchConditions.push({
        $or: [
          { 'profile.name': { $regex: regexPattern, $options: 'i' } },
          { email: { $regex: regexPattern, $options: 'i' } },
          { phone: { $regex: regexPattern, $options: 'i' } },
          { username: { $regex: regexPattern, $options: 'i' } },
        ],
      });
    }
    if (matchConditions.length > 0) query.push({ $match: { $and: matchConditions } });
    query.push({
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'user',
        as: 'orders',
      },
    });
    query.push({
      $lookup: {
        from: 'roles',
        localField: 'roles',
        foreignField: '_id',
        as: 'roles',
      },
    });
    query.push({
      $lookup: {
        from: 'memberships',
        localField: '_id',
        foreignField: 'target',
        as: 'memberships',
      },
    });
    query.push(addMembersQuantity());
    if (req.query.user) query.push(addUserStatusFields(req.query.user));
    query.push({
      $skip: skip,
    });
    query.push({
      $limit: limit,
    });
    try {
      const users = await User.aggregate(query);
      if (!users) {
        return res.status(404).send({ message: 'Users not found.' });
      }
      res.status(200).send(users);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: err });
    }
  };
  const create = async (req, res) => {
    try {
      const newUser = {
        phone: req.body.phone,
        email: req.body.email,
        roles: req.body.roles ? req.body.roles : [],
      };
      const user = await User.create(newUser);
      if (!user) {
        return res.status(404).send({ errorCode: 'USER_NOT_CREATED', message: 'User is not created.' });
      }
      res.status(200).send(user);
    } catch (err) {
      return res.status(500).send({ errorCode: 'INTERNAL_SERVER_ERROR', message: err });
    }
  };
  const update = async (req, res) => {
    try {
      const user = await User.findOneAndUpdate({ _id: req.params._id }, req.body, { new: true });
      if (!user) {
        return res.status(404).send({ errorCode: 'UPDATE_FAILED', message: 'Something wrong when updating user.' });
      }
      res.status(200).send(user);
    } catch (err) {
      return res.status(500).send({ errorCode: 'INTERNAL_SERVER_ERROR', message: err });
    }
  };
  const remove = async (req, res) => {
    try {
      const user = await User.findOneAndDelete({ phone: req.params.phone });
      if (!user) {
        return res.status(404).send({ errorCode: 'DELETION_FAILED', message: 'User is not deleted.' });
      }
      res.status(200).send(user);
    } catch (err) {
      return res.status(500).send({ errorCode: 'INTERNAL_SERVER_ERROR', message: err });
    }
  };
  return {
    read,
    create,
    update,
    remove,
  };
};
export default controllerFactory;
