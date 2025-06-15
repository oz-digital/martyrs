import servicePayment from '@martyrs/src/modules/integrations/integrations.service.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY ?? '', {
  apiVersion: '2025-04-30.basil',
});

class servicePaymentStripe extends servicePayment {
  async createProducts(entityId, items, eventName) {
    // Создаем один продукт для события
    const product = await stripe.products.create({
      id: entityId,
      name: eventName,
      metadata: {
        product: entityId,
      },
    });
    const priceLinks = [];
    // Создаем разные цены и payment links для одного продукта
    for (const item of items) {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: item.price * 100,
        currency: 'THB',
        nickname: item.name,
        metadata: {
          ticketType: item.name,
        },
      });
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
            adjustable_quantity: {
              enabled: true,
            },
          },
        ],
        metadata: {
          product: entityId,
          ticketType: item.name,
        },
      });
      priceLinks.push({
        productId: product.id,
        priceId: price.id,
        paymentLinkId: paymentLink.id,
        paymentLink: paymentLink.url,
        name: item.name,
      });
    }
    return priceLinks;
  }
  async updateProducts(entityId, newItems, existingItems, eventName) {
    try {
      const updates = [];
      // Get existing product
      let product;
      try {
        product = await stripe.products.retrieve(entityId);
      } catch (error) {
        // If product not found, create new
        return this.createProducts(entityId, newItems, eventName);
      }
      // Update product name if changed
      await stripe.products.update(product.id, {
        name: eventName,
      });
      // Find deleted items
      const deletedItems = existingItems.filter(existingItem => !newItems.some(newItem => newItem.name === existingItem.name));
      // Deactivate payment links for deleted items
      for (const deletedItem of deletedItems) {
        if (deletedItem.stripePaymentLinkId) {
          await stripe.paymentLinks.update(deletedItem.stripePaymentLinkId, {
            active: false,
          });
        }
      }
      // Process each ticket
      for (const item of newItems) {
        const existingItem = existingItems.find(e => e.name === item.name);
        if (existingItem) {
          // Get all active prices for the product
          const prices = await stripe.prices.list({
            product: product.id,
            active: true,
          });
          // Filter prices by metadata and amount in memory
          let price = prices.data.find(p => p.unit_amount === item.price * 100 && p.metadata?.ticketType === item.name);
          if (!price) {
            // Deactivate old prices for this ticket type
            await Promise.all(prices.data.filter(p => p.metadata?.ticketType === item.name).map(p => stripe.prices.update(p.id, { active: false })));
            // Create new price
            price = await stripe.prices.create({
              product: product.id,
              unit_amount: item.price * 100,
              currency: 'THB',
              nickname: item.name,
              metadata: {
                ticketType: item.name,
              },
            });
            // Deactivate old link
            if (existingItem.stripePaymentLinkId) {
              await stripe.paymentLinks.update(existingItem.stripePaymentLinkId, {
                active: false,
              });
            }
            // Create new link
            const paymentLink = await stripe.paymentLinks.create({
              line_items: [
                {
                  price: price.id,
                  quantity: 1,
                  adjustable_quantity: {
                    enabled: true,
                  },
                },
              ],
              metadata: {
                product: product.id,
                ticketType: item.name,
              },
            });
            updates.push({
              productId: product.id,
              priceId: price.id,
              paymentLinkId: paymentLink.id,
              paymentLink: paymentLink.url,
              name: item.name,
            });
          } else {
            // Use existing data if price hasn't changed
            updates.push({
              productId: product.id,
              priceId: price.id,
              paymentLinkId: existingItem.stripePaymentLinkId,
              paymentLink: existingItem.link,
              name: item.name,
            });
          }
        } else {
          // Create new price for existing product
          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: item.price * 100,
            currency: 'THB',
            nickname: item.name,
            metadata: {
              ticketType: item.name,
            },
          });
          const paymentLink = await stripe.paymentLinks.create({
            line_items: [
              {
                price: price.id,
                quantity: 1,
                adjustable_quantity: {
                  enabled: true,
                },
              },
            ],
            metadata: {
              product: product.id,
              ticketType: item.name,
            },
          });
          updates.push({
            productId: product.id,
            priceId: price.id,
            paymentLinkId: paymentLink.id,
            paymentLink: paymentLink.url,
            name: item.name,
          });
        }
      }
      return updates;
    } catch (error) {
      console.error('Error updating products:', error);
      throw error;
    }
  }
  async deactivateProduct(productId) {
    try {
      // Деактивируем продукт
      await stripe.products.update(productId, {
        active: false,
      });
      // Деактивируем все цены
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
      });
      await Promise.all(prices.data.map(price => stripe.prices.update(price.id, { active: false })));
      // Деактивируем все payment links
      const paymentLinks = await stripe.paymentLinks.list({
        metadata: {
          product: productId,
        },
      });
      await Promise.all(paymentLinks.data.map(link => stripe.paymentLinks.update(link.id, { active: false })));
      return true;
    } catch (error) {
      console.error('Error deactivating product:', error);
      throw error;
    }
  }
  async createСheckout(event) {
    // Create a payment session based on the selected variants
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: event.variants.map(variant => ({
        price: variant.priceId,
        quantity: variant.quantity,
      })),
      mode: 'payment',
      success_url: event.successUrl,
      cancel_url: event.cancelUrl,
    });
    return session.url;
  }
  async deactivateСheckout(sessionId) {
    // Expire a session
    const session = await stripe.checkout.sessions.expire(sessionId);
    return 'Payment session expired.';
  }
  async createRefund(event) {
    // Create a refund for a payment intent
    const refund = await stripe.refunds.create({
      payment_intent: event.paymentIntentId,
    });
    return refund;
  }
  async updateRefund(refundId, metadata) {
    try {
      const refund = await stripe.refunds.update(refundId, {
        metadata: metadata,
      });
      return refund;
    } catch (error) {
      // Handle cases where the update parameters are invalid
      throw new Error('Failed to update refund: ' + error.message);
    }
  }
  async deactivateRefund(refundId) {
    try {
      const refund = await stripe.refunds.cancel(refundId);
      return refund;
    } catch (error) {
      // Handle cases where the refund cannot be cancelled
      throw new Error('Failed to cancel refund: ' + error.message);
    }
  }
}
export default servicePaymentStripe;
