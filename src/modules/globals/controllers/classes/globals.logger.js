// Переделанный класс Logger
class Logger {
  constructor(db) {
    // Теперь просто используем модель, которая уже определена в db
    this.LogModel = db.log;
  }
  async log(level, message) {
    const logEntry = new this.LogModel({
      level,
      message,
    });
    try {
      await logEntry.save();
      console.info(`Logged: ${level} - ${message}`);
    } catch (err) {
      console.error('Logging error:', err);
    }
  }
  // Удобные методы для различных уровней логирования
  async info(message) {
    await this.log('info', message);
  }
  async error(message) {
    await this.log('error', message);
  }
}
export default Logger;
