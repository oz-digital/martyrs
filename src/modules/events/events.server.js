import EventsController from './controllers/events.controller.js';
import TicketsController from './controllers/tickets.controller.js';
import createEventModel from './models/event.model.js';
import createTicketModel from './models/ticket.model.js';
import eventsRoutes from './routes/events.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
function initializeEvent(app, db, origins, publicPath, options = {}) {
  console.log('initializeEvent publicPath:', publicPath);
  // Получаем дополнительные поля для моделей из options
  const { eventFields = {}, ticketFields = {} } = options;
  console.log('new fields is', eventFields);
  // Инициализируем модели с дополнительными полями
  db.event = createEventModel(db, eventFields);
  db.ticket = createTicketModel(db, ticketFields);
  // Настраиваем маршруты, если объект приложения передан
  if (app) {
    eventsRoutes(app, db, origins, publicPath);
    ticketsRoutes(app, db, origins, publicPath);
  }
}
export const models = {
  EventModel: createEventModel,
  TicketModel: createTicketModel,
};
export const routes = {
  eventsRoutes,
  ticketsRoutes,
};
export const controllers = {
  EventsController,
  TicketsController,
};
export { initializeEvent as initialize };
export default {
  initialize: initializeEvent,
  models,
  routes,
  controllers,
};
