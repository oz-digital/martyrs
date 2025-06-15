import mailing from '@martyrs/src/modules/globals/controllers/utils/mailing.js';
import path from 'path';
import puppeteer from 'puppeteer';
import * as QRCode from 'qrcode';
import { renderTemplate as renderEmailTemplate } from './utils/templateEmail.js';
import { renderTemplate as renderTicketTemplate } from './utils/templateTicket.js';
const { sendEmail } = mailing;
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long' };
  return date.toLocaleDateString('en-US', options);
}
// Функция для форматирования времени в формат "16:30"
function formatTime(dateString) {
  const date = new Date(dateString);
  const options = { hour: '2-digit', minute: '2-digit', hour12: false };
  return date.toLocaleTimeString('en-US', options);
}
// const createAndSendTicketWithRetry = async (paymentIntentId, ticketData, retries = 3, delay = 1000) => {
//   try {
//     const ticket = await saveAndSendTicket(ticketData);
//     console.log(`Ticket created and sent successfully: ${ticket._id}`);
//     await Payment.updateOne({ paymentIntentId }, { $set: { ticketId: ticket._id, status: 'success' } });
//     return ticket;
//   } catch (err) {
//     if (retries > 0) {
//       console.log(`Error creating and sending ticket: ${err.message}. Retrying in ${delay}ms...`);
//       await new Promise(resolve => setTimeout(resolve, delay));
//       return createAndSendTicketWithRetry(paymentIntentId, ticketData, retries - 1, delay * 2);
//     } else {
//       console.log(`Error creating and sending ticket: ${err.message}. No more retries.`);
//       await Payment.updateOne({ paymentIntentId }, { $set: { status: 'failed', error: err.message } });
//       throw err;
//     }
//   }
// };
// const createTicketJob = new Bull('createTicket', {
//   attempts: 5, // Количество попыток
//   backoff: {
//     type: 'exponential',
//     delay: 1000, // Начальная задержка между попытками (в миллисекундах)
//   },
// });
// createTicketJob.process(async (job) => {
//   const { payment } = job.data;
//   try {
//     const ticketData = {
//       // Заполнить данные билета на основе информации из платежа
//     };
//     // Создать билет
//     const ticket = await createTicket(ticketData);
//     // Отправить билет
//     await sendTicket(ticket);
//     // Обновить статус платежа на 'success'
//     await updatePaymentStatus(payment.id, 'success');
//   } catch (err) {
//     console.error(err);
//     // Обновить статус платежа на 'failed'
//     await updatePaymentStatus(payment.id, 'failed');
//     throw err; // Вызвать ошибку для повторной попытки
//   }
// });
// createTicketJob.on('failed', async (job, err) => {
//   const { payment } = job.data;
//   // Обновить статус платежа на 'failed'
//   await updatePaymentStatus(payment.id, 'failed');
//   // Отправить уведомление администратору о неудачном создании билета
//   await notifyAdminFailedTicketCreation(payment);
// });
const controllerFactory = (db, publicPath) => {
  console.log('controllerFactory publicPath:', publicPath);
  const Ticket = db.ticket;
  const Event = db.event;
  // Функция для создания билета, генерации QR-кода и сохранения билета
  async function saveAndSendTicket(ticketData) {
    console.log(ticketData);
    console.log('Starting saveAndSendTicket');
    const quantity = ticketData.quantity || 1; // Установим значение по умолчанию, если quantity не указано
    const ticketIds = [];
    const pdfFiles = [];
    const event = await Event.findById(ticketData.target).exec();
    if (!event) {
      console.error('Event not found!');
      return;
    }
    for (let i = 0; i < quantity; i++) {
      console.log(`Processing ticket ${i + 1} of ${quantity}`);
      const ticket = new Ticket(ticketData);
      const data = await ticket.save();
      ticketIds.push(data._id.toString()); // Сохраняем ID каждого билета для QR кода
      const qrData = data._id.toString();
      let qrCode;
      try {
        qrCode = await QRCode.toDataURL(qrData, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
        });
      } catch (error) {
        console.error('Error in saveAndSendTicket:', error);
      }
      console.log('qr code is', qrCode);
      data.status = 'unused';
      data.qrcode = qrCode;
      data.client_refactor.name = ticketData.name;
      data.client_refactor.email = ticketData.email;
      const renderedHtml = renderTicketTemplate({
        clientName: ticketData.name || 'No name',
        qrCode: qrCode,
        eventLocation: event.location || '-',
        eventSeat: ticketData.seat || '-',
        eventName: event.name,
        eventDate: formatDate(event.date.start),
        eventTime: formatTime(event.date.start),
      });
      if (!publicPath) {
        console.error('publicPath is undefined');
        throw new Error('publicPath must be defined');
      }
      const dirPath = path.join(publicPath, 'tickets');
      const fileName = `ticket-${data._id.toString()}.pdf`;
      const filePath = path.join(dirPath, fileName);
      pdfFiles.push(filePath); // Сохраняем пути ко всем файлам PDF
      let browser;
      try {
        browser = await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--disable-gpu'],
          headless: 'new',
          protocolTimeout: 120000,
          dumpio: true,
        });
      } catch (error) {
        console.error('Error in saveAndSendTicket:', error);
      }
      // console.log(browser)
      // console.log(browser.debugInfo.pendingProtocolErrors);
      try {
        const page = await browser.newPage();
        await page.setContent(renderedHtml);
        console.log('Rendering PDF to path:', filePath);
        const pdfBuffer = await page.pdf({
          path: filePath,
          format: 'A4',
        });
        console.log('PDF created successfully:', filePath);
        await browser.close();
        data.image = `/tickets/${fileName}`;
        await data.save(); // Обновление билета в базе данных
      } catch (error) {
        console.error('Error in saveAndSendTicket:', error);
      }
    }
    // Отправка одного емейла с прикрепленными PDF файлами всех билетов
    console.log('All tickets processed, sending email');
    if (ticketData.email) {
      const renderedHtmlEmail = renderEmailTemplate({
        clientName: ticketData.name || 'No name',
        eventLocation: event.location || process.env.APP_NAME,
        eventName: event.name,
        eventDate: formatDate(event.date.start),
        eventTime: formatTime(event.date.start),
        randomness: Date.now(),
      });
      try {
        const emailSent = await sendEmail(ticketData.email, `Your Tickets for ${event.name}`, renderedHtmlEmail, pdfFiles);
      } catch (err) {
        console.error('Email sending failed:', err);
      }
    }
    return {
      tickets: ticketIds,
    }; // Возвращаем ID всех созданных билетов
  }
  const create = async (req, res) => {
    if (Array.isArray(req.body)) {
      const ticketsData = req.body;
      try {
        const ticketsPromises = ticketsData.map(ticketData => saveAndSendTicket(ticketData));
        const tickets = await Promise.all(ticketsPromises);
        res.json(tickets);
      } catch (err) {
        console.log(err);
        res.status(500).send({
          errorCode: 'SERVER_ERROR',
        });
      }
    } else {
      try {
        const data = await saveAndSendTicket(req.body);
        res.json(data);
      } catch (err) {
        console.log(err);
        res.status(500).send({
          errorCode: 'SERVER_ERROR',
        });
      }
    }
  };
  const read = async (req, res) => {
    let query = {};
    let options = {};
    if (req.query.user) {
      query.user = req.query.user;
    }
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.target) {
      query.target = req.query.target;
    }
    if (req.query.role) {
      query.role = req.query.role;
    }
    options.limit = req.query.limit || 10;
    options.skip = req.query.skip || 0;
    const sortParam = req.query.sortParam || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    options.sort = {
      [sortParam]: sortOrder,
      _id: 1,
    };
    const search = req.query.search;
    if (search) {
      const parts = search.split('.');
      let regexPattern = '';
      if (parts.length === 2) {
        // Создаем паттерн, который допускает замену одного символа в каждой части
        regexPattern = parts.map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')).join('\\.');
      } else {
        // Если нет точки, применяем аналогичный подход к всей строке
        regexPattern = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
      }
      query['client_refactor.name'] = { $regex: new RegExp(regexPattern, 'i') };
    }
    try {
      const tickets = await Ticket.find(query, null, options).populate('user');
      if (!tickets) {
        return res.status(404).send({ errorCode: 'TICKETS_NOT_FOUND' });
      }
      res.send(tickets);
    } catch (err) {
      res.status(500).send({ errorCode: 'SERVER_ERROR' });
    }
  };
  const update = async (req, res) => {
    try {
      const { _id } = req.body;
      // Поиск билета по ID
      const ticket = await Ticket.findById(_id);
      // Если билет не найден
      if (!ticket) {
        return res.status(404).send({ errorCode: 'TICKET_NOT_FOUND' });
      }
      // Проверка статуса билета
      if (ticket.status === 'used' && req.body.check) {
        return res.status(500).send({ errorCode: 'TICKET_ALREADY_USED' });
      }
      if (ticket.status === 'deactivated' && req.body.check) {
        return res.status(500).send({ errorCode: 'TICKET_DEACTIVATED' });
      }
      // Обновление билета
      const updatedTicket = await Ticket.findOneAndUpdate({ _id: _id }, req.body, { new: true });
      // Отправка обновленного билета
      res.send(updatedTicket);
    } catch (err) {
      // Обработка ошибки сервера
      res.status(500).send({ errorCode: 'SERVER_ERROR' });
    }
  };
  const deleteTicket = async (req, res) => {
    const { type, target, user } = req.body;
    try {
      const ticket = await Ticket.findOne({ type, target, user });
      if (!ticket) {
        return res.status(404).send({ errorCode: 'TICKET_NOT_FOUND' });
      }
      await Ticket.deleteOne({ _id: ticket._id });
      res.status(200).send(ticket);
    } catch (error) {
      console.log(error);
      res.status(500).send({ errorCode: 'SERVER_ERROR' });
    }
  };
  return {
    read,
    create,
    update,
    delete: deleteTicket,
    saveAndSendTicket,
  };
};
export default controllerFactory;
