import fs from 'fs';
import path from 'path';
import winston from 'winston';
import config from './config.js';
/**
 * Настраивает и возвращает логгер
 */
function setupLogger() {
  // Создаем директорию для логов, если она не существует
  const logDir = path.dirname(config.logPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.printf(info => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`)
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
      }),
      new winston.transports.File({
        filename: config.logPath,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    ],
  });
}
export { setupLogger };
export default {
  setupLogger,
};
