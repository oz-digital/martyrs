import accessesSchema from './schemas/accesses.schema.js';
export default db => {
  // Схема отдела
  const departmentSchema = new db.mongoose.Schema(
    {
      owner: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      organization: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
      },
      profile: {
        photo: { type: String },
        name: { type: String, required: true },
        description: { type: String },
        categories: [String],
      },
      worktime: [
        {
          day: String,
          time: {
            start: String,
            end: String,
          },
        },
      ],
      hidden: {
        type: Boolean,
        default: false,
      },
      accesses: accessesSchema,
      // Marketplace options
      delivery: [String],
      payment: [String],
      members: [
        {
          user: {
            type: db.mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          position: {
            type: String,
            default: 'Member',
          },
        },
      ],
      subdepartments: [
        {
          type: db.mongoose.Schema.Types.ObjectId,
          ref: 'Department',
        },
      ],
    },
    {
      timestamps: true,
    }
  );
  departmentSchema.index({ organization: 1 });
  const Department = db.mongoose.model('Department', departmentSchema);
  return Department;
};
