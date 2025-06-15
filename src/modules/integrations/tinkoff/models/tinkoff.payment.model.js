import mongoose from 'mongoose';
const PaymentSchema = new mongoose.Schema(
  {
    OrderId: String,
    Success: Boolean,
    Status: String,
    PaymentId: Number,
    PaymentURL: String,
    ErrorCode: String,
    Message: String,
    Details: String,
  },
  {
    // Make Mongoose use Unix time (seconds since Jan 1, 1970)
    timestamps: { currentTime: () => Date.now() },
  }
);
const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;
