import mailing from '@martyrs/src/modules/core/controllers/utils/mailing.js';
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
      const ticket = new Ticket({
        ...ticketData,
        status: 'unused',
        paymentMethod: ticketData.paymentMethod || 'manual'
      });

      // Генерируем QR код и устанавливаем данные ДО первого save
      let qrCode;
      try {
        qrCode = await QRCode.toDataURL(ticket._id.toString(), {
          errorCorrectionLevel: 'H',
          type: 'image/png',
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }

      console.log('qr code is', qrCode);
      ticket.qrcode = qrCode;
      ticket.client_refactor = {
        name: ticketData.name,
        email: ticketData.email
      };

      // ПЕРВЫЙ save - билет сохраняется со всеми данными включая status
      const data = await ticket.save();
      ticketIds.push(data._id.toString());
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
        // Обновляем только поле image после успешного создания PDF
        data.image = `/tickets/${fileName}`;
        await data.save();
      } catch (error) {
        console.error('Error creating PDF:', error);
        // Даже если PDF не создался, билет уже в базе со status: 'unused'
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
  const getStats = async (req, res) => {
    const { eventId } = req.params;
    try {
      const allTickets = await Ticket.find({ target: eventId });
      const sold = allTickets.filter(t => t.paymentMethod === 'stripe' && t.status !== 'deactivated');
      const free = allTickets.filter(t => !t.paymentMethod || t.paymentMethod === 'manual');
      const refunded = allTickets.filter(t => t.status === 'deactivated');
      res.json({
        total: allTickets.length,
        sold: sold.length,
        free: free.length,
        refunded: refunded.length,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ errorCode: 'SERVER_ERROR' });
    }
  };
  const getAttendance = async (req, res) => {
    const { eventId } = req.params;
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).send({ errorCode: 'EVENT_NOT_FOUND' });
      }
      const tickets = await Ticket.find({ target: eventId });
      const total = tickets.length;
      const expected = tickets.filter(t => t.status === 'unused').length;
      const arrived = tickets.filter(t => t.status === 'used').length;
      const eventStart = new Date(event.date.start);
      const timeline = [];
      for (let i = 0; i < 24; i++) {
        const time = new Date(eventStart.getTime() + i * 5 * 60000);
        const nextTime = new Date(time.getTime() + 5 * 60000);
        const count = tickets.filter(t => {
          if (t.status !== 'used' || !t.updatedAt) return false;
          const checkInTime = new Date(t.updatedAt);
          return checkInTime >= time && checkInTime < nextTime;
        }).length;
        timeline.push({
          time: time.toTimeString().slice(0, 5),
          count,
        });
      }
      res.json({ total, expected, arrived, timeline });
    } catch (error) {
      console.log(error);
      res.status(500).send({ errorCode: 'SERVER_ERROR' });
    }
  };
  const resendTicketEmail = async (req, res) => {
    const { ticketId } = req.params;
    try {
      const ticket = await Ticket.findById(ticketId).populate('target');
      if (!ticket) {
        return res.status(404).send({ errorCode: 'TICKET_NOT_FOUND' });
      }
      const event = ticket.target;
      if (!event) {
        return res.status(404).send({ errorCode: 'EVENT_NOT_FOUND' });
      }
      const filePath = path.join(publicPath, 'tickets', `ticket-${ticket._id.toString()}.pdf`);
      const renderedHtmlEmail = renderEmailTemplate({
        clientName: ticket.client_refactor?.name || 'No name',
        eventLocation: event.location || process.env.APP_NAME,
        eventName: event.name,
        eventDate: formatDate(event.date.start),
        eventTime: formatTime(event.date.start),
        randomness: Date.now(),
      });
      try {
        await sendEmail(ticket.client_refactor?.email, `Your Ticket for ${event.name}`, renderedHtmlEmail, [filePath]);
        res.json({ success: true });
      } catch (err) {
        console.error('Email sending failed:', err);
        res.status(500).send({ errorCode: 'EMAIL_SEND_FAILED' });
      }
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
    getStats,
    getAttendance,
    resendTicketEmail,
  };
};
export default controllerFactory;
