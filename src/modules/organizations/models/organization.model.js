import applyEngagementSchema from '@martyrs/src/modules/core/models/schemas/engagement.schema.js';
import accessesSchema from './schemas/accesses.schema.js';
export default db => {
  const OrganizationSchema = new db.mongoose.Schema(
    {
      // Creator and owner of organizations
      owner: {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      official: {
        type: Boolean,
        default: false,
      },
      // Types of organizations
      types: {
        type: Array,
        required: true,
      },
      accesses: accessesSchema,
      // Information for profile
      profile: {
        photo: String,
        name: {
          type: String,
          required: true,
        },
        description: String,
        tags: [String],
      },
      // Contacts
      contacts: {
        email: String,
        website: String,
        phone: {
          type: String,
          // match: /^\+?[1-9]\d{1,14}$/
        },
        address: String,
      },
      socials: {
        telegram: String,
        twitter: String,
        facebook: String,
        instagram: String,
        youtube: String,
      },
      // Computed Rating
      rating: {
        popularity: {
          type: Number,
          min: 0,
          max: 1,
        },
        median: {
          type: Number,
          min: 0,
          max: 5,
        },
        amount: Number,
      },
    },
    {
      timestamps: true,
    }
  );
  applyEngagementSchema(OrganizationSchema, db);
  OrganizationSchema.index({ _id: 1, owner: 1 });
  // const Testimonial = require('./testimonial.model.js');
  // OrganizationSchema.methods.calculateRating = async function() {
  //   // Найдем все отзывы для данной организации
  //   const testimonials = await Testimonial.find({ organization: this._id });
  //   let sum = 0;
  //   let median = 0;
  //   let popularity = 0;
  //   // Если нет отзывов, то все рейтинги равны 0
  //   if (testimonials.length === 0) {
  //     this.rating = {
  //       amount: 0,
  //       median: 0,
  //       popularity: 0
  //     };
  //     return;
  //   }
  //   // Если есть отзывы, то вычисляем средний рейтинг
  //   testimonials.forEach((testimonial) => {
  //     sum += parseFloat(testimonial.rating); // предполагаем, что рейтинг - это число
  //   });
  //   median = sum / testimonials.length;
  //   popularity = testimonials.length / 100;
  //   // Обновляем рейтинг организации
  //   this.rating = {
  //     amount: testimonials.length,
  //     median: median,
  //     popularity: popularity
  //   };
  //   // Сохраняем изменения в модели организации
  //   await this.save();
  // }
  const Organization = db.mongoose.model('Organization', OrganizationSchema);
  return Organization;
};
