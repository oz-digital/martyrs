import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { verifyAppleIdToken } from '../utils/verifyAppleIdToken.js';
const ObjectId = { Types }.Types.ObjectId;
// Factory
const controllerFactory = db => {
  const User = db.user;
  const Membership = db.membership;
  const Department = db.department;
  const Organization = db.organization;
  const Invite = db.invite;
  const Role = db.role;
  const signin = async (req, res) => {
    const { type, email, phone, authorization } = req.body;
    let query;
    let payload = null;
    if (type === 'phone' && phone) {
      query = { phone };
    }
    if (type === 'email' && email) {
      query = { email };
    }
    if (type === 'apple' && authorization.id_token) {
      payload = await verifyAppleIdToken(authorization.id_token);
      if (payload) {
        query = { apple_id: payload.sub };
      } else {
        return res.status(401).send({ errorCode: 'INVALID_APPLE_ID_TOKEN' });
      }
    }
    try {
      let user = await User.findOne(query).populate('roles').exec();
      if (type !== 'apple' && !user) {
        return res.status(404).send({ errorCode: 'USER_NOT_FOUND' });
      }
      if (type === 'apple' && !user) {
        const { firstName, lastName } = req.body.user.name;
        const newUser = new User({
          apple_id: payload.sub,
          email: payload.email,
          profile: { name: `${firstName} ${lastName}` },
        });
        await newUser.save();
        user = newUser;
      } else if (!user) {
        return res.status(404).send({ errorCode: 'USER_NOT_FOUND' });
      }
      if (type === 'email' || type === 'phone') {
        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) {
          return res.status(401).send({ errorCode: 'INCORRECT_PASSWORD_ENTERED', accessToken: null });
        }
      }
      const token = jwt.sign(
        {
          _id: user._id,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: 864000,
        }
      );
      const authorities = user.roles.map(role => `ROLE_${role.name.toUpperCase()}`);
      res.status(200).send({
        _id: user._id,
        username: user.username,
        avatar: user.profile.photo,
        phone: user.phone,
        email: user.email,
        roles: authorities,
        accessToken: token,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err });
    }
  };
  const signup = async (req, res) => {
    const { type, email, phone, inviteCode } = req.body;
    let invite = null;
    if (inviteCode) {
      try {
        invite = await Invite.findOne({ code: inviteCode, status: 'active' });
        if (!invite) {
          return res.status(400).json({ errorCode: 'INVALID_INVITATION_CODE' });
        }
      } catch (err) {
        return res.status(500).send({ message: err });
      }
    }
    let userData = {
      password: bcrypt.hashSync(req.body.password, 8),
    };
    if (type === 'email') {
      userData.email = email;
    } else if (type === 'phone') {
      userData.phone = phone;
    }
    const user = new User(userData);
    try {
      await user.save();
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err });
    }
    try {
      const role = await Role.findOne({ name: 'user' });
      user.roles = [role._id];
      await user.save();
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: err });
    }
    if (invite) {
      invite.status = 'used';
      await invite.save();
      const newMembership = new Membership({
        type: 'organization',
        user: new ObjectId(user._id),
        target: new ObjectId(invite.owner.target),
        role: invite.role,
        label: invite.role,
      });
      try {
        await newMembership.save();
      } catch (err) {
        console.log(err);
      }
    }
    const token = jwt.sign(
      {
        _id: user._id,
        organization: invite ? invite.organization : null,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: 86400,
      }
    );
    res.status(200).send({
      _id: user._id,
      phone: user.phone,
      email: user.email,
      accessToken: token,
      organization: {
        _id: invite ? invite.organization : null,
      },
    });
  };
  const updatePassword = async (req, res) => {
    try {
      const { phone, email, password, type } = req.body;
      let query;
      if (type === 'phone' && phone) {
        query = { phone };
      }
      if (type === 'email' && email) {
        query = { email };
      }
      if (!query || !password) {
        return res.status(400).send({ errorCode: 'MISSING_REQUIRED_PARAMETERS' });
      }
      const salt = await bcrypt.genSalt(8); // Generating a salt asynchronously
      const hashedPassword = await bcrypt.hash(password, salt); // Hashing the password asynchronously
      const user = await User.findOneAndUpdate(query, {
        password: hashedPassword,
      })
        .populate('roles')
        .exec();
      if (!user) {
        return res.status(404).send({ errorCode: 'ERROR_UPDATING_USER' });
      }
      const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
        expiresIn: 86400,
      });
      const authorities = user.roles.map(role => `ROLE_${role.name.toUpperCase()}`);
      return res.status(200).send({
        _id: user._id,
        username: user.username,
        avatar: user.profile.photo,
        phone: user.phone,
        email: user.email,
        roles: authorities,
        accessToken: token,
      });
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  };
  return {
    signin,
    signup,
    updatePassword,
  };
};
export default controllerFactory;
