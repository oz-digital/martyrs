import mailing from '@martyrs/src/modules/globals/controllers/utils/mailing.js';
import queryProcessorGlobals from '@martyrs/src/modules/globals/controllers/utils/queryProcessor.js';
const { sendChatMessageTelegram } = mailing;
function formatPositions(positions) {
  return positions.map(pos => `🔹 ${pos.name} - Price: $${pos.price}, Quantity: ${pos.quantity}`).join('\n');
}
// Функция для форматирования сообщения об ордере
function formatOrderMessage(order) {
  return `
    🆕 New Order Received!
    👤 Customer: ${order.customer?.name} (${order.customer?.phone?.number ? order.customer?.phone?.number : 'No phone'})
    💬 Messenger: ${order.customer?.messenger ? order.customer?.messenger?.type + ' ' + order.customer?.messenger?.value : 'None'}
    🏢 Organization: ${order.organization}
    📦 Positions:\n${formatPositions(order.positions)}
    📝 Comment: ${order.comment ? order.comment : 'No comment'}
    💳 Payment: ${order.payment?.type}
    🚚 Delivery: ${order.delivery?.type} to ${order.delivery?.address}
    📌 Status: ${order.status}
    🧑 Agent: ${order.referralCode}
  `;
}
async function findOrCreateCustomer(Customer, customerInfo, orderOwner, orderCreator) {
  let searchCriteria = {};
  if (customerInfo.phone) {
    searchCriteria.phone = customerInfo.phone;
  }
  if (customerInfo.email) {
    searchCriteria.email = customerInfo.email;
  }
  let customer = null;
  // Проверяем, есть ли критерии для поиска
  if (Object.keys(searchCriteria).length > 0) {
    customer = await Customer.findOne({ $or: [searchCriteria] });
  }
  if (!customer) {
    // Handle the case when creator.target is null
    let creatorType = customerInfo.creator?.type || orderCreator.type;
    let creatorTarget = customerInfo.creator?.target || orderCreator.target;
    // If creator target is still null, use the organization as creator
    if (!creatorTarget) {
      creatorType = orderOwner.type;
      creatorTarget = orderOwner.target;
    }
    // Create new customer with proper creator fields
    const newCustomerData = {
      ...customerInfo,
      // Ensure we're not passing any null _id that might override MongoDB's auto-generation
      _id: undefined, // Let MongoDB generate this
      owner: orderOwner,
      creator: {
        type: creatorType,
        target: creatorTarget,
      },
      identity: {
        type: customerInfo.identity?.type || creatorType,
        target: customerInfo.identity?.target || creatorTarget,
      },
    };
    try {
      customer = await Customer.create(newCustomerData);
      // Verify the customer was created with an _id
      if (!customer || !customer._id) {
        console.error('Customer creation failed to generate _id:', customer);
        throw new Error('Customer creation did not generate a valid _id');
      }
    } catch (err) {
      console.error('Error creating customer:', err);
      throw err;
    }
  }
  return customer;
}
async function sendOrderMessage(orderData) {
  try {
    const formattedMessage = formatOrderMessage(orderData);
    await sendChatMessageTelegram(process.env.TELEGRAM_BOT_USERS.split(','), formattedMessage);
  } catch (err) {
    console.error(err);
  }
}
const controllerFactory = db => {
  const Order = db.order;
  const Customer = db.customer;
  const Leftover = db.leftover;
  // Создание заказа
  const create = async (req, res) => {
    const orderData = req.body;
    const userId = req.userId || req.body.creator?.target;
    orderData.status = 'created';
    orderData.status_history = orderData.status_history || [];
    orderData.status_history.push({
      status: orderData.status,
      timestamp: new Date(),
      comment: '',
    });
    console.log('order.data is,', orderData);
    // Start a database transaction
    const session = await db.mongoose.startSession();
    session.startTransaction();
    try {
      // In your create controller function
      if (!orderData.customer.target) {
        const customer = await findOrCreateCustomer(Customer, orderData.customer, orderData.owner, orderData.creator);
        console.log('customer is', customer);
        // Make sure we have a valid customer ID
        if (!customer || !customer._id) {
          throw new Error('Failed to create or find a valid customer');
        }
        // Set the customer target properly
        orderData.customer = {
          type: 'customer',
          target: customer._id,
        };
        // If creator target is also missing, use the customer
        if (!orderData.creator || !orderData.creator.target) {
          orderData.creator = {
            type: 'customer',
            target: customer._id,
          };
        }
      }
      console.log('Order data after customer processing:', orderData);
      // Now create the order with proper references
      const order = await Order.create([orderData], { session });
      const createdOrder = order[0];
      // Process each position individually
      if (orderData.positions && orderData.positions.length > 0) {
        for (const position of orderData.positions) {
          try {
            switch (position.listing) {
              case 'rent':
                // Create rent entry
                const rentData = {
                  order: createdOrder._id,
                  product: position._id,
                  quantity: position.quantity,
                  startDate: position.date.start,
                  endDate: position.date.end,
                  status: 'pending', // Initial status for rent
                  creator: orderData.creator,
                  owner: orderData.owner,
                  comment: `Created from order ${createdOrder._id}`,
                };
                console.log(rentData);
                // Call rent service directly
                const rentResponse = await fetch(`${process.env.API_URL || ''}/api/rents`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Service-Key': process.env.SERVICE_KEY,
                  },
                  body: JSON.stringify(rentData),
                });
                if (!rentResponse.ok) {
                  const errorData = await rentResponse.json();
                  throw new Error(`Failed to create rent: ${JSON.stringify(errorData)}`);
                }
                break;
              case 'sale':
                // Placeholder for leftovers creation
                // Will implement once the service is ready
                console.log(`Sale position for product ${position.product} - leftover creation will be implemented later`);
                break;
              default:
                console.warn(`Unknown listing type: ${position.listing} for position with product ${position.product}`);
            }
          } catch (positionError) {
            console.log(positionError);
            // Log the specific position error but continue processing other positions
            console.error(`Error processing position for product ${position.product}:`, positionError);
            // Re-throw to abort transaction if needed
            throw new Error(`Failed to process position for product ${position.product}: ${positionError.message}`);
          }
        }
      }
      // Commit the transaction
      await session.commitTransaction();
      // Send notification
      sendOrderMessage(orderData).catch(console.error);
      // Return the created order
      res.status(201).send(createdOrder);
    } catch (err) {
      // Abort transaction on error
      await session.abortTransaction();
      console.error(err);
      res.status(500).send({
        errorCode: 'CREATE_ORDER_FAILED',
        message: 'Error occurred while creating the order.',
        error: err.message,
      });
    } finally {
      // End session
      session.endSession();
    }
  };
  const read = async (req, res) => {
    console.log(req.query);
    let stages = [
      ...queryProcessorGlobals.getBasicOptions(req.query),
      ...queryProcessorGlobals.getSearchOptions(req.query.search, {
        fields: ['positions.name'],
      }),
      // For spots
      {
        $lookup: {
          from: 'spots',
          localField: 'delivery.spot',
          foreignField: '_id',
          as: 'delivery.spot',
        },
      },
      // For customer
      {
        $lookup: {
          from: 'customers',
          localField: 'customer.target',
          foreignField: '_id',
          as: 'customerTarget',
        },
      },
      {
        $addFields: {
          'customer.target': { $arrayElemAt: ['$customerTarget', 0] },
        },
      },
      // For creator
      queryProcessorGlobals.getCreatorUserLookupStage(),
      queryProcessorGlobals.getCreatorOrganizationLookupStage(),
      queryProcessorGlobals.getCreatorCustomerLookupStage(),
      // For owner
      queryProcessorGlobals.getOwnerUserLookupStage(),
      queryProcessorGlobals.getOwnerOrganizationLookupStage(),
      queryProcessorGlobals.getAddFieldsCreatorOwnerStage(),
      // Pagination
      ...queryProcessorGlobals.getSortingOptions(req.query.sortParam, req.query.sortOrder),
      ...queryProcessorGlobals.getPaginationOptions(req.query.skip, req.query.limit),
    ];
    try {
      const orders = await Order.aggregate(stages);
      if (!orders) {
        return res.status(404).send({ errorCode: 'ORDER_NOT_FOUND', message: 'Orders not found.' });
      }
      res.status(200).send(orders);
    } catch (err) {
      console.log(err);
      res.status(500).send({
        errorCode: 'GET_ORDERS_FAILED',
        message: 'Error occurred while fetching orders.',
        error: err,
      });
    }
  };
  // Обновление заказа
  // Update the order controller's update method to send notifications on status change
  const update = async (req, res) => {
    try {
      const order = await Order.findOne({ _id: req.body._id });
      if (!order) {
        return res.status(404).send({ errorCode: 'ORDER_NOT_FOUND', message: 'Order not found.' });
      }
      // Check if status is changing
      const statusChanged = req.body.status && req.body.status !== order.status;
      const oldStatus = order.status;
      if (statusChanged) {
        order.status = req.body.status; // Update current order status
        // Add entry to status history
        order.status_history.push({
          status: req.body.status,
          timestamp: new Date(),
          comment: '',
        });
      }
      // if (req.body.status === 'confirmed') {
      //   try {
      //     const leftover = await Leftover.create({
      //       organization: order.organization,
      //       type: 'stock-out',
      //       order: order._id,
      //       comment: `Stock-out for order ${order._id}`,
      //       positions: order.positions,
      //       creator: order.creator,
      //       owner: order.owner
      //     });
      //     console.log('Leftover created:', leftover);
      //   } catch (err) {
      //     console.error('Error creating Leftover:', err);
      //   }
      // }
      // Save the order first
      if (req.body.payment?.type && req.body.payment.type !== order.payment?.type) {
        order.payment.type = req.body.payment.type;
      }
      // Update payment.status if changed
      if (req.body.payment?.status && req.body.payment.status !== order.payment?.status) {
        order.payment.status = req.body.payment.status;
      }
      await order.save();
      // Send notification if status changed
      if (statusChanged) {
        try {
          // Prepare notification data
          const notificationData = {
            title: `Order Status Updated`,
            body: `Order #${order._id} status changed from ${oldStatus} to ${order.status}`,
            type: 'order_status',
            metadata: {
              orderId: order._id,
              oldStatus: oldStatus,
              newStatus: order.status,
              positions: order.positions,
            },
            userId: order.creator.target, // Assuming creator.target holds the user ID
          };
          console.log('notifiocatio data', JSON.stringify(notificationData));
          // Send notification using the notification service
          console.log('notification api is', `${process.env.API_URL || ''}/api/notifications`);
          const notificationResponse = await fetch(`${process.env.API_URL || ''}/api/notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Service-Key': process.env.SERVICE_KEY,
            },
            body: JSON.stringify(notificationData),
          });
          if (!notificationResponse.ok) {
            const errorData = await notificationResponse.json();
            console.error(`Failed to create notification: ${JSON.stringify(errorData)}`);
            // Continue execution, don't fail the request if notification fails
          }
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
          // Continue execution, don't fail the request if notification fails
        }
      }
      res.status(200).send(order);
    } catch (err) {
      res.status(500).send({
        errorCode: 'UPDATE_ORDER_FAILED',
        message: 'Error occurred while updating the order.',
        error: err,
      });
    }
  };
  // Изменение статуса оплаты
  const changePaymentStatus = async (req, res) => {
    try {
      const order = await Order.findOneAndUpdate({ _id: req.params._id }, { status: 'closed', payment: { type: 'Cash', status: 'paid' } }, { new: true }).exec();
      if (!order) {
        return res.status(404).send({
          errorCode: 'PAYMENT_STATUS_CHANGE_FAILED',
          message: 'Failed to change the payment status.',
        });
      }
      res.status(200).send(order);
    } catch (err) {
      res.status(500).send({
        errorCode: 'CHANGE_PAYMENT_STATUS_FAILED',
        message: 'Error occurred while changing the payment status.',
        error: err,
      });
    }
  };
  // Удаление заказа
  const deleteOrder = async (req, res) => {
    try {
      const order = await Order.findOneAndDelete({ _id: req.params._id }).exec();
      if (!order) {
        return res.status(404).send({ errorCode: 'ORDER_DELETE_FAILED', message: 'Failed to delete the order.' });
      }
      res.status(200).send(order);
    } catch (err) {
      res.status(500).send({
        errorCode: 'DELETE_ORDER_FAILED',
        message: 'Error occurred while deleting the order.',
        error: err,
      });
    }
  };
  return {
    create,
    read,
    update,
    changePaymentStatus,
    deleteOrder,
  };
};
export default controllerFactory;
