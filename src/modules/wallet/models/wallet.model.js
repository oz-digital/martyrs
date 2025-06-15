export default db => {
  const WalletSchema = new db.mongoose.Schema(
    {
      owner: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: () => {
          if (this.owner.type === 'user') return 'User';
          if (this.owner.type === 'organization') return 'Organization';
        },
        required: true,
      },
      balances: [
        {
          name: String, // Name of currency
          amount: Number, // Amount
          locked_amount: Number,
        },
      ],
    },
    {
      timestamps: {
        currentTime: () => Date.now(),
      },
    },
    { strict: false }
  );
  return db.mongoose.model('Wallet', WalletSchema);
};
