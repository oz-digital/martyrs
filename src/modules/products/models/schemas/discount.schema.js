export default db => {
  const DiscountSchema = new db.mongoose.Schema(
    {
      type: {
        type: String,
        enum: ['discount', 'special_price'],
        default: 'discount',
        required: true
      },
      value: {
        type: Number,
        required: true,
        min: 0
      },
      quantity: {
        type: Number,
        min: 1,
      },
      date: {
        start: Date,
        end: Date
      },
      time: {
        start: String, // 'HH:mm' формат
        end: String
      },
      name: String,
      description: String,
    },
    { _id: false }
  );
  return DiscountSchema;
};