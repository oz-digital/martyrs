import mailing from '@martyrs/src/modules/globals/controllers/utils/mailing.js';
const { sendEmail, sendSms } = mailing;
const controllerFactory = db => {
  const sendcode = async (req, res) => {
    const code = Math.floor(1000 + Math.random() * 9000);
    const type = req.body.type;
    const method = req.body.method;
    if (type === 'email') {
      const emailSent = await sendEmail(req.body.email, `${process.env.APP_NAME} Verification Code`, `Your ${process.env.APP_NAME} verification code is ${code}`);
      if (emailSent) {
        res.send({ code, type, method });
      } else {
        console.log(emailSent);
        res.status(500).send('Failed to send email');
      }
    }
    if (type === 'phone') {
      const smsSent = await sendSms(req.body.phone, `Your ${process.env.APP_NAME} verification code: ${code}`);
      if (smsSent) {
        res.send({ code, type, method });
      } else {
        res.status(500).send('Failed to send SMS');
      }
    }
  };
  return {
    sendcode,
  };
};
export default controllerFactory;
