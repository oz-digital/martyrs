import mailing from '@martyrs/src/modules/globals/controllers/utils/mailing.js';
import { uuid } from 'uuidv4';
const { sendEmail, sendSms } = mailing;
const сontrollerFactory = db => {
  const User = db.user;
  const Invite = db.invite;
  const Membership = db.membership;
  const getOneByCode = async (req, res) => {
    try {
      const invite = await Invite.findOne({ code: req.params._id });
      if (!invite) {
        return res.status(404).send({ message: 'Приглашение не найдено' });
      }
      res.send(invite);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
  const read = async (req, res) => {
    try {
      const invites = await Invite.find({ 'owner.target': req.params._id });
      if (!invites || invites.length === 0) {
        return res.status(200).send([]);
      }
      res.send(invites);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
  const create = async (req, res) => {
    const creator = req.body.creator;
    const owner = req.body.owner;
    const list = req.body.invites;
    const createdInvites = [];
    const createdMemberships = [];
    try {
      for (let invite of list) {
        let user = null;
        if (!invite || !invite.contact) {
          continue; // Пропускаем пустые объекты или объекты без contact
        }
        if (invite.contact.includes('@')) {
          user = await User.findOne({ email: invite.contact });
        } else {
          user = await User.findOne({ phone: invite.contact });
        }
        if (user) {
          const membership = new Membership({
            user: user._id,
            type: 'organization',
            target: req.body.owner.target,
            role: 'member',
            label: 'member',
          });
          const savedMembership = await membership.save();
          createdMemberships.push(savedMembership);
        } else {
          const newInvite = new Invite({
            code: uuid(),
            creator: creator,
            owner: owner,
            role: 'member',
            email: invite.contact.includes('@') ? invite.contact : null,
            phone: !invite.contact.includes('@') ? invite.contact : null,
          });
          const savedInvite = await newInvite.save();
          createdInvites.push(savedInvite);
          if (savedInvite.email !== null) {
            const to = savedInvite.email;
            const subject = 'You have been added to the organization';
            const text = `You have been invited to join an organization on ${process.env.APP_NAME}! Use this link to register: ${process.env.API_URL}/auth/invite?inviteCode=${newInvite.code}&type=email`;
            await sendEmail(to, subject, text);
          }
          if (savedInvite.phone !== null) {
            const phone = savedInvite.phone;
            const message = `You have been invited to join an organization on ${process.env.APP_NAME}! Use this link to register: ${process.env.API_URL}/auth/invite?inviteCode=${newInvite.code}&type=phone`;
            await sendSms(phone, message);
          }
        }
      }
      res.status(200).json({
        message: 'Invites sent successfully!',
        createdInvites: createdInvites,
        createdMemberships: createdMemberships,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  };
  const deleteInvite = async (req, res) => {
    try {
      const invite = await Invite.findOneAndDelete({ _id: req.params._id });
      if (!invite) {
        return res.status(404).send({ message: 'Invite not found' });
      }
      res.send({ message: 'Invite deleted successfully' });
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
  return {
    getOneByCode,
    read,
    create,
    delete: deleteInvite,
  };
};
export default сontrollerFactory;
