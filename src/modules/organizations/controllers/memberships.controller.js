import queryProcessorCore from '@martyrs/src/modules/core/controllers/utils/queryProcessor.js';
import { Types } from 'mongoose';
const ObjectId = { Types }.Types.ObjectId;
const controllerFactory = db => {
  const Membership = db.membership;
  const Department = db.department;
  const read = async (req, res) => {
    try {
      let search = req.query.search;
      let regexPattern = '';
      if (search) {
        // Экранируем специальные символы
        search = search.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const parts = search.split('.');
        if (parts.length === 2) {
          // Создаем паттерн для точного соответствия каждой части
          regexPattern = parts.join('\\.');
        } else {
          // Если нет точки, применяем точное соответствие ко всей строке
          regexPattern = search;
        }
      }
      const memberships = await Membership.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $match: {
            ...(req.query.user && { user: new ObjectId(req.query.user) }),
            ...(req.query.type && { type: req.query.type }),
            ...(req.query.target && { target: new ObjectId(req.query.target) }),
            ...(req.query.role && { role: { $in: req.query.role } }),
            ...(req.query.search && {
              $or: [
                { 'user.profile.name': { $regex: regexPattern, $options: 'i' } },
                { 'user.email': { $regex: regexPattern, $options: 'i' } },
                { 'user.phone': { $regex: regexPattern, $options: 'i' } },
              ],
            }),
          },
        },
        {
          $unwind: '$user',
        },
        {
          $project: {
            _id: 1,
            user: {
              _id: 1,
              profile: 1,
              roles: 1,
              phone: 1,
              email: 1,
              username: 1,
              socials: 1,
              status: 1,
              createdAt: 1,
              updatedAt: 1
            },
            type: 1,
            role: 1,
            label: 1,
            target: 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        // Sorting and Pagination
        ...queryProcessorCore.getSortingOptions(req.query.sortParam, req.query.sortOrder),
        ...queryProcessorCore.getPaginationOptions(req.query.skip, req.query.limit),
      ]);
      if (!memberships) {
        return res.status(404).send({ errorCode: 'MEMBERSHIPS_NOT_FOUND' });
      }
      res.send(memberships);
    } catch (err) {
      console.log(err);
      res.status(500).send({ errorCode: 'SERVER_ERROR' });
    }
  };
  const create = async (req, res) => {
    const newMembership = new Membership({
      user: req.body.user,
      type: req.body.type,
      target: req.body.target,
      role: req.body.role,
    });
    try {
      const data = await newMembership.save();
      const populated = await Membership.findById(data._id)
        .populate('user', '-password');
      res.send(populated);
    } catch (err) {
      console.log(err);
      res.status(500).send({ errorCode: 'SERVER_ERROR' });
    }
  };
  const update = async (req, res) => {
    try {
      const membership = await Membership.findByIdAndUpdate(req.body._id, req.body, { new: true })
        .populate('user', '-password');
      if (!membership) {
        return res.status(404).send({ errorCode: 'MEMBERSHIP_NOT_FOUND' });
      }
      res.send(membership);
    } catch (err) {
      res.status(500).send({ errorCode: 'SERVER_ERROR' });
    }
  };
  const deleteMembership = async (req, res) => {
    const { _id, type, target, user, role } = req.body;
    console.log('Delete membership request:', { _id, type, target, user, role });
    try {
      // Обрабатываем сценарий когда мы не знаем _id нашего membership
      const query = _id 
        ? { _id: new ObjectId(_id) } 
        : { 
            type, 
            target: new ObjectId(target), 
            user: new ObjectId(user), 
            role 
          };
      console.log('Delete query:', query);
      
      const membership = await Membership.findOneAndDelete(query);
      console.log('Deleted membership:', membership);
      
      if (!membership) {
        return res.status(404).send({ errorCode: 'MEMBERSHIP_NOT_FOUND' });
      }
      // Удаление пользователя из departments
      if (membership.type === 'organization') {
        await Department.updateMany({ organization: target }, { $pull: { members: { user: user } } });
      }
      res.status(200).send(membership);
    } catch (error) {
      console.log(error);
      res.status(500).send({ errorCode: 'SERVER_ERROR' });
    }
  };
  return {
    read,
    create,
    update,
    deleteMembership,
  };
};
export default controllerFactory;
