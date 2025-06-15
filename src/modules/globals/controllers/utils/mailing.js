import axios from 'axios';
import { config } from 'dotenv';
import * as nodemailer from 'nodemailer';
({ config }).config();
async function sendEmail(to, subject, text, files = []) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // Ensure the secure option is a boolean
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    requireTLS: true,
    tls: {
      ciphers: 'SSLv3',
    },
  });
  // Prepare the attachments array from the file paths
  const attachments = files.map(file => ({
    filename: file.split('/').pop(), // Extract filename from path
    path: file, // Full path to the file
  }));
  const mailOptions = {
    from: `${process.env.SMTP_NAME} <${process.env.SMTP_EMAIL}>`,
    to: to,
    subject: subject,
    text: text,
    attachments: attachments, // Add attachments to mail options
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function sendSms(phone, message) {
  const sessionUrl = `https://api.sms.to/sms/send?api_key=${process.env.SMS_API_KEY}&to=${phone}&message=${encodeURIComponent(message)}&sender_id=${encodeURIComponent(process.env.APP_NAME)}`;
  //
  console.log(`Phone:${phone} message:${message} session: ${sessionUrl}`);
  try {
    const response = await axios.get(sessionUrl);
    console.log(response);
    console.log('SMS sent');
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
async function sendChatMessageTelegram(chatIds, text) {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN; // Токен Telegram Bot хранится в переменных окружения
  const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
  // Используем Promise.all для параллельной отправки сообщений
  const sendPromises = chatIds.map(chatId => {
    return axios
      .post(telegramUrl, {
        chat_id: chatId,
        text: text,
        // reply_markup: inlineKeyboard
      })
      .catch(error => {
        // Логируем ошибку для конкретного чата, но не прерываем процесс
        console.log(`Failed to send message to chat ${chatId}:`, error.message);
        // Возвращаем false или null, чтобы Promise.all мог продолжить
        return false;
      });
  });
  try {
    // Ждем завершения всех промисов, но ошибки не прерывают выполнение
    const results = await Promise.all(sendPromises);
    console.log('Telegram messages processing completed');
    // Возвращаем true, даже если некоторые сообщения не были отправлены
    return true;
  } catch (error) {
    // Логируем общую ошибку, но не прерываем выполнение
    console.log('Error in sending Telegram messages:', error.message);
    return false;
  }
}
export { sendChatMessageTelegram, sendEmail, sendSms };
export default {
  sendEmail,
  sendSms,
  sendChatMessageTelegram,
};
