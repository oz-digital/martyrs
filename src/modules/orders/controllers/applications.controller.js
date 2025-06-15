import mailing from '@martyrs/src/modules/globals/controllers/utils/mailing.js';
import axios from 'axios';
// --------------------------------------------------
// UTILS
// --------------------------------------------------
const { sendChatMessageTelegram } = mailing;
// --------------------------------------------------
// METHODS
// --------------------------------------------------
const middlewareFactory = db => {
  const Application = db.application;
  const read = async (req, res) => {
    try {
      const applications = await Application.find({});
      if (!applications) {
        return res.status(404).send({ message: 'Applications not found.' });
      }
      res.status(200).send(applications);
    } catch (err) {
      res.status(500).send({ message: err });
    }
  };
  const create = async (req, res) => {
    try {
      const application = await Application.create(req.body);
      if (!application) {
        return res.status(404).send({ message: 'Something wrong when creating application.' });
      }
      try {
        const messageSent = await sendChatMessageTelegram(process.env.TELEGRAM_BOT_USERS.split(','), `New application from ${req.body}`);
      } catch (err) {
        console.log(err);
      }
      res.status(200).send(application);
    } catch (err) {
      res.status(500).send({ message: err });
    }
  };
  const update = async (req, res) => {
    try {
      const application = await Application.findOneAndUpdate({ _id: req.params._id }, req.body, {
        new: true,
      });
      if (!application) {
        return res.status(404).send({ message: 'Application not found.' });
      }
      res.status(200).send(application);
    } catch (err) {
      res.status(500).send({ message: err });
    }
  };
  const deleteMethod = async (req, res) => {
    try {
      const application = await Application.findOneAndDelete({ _id: req.params._id });
      if (!application) {
        return res.status(404).send({ message: 'Something wrong when deleting application.' });
      }
      res.status(200).send(application);
    } catch (err) {
      res.status(500).send({ message: err });
    }
  };
  const get = async (req, res) => {
    try {
      const application = await Application.findOne({ url: req.params.url });
      if (!application) {
        return res.status(404).send({ message: 'Application not found.' });
      }
      res.status(200).send(application);
    } catch (err) {
      res.status(500).send({ message: err });
    }
  };
  const handleTelegramWebhook = async (req, res) => {
    const update = req.body;
    // Проверка, является ли это обратным вызовом от inline клавиатуры
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const callbackData = callbackQuery.data;
      // Разбор callback_data
      const [action, applicationId] = callbackData.split('_');
      try {
        // Выполнение действий в зависимости от callback_data
        let updatedApplication = null;
        switch (action) {
          case 'confirm':
            updatedApplication = await Application.findOneAndUpdate({ _id: applicationId }, { status: 'confirmed' }, { new: true });
            break;
          case 'lost':
            updatedApplication = await Application.findOneAndUpdate({ _id: applicationId }, { status: 'lost' }, { new: true });
            break;
          case 'delete':
            updatedApplication = await Application.findOneAndDelete({ _id: applicationId });
            break;
        }
        if (!updatedApplication) {
          console.log('Application not found or not updated.');
        } else {
          console.log('Application updated:', updatedApplication);
        }
      } catch (err) {
        console.log('Error updating application:', err);
      }
      // Ответ на callback query, чтобы убрать часы ожидания на кнопке
      const queryId = callbackQuery.id;
      const telegramToken = '6206215053:AAHYCYzpFZF9jDZC-TC03NSff8oo2ExqsSU';
      axios.post(`https://api.telegram.org/bot${telegramToken}/answerCallbackQuery`, {
        callback_query_id: queryId,
      });
    }
    res.sendStatus(200);
  };
  return {
    read,
    create,
    update,
    delete: deleteMethod,
    handleTelegramWebhook,
    get,
  };
};
export default middlewareFactory;
