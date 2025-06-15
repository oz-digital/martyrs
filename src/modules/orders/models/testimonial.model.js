export default db => {
  const testimonialSchema = new db.mongoose.Schema({
    source: {
      type: String,
    },
    author: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  });
  const Testimonial = db.mongoose.model('Testimonial', testimonialSchema);
  return Testimonial;
};
