# 4. Бизнес-логика и алгоритмы

## Алгоритм расчета доступности товаров

### Концепция On-Demand сборки

Ключевой особенностью системы является поддержка **on-demand производства** товаров из ингредиентов. Это означает, что товар может быть доступен для продажи даже при отсутствии готовых единиц на складе, если есть достаточно ингредиентов для его сборки.

### Алгоритм recalculateAvailability

Функция `recalculateAvailability` в файле `inventory.helpers.js` реализует сложную логику расчета доступности:

```javascript
async function recalculateAvailability(variantIds, storage, session) {
  // 1. Загрузка вариантов и их ингредиентов
  const variants = await db.variant.find({
    _id: { $in: variantIds }
  }).session(session).lean();
  
  // 2. Сбор всех ID ингредиентов из всех вариантов
  const allIngredientIds = new Set();
  variants.forEach(v => {
    v.ingredients?.forEach(ing => {
      allIngredientIds.add(ing._id.toString());
    });
  });
  
  // 3. Загрузка данных о количестве одним запросом (оптимизация N+1 problem)
  const availability = await db.stockAvailability.find({
    storage,
    $or: [
      { variant: { $in: variantIds } },           // Прямые остатки вариантов
      { product: { $in: Array.from(allIngredientIds) } }  // Остатки ингредиентов
    ]
  }).session(session).lean();
```

**Почему именно такая последовательность**:
1. **Batch loading**: Загружаем все данные минимальным количеством запросов
2. **Memory indexing**: Создаем in-memory индексы для быстрого поиска
3. **Bulk operations**: Обновляем все записи одной операцией

### Логика определения доступности

```javascript
variants.forEach(variant => {
  const directStock = quantityByVariant.get(variantId) || 0;
  
  // Начинаем с прямого остатка или Infinity для on-demand
  let available = directStock > 0 ? directStock : Infinity;
  const constraints = [];
  
  // Проверяем каждый обязательный ингредиент
  if (variant.ingredients?.length) {
    for (const ing of variant.ingredients) {
      if (ing.optional) continue;  // Пропускаем optional ингредиенты
      
      const stock = quantityByProduct.get(ing._id.toString()) || 0;
      const canMake = Math.floor(stock / (ing.quantity || 1));
      
      // Ограничиваем доступность минимальным ингредиентом
      if (directStock === 0 || canMake < available) {
        available = canMake;
      }
      
      // Сохраняем constraint для анализа
      constraints.push({
        ingredient: ing._id,
        stock,
        required: ing.quantity,
        available: canMake
      });
    }
  }
  
  // Если нет обязательных ингредиентов, возвращаемся к прямому остатку
  if (available === Infinity) {
    available = directStock;
  }
});
```

**Принципы расчета**:
1. **Прямой остаток приоритетен**: Если есть готовый товар, используем его количество
2. **Ингредиентное ограничение**: Доступность = min(прямой остаток, возможность сборки из ингредиентов)
3. **Optional ингредиенты игнорируются**: Не влияют на доступность
4. **Constraint tracking**: Сохраняем детали для анализа узких мест

### Примеры расчетов

**Сценарий 1: Только прямой остаток**
```
Товар: Готовая пицца "Маргарита"
Прямой остаток: 5 шт
Ингредиенты: нет
Результат: available = 5
```

**Сценарий 2: On-demand сборка**
```
Товар: Пицца "Пепперони" (собирается из ингредиентов)
Прямой остаток: 0 шт
Ингредиенты:
  - Тесто: остаток 10, требуется 1 → можно сделать 10 пицц
  - Соус: остаток 5, требуется 1 → можно сделать 5 пицц  
  - Пепперони: остаток 8, требуется 2 → можно сделать 4 пиццы
Результат: available = min(10, 5, 4) = 4
```

**Сценарий 3: Гибридный режим**
```
Товар: Пицца "Гавайская"
Прямой остаток: 3 шт
Ингредиенты могут дать еще: 7 шт
Результат: available = 3 (приоритет прямого остатка)
```

## Система автоматических алертов

### Интеграция алертов в расчет доступности

Алерты проверяются автоматически при каждом пересчете доступности:

