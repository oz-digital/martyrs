export default db => {
  // Схема отдела
  const spotSchema = new db.mongoose.Schema({
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
    minorder: { type: Number },
    position: {
      hide: { type: Boolean },
    },
    // Working hours
    address: String,
    // Position on map
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    // Обновленная структура для часов работы
    worktime: {
      // Стандартные часы работы
      regular: [
        {
          // 0 = воскресенье, 6 = суббота (соответствует JavaScript Date.getDay())
          dayOfWeek: { type: Number, min: 0, max: 6, required: true },
          isOpen: { type: Boolean, default: true },
          periods: [
            {
              open: { type: String, required: true }, // формат "HH:MM" 24-часовой
              close: { type: String, required: true }, // формат "HH:MM" 24-часовой
            },
          ],
        },
      ],
      // Особые даты (праздники, особые события и т.д.)
      special: [
        {
          date: { type: Date, required: true },
          isOpen: { type: Boolean, default: false },
          periods: [
            {
              open: { type: String }, // формат "HH:MM" 24-часовой
              close: { type: String }, // формат "HH:MM" 24-часовой
            },
          ],
          description: { type: String }, // описание особого дня (например, "Новый год")
        },
      ],
    },
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
    subspots: [
      {
        type: db.mongoose.Schema.Types.ObjectId,
        ref: 'Spot',
      },
    ],
  });
  // Индексы
  spotSchema.index({ organization: 1 });
  spotSchema.index({ location: '2dsphere' });
  // Виртуальное свойство для проверки открыт ли спот в данный момент
  spotSchema.virtual('isOpenNow').get(function () {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    // Проверка особых дат
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const specialDay = this.worktime?.special?.find(special => special.date.getTime() === today.getTime());
    if (specialDay) {
      if (!specialDay.isOpen) return false;
      return specialDay.periods.some(period => period.open <= currentTime && period.close > currentTime);
    }
    // Проверка обычных часов работы
    const regularHours = this.worktime?.regular?.find(day => day.dayOfWeek === currentDay);
    if (!regularHours || !regularHours.isOpen) return false;
    return regularHours.periods.some(period => period.open <= currentTime && period.close > currentTime);
  });
  spotSchema.set('toJSON', { virtuals: true });
  spotSchema.set('toObject', { virtuals: true });
  const Spot = db.mongoose.model('Spot', spotSchema);
  return Spot;
};
