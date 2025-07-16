Вот доработанный **общий план перепроектирования системы аренды**, с учётом **абсолютно произвольных промежутков времени** (не только суток):

---

## 1. Оставляем `Rent` как историю и бизнес‑логику

Модель `Rent` остаётся основной для хранения фактов аренды и истории.

Добавляем индексы, чтобы находить активные пересекающиеся аренды:

```js
// В rent.model.js
RentSchema.index({ variant: 1, startDate: 1, endDate: 1 });
RentSchema.index({ product: 1, startDate: 1, endDate: 1 });
```

---

## 2. Вводим коллекцию `TimeSlot` для любых интервалов

### Зачем?

Чтобы быстро проверять доступность на произвольные интервалы времени, без тяжёлых агрегаций по коллекции `Rent`.

### Схема

```js
const TimeSlotSchema = new mongoose.Schema({
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: 'Variant', // или Ingredient
  },
  start: {
    type: Date,
    required: true,
    index: true,
  },
  end: {
    type: Date,
    required: true,
    index: true,
  },
  reserved: {
    type: Number,
    required: true,
  },
});
TimeSlotSchema.index({ resource: 1, start: 1, end: 1 });
TimeSlotSchema.index({ resource: 1, start: 1 });
TimeSlotSchema.index({ resource: 1, end: 1 });

const TimeSlot = db.mongoose.model('TimeSlot', TimeSlotSchema);
```

---

## 3. Обновление `TimeSlot` при аренде

На подтверждение или отмену аренды:

```js
async function updateTimeSlots(rent, delta) {
  // Создаём или изменяем слот по точному периоду
  const baseOp = {
    updateOne: {
      filter: {
        resource: rent.variant,
        start: rent.startDate,
        end: rent.endDate
      },
      update: { $inc: { reserved: delta } },
      upsert: true
    }
  };

  const ingOps = rent.variant.ingredients.map(ing => ({
    updateOne: {
      filter: {
        resource: ing._id,
        start: rent.startDate,
        end: rent.endDate
      },
      update: { $inc: { reserved: delta * ing.quantity * rent.quantity } },
      upsert: true
    }
  }));

  await TimeSlot.bulkWrite([baseOp, ...ingOps]);
}
```

> Обновление происходит при изменении статуса `Rent`: `pending → confirmed`, `confirmed → canceled`, и т.д.

---

## 4. Проверка доступности на произвольный интервал

1. Получаем `StockBalance` для варианта или ингредиента.
2. Запрашиваем `TimeSlot`, которые **пересекают** интересующий интервал:

```js
const overlapping = await TimeSlot.find({
  resource: variantId,
  $or: [
    { start: { $lt: endDate }, end: { $gt: startDate } }
  ]
}).lean();

const maxReserved = overlapping.reduce((sum, slot) => sum + slot.reserved, 0);
const stock = await StockBalance.findOne({ variant: variantId, storage });
const available = stock.quantity - maxReserved;
```

3. Для составных товаров:

   * Повторяем проверку по каждому ингредиенту
   * Берём минимум из доступных

---

## 5. Почему это быстро и гибко

* **Любые интервалы** — можно бронировать хоть на 15 минут, хоть на 5 дней.
* **Предикативная проверка** — пересекающиеся слоты запрашиваются мгновенно через индексы.
* **Чтение** — два лёгких запроса: в `StockBalance` и `TimeSlot`.
* **Запись** — один `bulkWrite` на аренду.
* **Мало документов** — каждый слот покрывает конкретный интервал, без дробления по дням.

---

## 6. Дополнительно

* **Нормализация по шагу** — при необходимости можно округлять интервалы к ближайшему часу/получасу.
* **TTL-удаление** — добавить TTL-индекс на `end`, чтобы автоматически удалять старые слоты.
* **Транзакции** — желательно использовать MongoDB transactions для консистентности между `Rent` и `TimeSlot`.
* **Промежуточный кэш** — если high-load, можно кэшировать слоты в Redis на популярные даты/ресурсы.
* **Поддержка `time-series`** — начиная с MongoDB 5.0 можно использовать `time-series` коллекции для хранения слотов.

---

## 7. Возможный гибрид: суточные + произвольные

Если большинство аренд всё же по дням:

* используем `DailySlot` (date‑based)
* и `FreeFormSlot` (с интервалами)
* проверка доступности объединяет оба типа

---

## Итого:

* **Rent** — остаётся неизменной как лог и история.
* **TimeSlot** — новая коллекция для fast-check.
* **Произвольные интервалы** — поддерживаются из коробки.
* **Масштабируемость** — высокая, агрегации не нужны.
* **Скорость** — мгновенные индексы по `(resource, start, end)`.

Такой подход используется в сложных системах бронирования (видеостудии, каршаринг, логистика), и подходит для MongoDB‑экосистемы.