```javascript
// 7. Проверяем алерты после обновления availability
for (const variant of variants) {
  const available = availabilityByVariant.get(variantId) || 0;
  
  // Найти все подходящие алерты (по приоритету специфичности)
  const alerts = await db.stockAlert.find({
    product: variant.product,
    enabled: true,
    $or: [
      { variant: null, storage: null },           // Глобальные
      { variant: null, storage: storage },        // По складу
      { variant: variant._id, storage: null },    // По варианту
      { variant: variant._id, storage: storage }  // Точечные
    ]
  }).session(session);
  
  for (const alert of alerts) {
    if (available < alert.threshold) {
      // Отправка уведомления через внешний сервис
      await fetch(`${process.env.API_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Key': process.env.SERVICE_KEY,
        },
        body: JSON.stringify({
          title: 'Low Stock Alert',
          body: `Stock is low: ${available} units (threshold: ${alert.threshold})`,
          type: 'stock_alert',
          metadata: {
            alertId: alert._id,
            productId: variant.product,
            variantId: variant._id,
            storageId: storage,
            currentStock: available,
            threshold: alert.threshold
          },
          userId: alert.creator.target
        })
      });
    }
  }
}
```

**Иерархия алертов**: Система проверяет алерты от общих к специфичным, что позволяет настраивать разные пороги для:
- Всех товаров глобально
- Товара на конкретном складе  
- Конкретного варианта товара
- Конкретного варианта на конкретном складе

## Транзакционный workflow создания adjustment

### Атомарная операция изменения остатков

Функция `create` в `adjustment.service.js` демонстрирует сложный транзакционный workflow:

```javascript
async create(req, res) {
  const session = await db.mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Создание записи движения (audit trail)
    const [adjustment] = await db.stockAdjustment.create([adjustmentData], { session });
    
    // 2. Атомарное обновление количества в StockAvailability
    const availability = await updateStockQuantity(
      db,
      adjustmentData.product,
      adjustmentData.variant,
      adjustmentData.storage,
      adjustmentData.quantity,
      adjustmentData.owner,
      adjustmentData.creator,
      session
    );
    
    // 3. Поиск всех затронутых вариантов
    const affectedVariants = new Set();
    if (adjustmentData.variant) {
      affectedVariants.add(adjustmentData.variant.toString());
    }
    
    // Найти варианты, использующие изменяемый продукт как ингредиент
    const dependentVariants = await db.variant.find({
      'ingredients._id': adjustmentData.product,
      'ingredients.optional': { $ne: true }
    }).distinct('_id').session(session);
    
    dependentVariants.forEach(v => affectedVariants.add(v.toString()));
    
    // 4. Пересчет доступности для всех затронутых вариантов
    if (affectedVariants.size) {
      await recalculateAvailability(
        Array.from(affectedVariants),
        adjustmentData.storage,
        session
      );
    }
    
    await session.commitTransaction();
    
    // 5. Post-commit операции (не влияют на транзакцию)
    invalidateCache(cache, logger, ['adjustments', 'availability']);
    
    setImmediate(() => {
      observer.notify('stock.adjusted', {
        adjustment,
        availability,
        affectedVariants
      });
    });
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### Почему именно такая последовательность

**В рамках транзакции**:
1. **StockAdjustment**: Создается первым для полного audit trail
2. **StockAvailability update**: Обновляет quantity через helper функцию
3. **Dependent variants search**: Находим все товары, которые могут быть затронуты
4. **Availability recalculation**: Обновляем расчетные данные

**После транзакции**:
5. **Cache invalidation**: Очищаем устаревшие данные
6. **Observer events**: Уведомляем другие модули

**Критическая важность порядка**: Если availability пересчитывается до обновления quantity, то новые остатки не будут учтены в расчете.

## Batch-обработка инвентаризации

### Двухфазный commit для аудитов

Инвентаризация использует pattern двухфазного commit:

**Фаза 1 - Draft**:
```javascript
// Создание audit в статусе draft
const audit = await db.stockAudit.create([{
  storage: auditData.storage,
  status: 'draft',
  positions: auditData.positions,  // Массив товарных позиций
  comment: auditData.comment
}], { session });
```

**Фаза 2 - Published** (при вызове `complete`):
```javascript
// Создание adjustment для каждой позиции
const adjustmentPromises = inventory.positions.map(position => {
  return db.stockAdjustment.create([{
    product: position.product,
    variant: position.variant,
    storage: inventory.storage,
    source: { type: 'Inventory', target: inventory._id },
    reason: position.reason || 'custom',
    quantity: position.quantity,
    cost: position.cost,
    creator: inventory.creator,
    owner: inventory.owner
  }], { session });
});

await Promise.all(adjustmentPromises);

// Batch обновление количества в StockAvailability
const bulkOps = inventory.positions.map(p => ({
  updateOne: {
    filter: {
      product: p.product,
      variant: p.variant || null,
      storage: inventory.storage
    },
    update: {
      $inc: { quantity: p.quantity },
      $setOnInsert: {
        owner: inventory.owner,
        creator: inventory.creator,
        available: 0,
        constraints: []
      }
    },
    upsert: true
  }
}));

await db.stockAvailability.bulkWrite(bulkOps, { session });

// Обновление статуса audit
inventory.status = 'published';
await inventory.save({ session });
```

**Преимущества двухфазного подхода**:
- **Безопасность**: можно создать черновик и проверить данные до применения
- **Атомарность**: либо все позиции обрабатываются, либо ни одна
- **Производительность**: bulk операции значительно быстрее отдельных update

## Кеширование и производительность

### Стратегия многоуровневого кеширования

```javascript
const cache = new Cache({ ttlSeconds: 300 });

// Чтение с кешированием
async read(req, res) {
  const cacheKey = JSON.stringify({ type: 'availability', ...req.verifiedQuery });
  let data = await cache.get(cacheKey);
  
  if (!data) {
    // Сложный aggregation pipeline для join данных
    const pipeline = [
      { $match: { /* filters */ } },
      { $lookup: { from: 'products', /* product data */ } },
      { $lookup: { from: 'spots', /* storage data */ } },
      { $limit: req.verifiedQuery.limit },
      { $skip: req.verifiedQuery.skip }
    ];
    
    data = await db.stockAvailability.aggregate(pipeline).exec();
    await cache.setWithTags(cacheKey, data, ['availability']);
  }
  
  res.json(data);
}

// Tag-based инвалидация (из inventory.helpers.js)
export function invalidateCache(cache, logger, tags) {
  setImmediate(() => {
    cache.delByTags(tags).catch(err => 
      logger.error('Cache invalidation error', err)
    );
  });
}
```

**Принципы кеширования**:
- **Query-based keys**: Кеш ключи включают все параметры запроса
- **Tag-based invalidation**: Связанные операции инвалидируют группы кеша
- **Fire-and-forget**: Инвалидация не блокирует основной поток
- **Error isolation**: Ошибки кеширования не влияют на функциональность

Эта бизнес-логика обеспечивает высокую производительность, надежность и точность расчетов в сложной многоскладской среде с поддержкой on-demand производства.