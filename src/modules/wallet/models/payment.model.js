export default db => {
  const PaymentSchema = new db.mongoose.Schema(
    {
      data: {
        type: Object,
      },
      currency: {
        type: String,
      },
      status: {
        type: String,
      },
      customer: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      creator: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    {
      timestamps: {
        currentTime: () => Date.now(),
      },
    }
  );
  const Payment = db.mongoose.model('Payment', PaymentSchema);
  return Payment;
};
