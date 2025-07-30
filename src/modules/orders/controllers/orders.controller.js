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
async function sendOrderMessage(orderData) {
  try {
    const formattedMessage = formatOrderMessage(orderData);
    await sendChatMessageTelegram(process.env.TELEGRAM_BOT_USERS.split(','), formattedMessage);
  } catch (err) {
    console.error(err);
  }
}
import visitorLoggerFactory from '@martyrs/src/modules/auth/controllers/middlewares/visitor.logger.js';

const controllerFactory = db => {
  const Order = db.order;
  const Customer = db.customer;
  const Department = db.department;
  const { findOrCreateVisitor } = visitorLoggerFactory(db);

  // Оптимизированная функция получения пользователей с доступом orders.confirm
  const getUsersWithOrdersConfirmAccess = async (organizationId) => {
    console.log('=== Getting users with orders.confirm access ===');
    console.log('Organization ID:', organizationId);
    
    const pipeline = [
      { $match: { 
        organization: new db.mongoose.Types.ObjectId(organizationId),
        'accesses.orders.confirm': true 
      }},
      { $unwind: '$members' },
      { $group: {
        _id: '$members.user'
      }},
      { $project: { userId: '$_id' }}
    ];
    
    console.log('Pipeline:', JSON.stringify(pipeline, null, 2));
    
    const result = await Department.aggregate(pipeline);
    const userIds = result.map(item => item.userId);
    
    console.log('Found departments with access:', result.length);
    console.log('User IDs with access:', userIds);
    console.log('=== End getting users ===');
    
    return userIds;
  };

  // Отправка уведомлений о заказах - только данные
  const sendOrderNotifications = async (order, type, userIds, extraData = {}) => {
    console.log('=== Sending order notifications ===');
    console.log('Order ID:', order._id);
    console.log('Type:', type);
    console.log('User IDs:', userIds);
    console.log('Extra data:', extraData);
    
    if (!userIds || userIds.length === 0) {
      console.log('No users to notify, skipping...');
      return;
    }

    const notifications = userIds.map(userId => ({
      title: getNotificationTitle(type, order, extraData),
      body: getNotificationBody(type, order, extraData),
      type: type,
      metadata: {
        type: type,
        orderId: order._id,
        context: 'organization',
        ...extraData
      },
      userId: userId
    }));

    // Функции для генерации заголовков и текста
    function getNotificationTitle(type, order, extraData = {}) {
      switch(type) {
        case 'order_created':
          return 'New Order';
        case 'order_status':
          return 'Order Status Updated';
        default:
          return 'Order Notification';
      }
    }

    function getNotificationBody(type, order, extraData = {}) {
      switch(type) {
        case 'order_created':
          return `New order #${order._id} created`;
        case 'order_status':
          return `Order #${order._id} changed from ${extraData.oldStatus} to ${extraData.newStatus}`;
        default:
          return `Order #${order._id} updated`;
      }
    }
    
    console.log('Prepared notifications:', JSON.stringify(notifications, null, 2));
    console.log('API URL:', `${process.env.API_URL || ''}/api/notifications/batch`);
    
    try {
      // ОДИН POST запрос со всеми уведомлениями
      const response = await fetch(`${process.env.API_URL || ''}/api/notifications/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Key': process.env.SERVICE_KEY,
        },
        body: JSON.stringify({ notifications }),
      });
      
      console.log('Notification response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Notification API error:', errorData);
        throw new Error(`Notification API failed: ${response.status} - ${errorData}`);
      }
      
      const result = await response.json();
      console.log('Notification API success:', result);
      console.log('=== End sending notifications ===');
      
      return result;
    } catch (error) {
      console.error('=== Notification sending failed ===');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  };

  const findOrCreateCustomer = async (customerInfo, orderOwner, orderCreator, req) => {
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
      // Create visitor for anonymous customer
      const visitor = await findOrCreateVisitor(req);
      
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
          type: 'Visitor',
          target: visitor._id,
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
  };

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


    // Start a database transaction
    const session = await db.mongoose.startSession();
    session.startTransaction();
    try {
      // In your create controller function
      if (!orderData.customer.target) {
        const customer = await findOrCreateCustomer(orderData.customer, orderData.owner, orderData.creator, req);
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
      // Don't process positions during order creation - moved to update when status changes to confirmed
      // Commit the transaction
      await session.commitTransaction();
      
      // ПОСЛЕ транзакции - отправка уведомлений
      try {
        const usersWithAccess = await getUsersWithOrdersConfirmAccess(orderData.owner.target);
        await sendOrderNotifications(createdOrder, 'order_created', usersWithAccess, {
          organization: createdOrder.owner.target
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
      }
      
      // Send notification
      // sendOrderMessage(orderData).catch(console.error);
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
    console.log('=== ORDER UPDATE START ===');
    console.log('User ID:', req.userId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Start transaction
    const session = await db.mongoose.startSession();
    session.startTransaction();
    console.log('Transaction started');
    console.log('url order notifi', `${process.env.API_URL || ''}/api/inventory/adjustments/create`)
    
    try {
      console.log('Finding order with ID:', req.body._id);
      const order = await Order.findOne({ _id: req.body._id }).session(session);
      if (!order) {
        console.log('Order not found');
        await session.abortTransaction();
        return res.status(404).send({ errorCode: 'ORDER_NOT_FOUND', message: 'Order not found.' });
      }
      console.log('Order found, current status:', order.status);
      
      // Check if status is changing
      const statusChanged = req.body.status && req.body.status !== order.status;
      const oldStatus = order.status;
      console.log('Status changed:', statusChanged, 'from', oldStatus, 'to', req.body.status);
      
      // Process positions FIRST when status changes to confirmed
      if (req.body.status === 'confirmed' && oldStatus !== 'confirmed') {
        console.log('Processing confirmed status change - creating rents/adjustments');
        // Update positions if they were changed
        if (req.body.positions) {
          console.log('Updating order positions');
          order.positions = req.body.positions;
        }
        
        console.log('Total positions to process:', order.positions.length);
        
        // Create promises for parallel execution
        const apiCalls = [];
        
        for (const [index, position] of order.positions.entries()) {
          console.log(`Processing position ${index + 1}/${order.positions.length}:`, position.name, 'listing:', position.listing);
          
          switch (position.listing) {
            case 'rent':
              console.log(`Creating rent for position ${index + 1}`);
              const rentData = {
                order: order._id,
                product: position._id,
                variant: position.variant,
                quantity: position.quantity,
                startDate: position.date.start,
                endDate: position.date.end,
                status: 'pending',
                creator: order.creator,
                owner: order.owner,
                comment: `Created from order ${order._id}`,
              };
              
              const rentPromise = fetch(`${process.env.API_URL || ''}/api/rents`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Service-Key': process.env.SERVICE_KEY,
                },
                body: JSON.stringify(rentData),
              }).then(async (response) => {
                console.log(`Rent API response for position ${index + 1}:`, response.status);
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(`Failed to create rent for position ${index + 1}: ${JSON.stringify(errorData)}`);
                }
                const result = await response.json();
                console.log(`Rent created successfully for position ${index + 1}:`, result._id);
                return result;
              });
              
              apiCalls.push(rentPromise);
              break;
              
            case 'sale':
              console.log(`Creating stock adjustment for position ${index + 1}`);
              const adjustmentData = {
                product: position._id,
                variant: position.variant,
                storage: order.delivery?.spot,
                source: { type: 'Order', target: order._id },
                reason: 'sale',
                quantity: -position.quantity, // Negative for stock-out
                comment: `Stock-out for order ${order._id}`,
                owner: order.owner,
                creator: { type: 'User', target: req.userId }
              };
              

              const adjustmentPromise = fetch(`${process.env.API_URL || ''}/api/inventory/adjustments/create`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Service-Key': process.env.SERVICE_KEY,
                },
                body: JSON.stringify(adjustmentData),
              }).then(async (response) => {
                console.log(`Adjustment API response for position ${index + 1}:`, response.status);
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(`Failed to create stock adjustment for position ${index + 1}: ${JSON.stringify(errorData)}`);
                }
                const result = await response.json();
                console.log(`Stock adjustment created successfully for position ${index + 1}:`, result._id);
                return result;
              });
              
              apiCalls.push(adjustmentPromise);
              break;
              
            default:
              console.warn(`Unknown listing type: ${position.listing} for position ${position._id}`);
          }
        }
        
        // Execute all API calls in parallel
        if (apiCalls.length > 0) {
          console.log(`Executing ${apiCalls.length} API calls in parallel...`);
          await Promise.all(apiCalls);
          console.log('All API calls completed successfully');
        } else {
          console.log('No API calls to execute');
        }
      }
      
      // Only NOW update the order status (after all rents/adjustments were created successfully)
      if (statusChanged) {
        console.log('Updating order status from', oldStatus, 'to', req.body.status);
        order.status = req.body.status;
        // Add entry to status history
        order.status_history.push({
          status: req.body.status,
          timestamp: new Date(),
          comment: '',
        });
      }
      
      // Update payment info if provided
      if (req.body.payment?.type && req.body.payment.type !== order.payment?.type) {
        console.log('Updating payment type to:', req.body.payment.type);
        order.payment.type = req.body.payment.type;
      }
      if (req.body.payment?.status && req.body.payment.status !== order.payment?.status) {
        console.log('Updating payment status to:', req.body.payment.status);
        order.payment.status = req.body.payment.status;
      }
      
      // Save the order with session
      console.log('Saving order to database...');
      await order.save({ session });
      console.log('Order saved successfully');
      
      // Commit transaction - everything was successful
      console.log('Committing transaction...');
      await session.commitTransaction();
      console.log('Transaction committed successfully');
      
      // ПОСЛЕ транзакции - отправка уведомлений
      if (statusChanged) {
        console.log('Sending notification for status change...');
        try {
          const usersWithAccess = await getUsersWithOrdersConfirmAccess(order.owner.target);
          
          // Отправляем уведомления всем пользователям с доступом, включая создателя
          await sendOrderNotifications(order, 'order_status', usersWithAccess, {
            oldStatus: oldStatus,
            newStatus: order.status,
            organization: order.owner.target
          });
          console.log('Notification sent successfully');
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
        }
      }
      
      console.log('Sending response to client...');
      res.status(200).send(order);
      console.log('=== ORDER UPDATE COMPLETED SUCCESSFULLY ===');
      
    } catch (err) {
      // Abort transaction on any error
      console.log('=== ERROR OCCURRED ===');
      console.error('Error details:', err);
      console.error('Error stack:', err.stack);
      
      try {
        await session.abortTransaction();
        console.log('Transaction aborted successfully');
      } catch (abortErr) {
        console.error('Error aborting transaction:', abortErr);
      }
      
      res.status(500).send({
        errorCode: 'UPDATE_ORDER_FAILED',
        message: 'Error occurred while updating the order.',
        error: err.message,
      });
      console.log('Error response sent to client');
    } finally {
      // Always end the session
      try {
        session.endSession();
        console.log('Session ended');
      } catch (sessionErr) {
        console.error('Error ending session:', sessionErr);
      }
      console.log('=== ORDER UPDATE PROCESS FINISHED ===');
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
