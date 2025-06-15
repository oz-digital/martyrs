export default db => {
  const MembershipSchema = new db.mongoose.Schema(
    {
      user: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      type: {
        type: String,
        enum: ['organization', 'department', 'user'],
        default: 'organization',
        required: true,
      },
      role: {
        type: String,
        default: 'subscriber',
      },
      label: {
        type: String,
        default: 'subscriber',
      },
      target: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: function (value) {
          if (this.type === 'user') return 'User';
          if (this.type === 'organization') return 'Organization';
        },
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );
  MembershipSchema.index({ user: 1, target: 1, role: 1 });
  const Membership = db.mongoose.model('Membership', MembershipSchema);
  return Membership;
};
