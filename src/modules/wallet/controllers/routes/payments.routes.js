import middlewareFactoryAuth from '@martyrs/src/modules/auth/controllers/middlewares/index.js';
import controllerFactoryTickets from '@martyrs/src/modules/events/controllers/tickets.controller.js';
import Observer from '@martyrs/src/modules/core/controllers/classes/core.observer.js';
import WebhookStripe from '@martyrs/src/modules/integrations/stripe/controllers/webhooks/stripe.webhook.js';
import controllerFactory from '../factories/payments.factory.js';
export default (function (app, db, origins, publicPath) {
  const observer = new Observer();
  const webhook = new WebhookStripe(app, db, observer);
  const controller = controllerFactory(db);
  console.log('payments ticket', publicPath);
  const controllerTickets = controllerFactoryTickets(db, publicPath);
  const { verifySignUp, verifyUser } = middlewareFactoryAuth(db);
  observer.subscribe('checkout.session.completed', async paymentIntent => {
    try {
      const event = await db.event.findOne({ _id: paymentIntent.metadata.product });
      if (!event) {
        console.error('Event not found:', paymentIntent.metadata.product);
        return;
      }
      // Найдем тип билета по metadata
      const ticketType = event.ticketsTypes.find(type => type.name === paymentIntent.metadata.ticketType);
      if (!ticketType) {
        console.error('Ticket type not found:', paymentIntent.metadata.ticketType);
        return;
      }
      // Расчет количества билетов
      const quantity = paymentIntent.amount_total / (ticketType.price * 100);
      console.log('Purchase details:');
      console.log('Email:', paymentIntent.customer_details.email);
      console.log('Name:', paymentIntent.customer_details.name);
      console.log('Event ID:', paymentIntent.metadata.eventId);
      console.log('Ticket Type:', ticketType.name);
      console.log('Quantity:', quantity);
      let ticketData = {
        name: paymentIntent.customer_details.name,
        email: paymentIntent.customer_details.email,
        target: paymentIntent.metadata.product,
        type: 'event',
        seat: ticketType.name,
        quantity: quantity,
        price: ticketType.price,
        paymentMethod: 'stripe',
      };
      await controllerTickets.saveAndSendTicket(ticketData);
    } catch (error) {
      console.error('Error processing checkout session:', error);
    }
  });
  app.get('/api/payments/read', controller.read);
  app.post('/api/payments/create', controller.create);
  app.post('/api/payments/update', controller.update);
  app.delete('/api/payments/delete', controller.delete);
});
