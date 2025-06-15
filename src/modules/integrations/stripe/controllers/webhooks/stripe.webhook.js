import Webhook from '@martyrs/src/modules/globals/controllers/classes/globals.webhook.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY ?? '', {
  apiVersion: '2025-04-30.basil',
});

function middleware(req, res, next) {
  next();
}

class StripeWebhook extends Webhook {
  constructor(app, db, observer, path = '/api/webhook/stripe', handlerMethod = StripeWebhook.prototype.handleWebhook, middlewares = []) {
    super(app, db, observer, path, handlerMethod, [middleware]);
  }
  async handleWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      const payload = req.body;
      const payloadString = JSON.stringify(payload, null, 2);
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      const header = stripe.webhooks.generateTestHeaderString({
        payload: payloadString,
        secret,
      });
      const event = stripe.webhooks.constructEvent(payloadString, header, secret);
      // Notify all listeners about the event
      this.observer.notify(event.type, event.data.object);
    } catch (err) {
      console.log(`Error verifying Stripe webhook signature: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    res.sendStatus(200);
  }
}
export default StripeWebhook;
