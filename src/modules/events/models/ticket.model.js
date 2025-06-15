export default db => {
  const TicketSchema = new db.mongoose.Schema(
    {
      client: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Client',
      },
      client_refactor: {
        email: {
          type: String,
        },
        name: {
          type: String,
        },
      },
      seat: {
        type: String,
      },
      price: {
        type: Number,
      },
      user: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      type: {
        type: String,
        enum: ['event', 'parking'],
        default: 'event',
        required: true,
      },
      target: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: function (value) {
          if (this.type === 'event') return 'Event';
          if (this.type === 'parking') return 'Parking';
        },
        required: true,
      },
      role: {
        type: String,
        default: 'participant',
      },
      qrcode: {
        type: String,
      },
      image: {
        type: String,
      },
      status: {
        type: String,
        enum: ['unused', 'used', 'deactivated'],
        deafult: 'unused',
      },
    },
    {
      timestamps: {
        currentTime: () => Date.now(),
      },
    }
  );
  TicketSchema.index({ user: 1, type: 1, target: 1 });
  const Ticket = db.mongoose.model('Ticket', TicketSchema);
  return Ticket;
};
