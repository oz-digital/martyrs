import * as QRCode from 'qrcode';
const controllerFactory = db => {
  const Payment = db.payment;
  const Wallet = db.wallet;
  const Order = db.order;
  const create = async (req, res) => {
    let { amount, positions, userId } = req.body;
    const newPayment = new Payment(req.body);
    await newPayment.save();
    const qrData = `PaymentID:${newPayment._id};Amount:${amount}`;
    const qrCode = await QRCode.toDataURL(qrData);
    res.send({ qrCode, paymentId: newPayment._id });
  };
  const read = async (req, res) => {
    try {
      const paymentes = await Payment.find({}).sort({ createdAt: 'desc' }).exec();
      if (!paymentes) {
        return res.status(404).send({ message: 'Paymentes not found.' });
      }
      res.status(200).send(paymentes);
    } catch (err) {
      res.status(500).send({ message: err.toString() });
    }
  };
  const update = async (req, res) => {
    const session = await db.mongoose.startSession();
    session.startTransaction();
    try {
      const { paymentId, walletId } = req.body; // Теперь мы работаем с walletId
      const payment = await Payment.findById(paymentId).session(session);
      if (!payment) {
        throw new Error('Payment not found');
      }
      if (payment.status !== 'pending') {
        throw new Error('Payment is not in a pending state');
      }
      const wallet = await Wallet.findById(walletId).session(session);
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      if (wallet.amount < payment.amount) {
        throw new Error('Insufficient funds');
      }
      // Списание средств с кошелька
      wallet.amount -= payment.amount;
      await wallet.save({ session });
      // Обновление статуса платежа
      payment.status = 'completed';
      await payment.save({ session });
      await session.commitTransaction();
      res.send('Payment processed successfully');
    } catch (error) {
      await session.abortTransaction();
      res.status(500).send(error.message);
    } finally {
      session.endSession();
    }
  };
  async function processPayment(paymentIntent) {
    const paymentId = paymentIntent.id;
    const paymentExists = await Payment.findOne({ paymentId });
    // Check if the payment has been processed before
    if (!paymentExists) {
      try {
        const newPayment = new Payment({
          paymentId: paymentId,
          status: 'processing',
          metadata: paymentIntent.metadata, // Store any additional data needed
        });
        await newPayment.save();
        // Update payment status to 'completed'
        newPayment.status = 'completed';
        await newPayment.save();
      } catch (err) {
        console.error('Failed to process payment intent:', err);
        newPayment.status = 'failed';
        await newPayment.save();
      }
    }
  }
  const deletePayment = (req, res) => {
    Payment.findOneAndDelete({ _id: req.params._id }, (err, payment) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
      if (!payment) {
        return res.status(404).send({ message: 'Something wrong when deleting payment.' });
      }
      res.status(200).send(payment);
    });
  };
  return {
    create,
    read,
    update,
    delete: deletePayment,
  };
};
export default controllerFactory;
