import WebhookHandler from './webhookHandler.js';
class PayPalWebhookHandler extends WebhookHandler {
  async handleWebhook(req, res) {
    let { event_type } = req.body;
    switch (event_type) {
      case 'PAYMENT.SALE.COMPLETED':
        console.log('PayPal payment completed', req.body);
        break;
      case 'PAYMENT.SALE.DENIED':
        console.log('PayPal payment denied', req.body);
        break;
      default:
        console.log(`Unhandled PayPal event type ${event_type}`);
    }
    res.status(200).send({ message: 'Webhook handled' });
  }
}
export default PayPalWebhookHandler;
