import * as mongodb from 'mongodb';
const { ObjectId } = mongodb;
const middlewareFactory = db => {
  const User = db.user;
  const Invite = db.invite;
  const Membership = db.membership;
  const checkInviteExist = async (req, res, next) => {
    for (let invite of req.body.invites) {
      let query;
      if (invite.contact.includes('@')) {
        query = { invitedEmail: invite.contact };
      } else {
        query = { invitedPhone: invite.contact };
      }
      query['owner.target'] = req.body.owner.target;
      const userInvite = await Invite.findOne(query).exec();
      if (userInvite) {
        console.log(userInvite);
        res.status(400).send({ message: 'Инвайт c таким email или телефоном уже создан!' });
        return;
      }
    }
    next();
  };
  const checkUsersExist = async (req, res, next) => {
    for (let invite of req.body.invites) {
      let query;
      if (invite.contact.includes('@')) {
        query = { email: invite.contact };
      } else {
        query = { phone: invite.contact };
      }
      const user = await User.findOne(query).exec();
      console.log(req.params);
      if (user) {
        const membership = await Membership.findOne({
          user: new ObjectId(user._id),
          'owner.target': req.body.owner.target,
        }).exec();
        if (membership) {
          console.log(membership);
          res.status(400).send({
            message: 'Пользователь с таким email или телефоном уже добавлен в организацию!',
          });
          return;
        }
      }
    }
    next();
  };
  return {
    checkInviteExist,
    checkUsersExist,
  };
};
export default middlewareFactory;
