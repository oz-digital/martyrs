# 2. Архитектура системы

## Общие архитектурные принципы

Модуль Inventory построен на основе **многослойной архитектуры** с четким разделением ответственности между слоями. Система использует **materialized views** для оптимизированного хранения расчетных данных доступности товаров.

Ключевой особенностью архитектуры является **синхронная модель данных**, где изменения в остатках товаров автоматически запускают пересчет доступности с учетом ингредиентов в рамках той же транзакции.

## Архитектурные слои

```
┌─────────────────────────────────────┐
│           UI Layer (Vue.js)         │
│  components/pages/, components/forms/  │
└─────────────────┬───────────────────┘
                  │ API Calls
┌─────────────────▼───────────────────┐
│    Store Layer (Vue 3 Reactive)     │
│     store/inventory.store.js        │
└─────────────────┬───────────────────┘
                  │ HTTP Requests
┌─────────────────▼───────────────────┐
│         API Layer (Express)         │
│      routes/inventory.routes.js     │
└─────────────────┬───────────────────┘
                  │ Business Logic
┌─────────────────▼───────────────────┐
│       Service Layer                 │
│  adjustment.service.js              │
│  availability.service.js            │
│  audit.service.js                   │
│  inventory.helpers.js               │
└─────────────────┬───────────────────┘
                  │ Data Operations
┌─────────────────▼───────────────────┐
│       Data Layer (MongoDB)          │
│         models/*.model.js           │
└─────────────────────────────────────┘
```

## Инициализация серверной части

Серверная инициализация происходит в файле `inventory.server.js` через функцию `initializeInventory`:

```javascript
function initializeInventory(app, db, origins, publicPath) {
  // 1. Регистрация моделей в глобальном объекте db
  db.stockAdjustment = StockAdjustmentModel(db);
  db.stockAvailability = StockAvailabilityModel(db);
  db.stockAudit = StockAuditModel(db);
  db.stockAlert = StockAlertModel(db);
  
  // 2. Подключение маршрутов и политик безопасности
  if (app) {
    inventoryRoutes(app, db, origins, publicPath);
    inventoryPolicies(db);
    
    // 3. Инициализация Change Streams для автоматического пересчёта
    const { cache, logger } = createSharedServices(db);
    initChangeStreams(db, logger, recalculateAvailability, (tags) => invalidateCache(cache, logger, tags));
  }
}
```

**Почему такая последовательность**: Сначала регистрируются модели, чтобы они стали доступны через глобальный объект `db` во всех слоях приложения. Только после этого подключаются маршруты, которые зависят от наличия моделей. Политики безопасности инициализируются вместе с маршрутами. В конце запускаются Change Streams для автоматического пересчёта доступности при изменении ингредиентов товаров.

## Инициализация клиентской части

Клиентская инициализация в `inventory.client.js` настраивает Vue-роутинг для двух различных контекстов:

```javascript
function initializeInventory(app, store, router, options = {}) {
  // Backoffice routes - полный доступ для администраторов
  if (!options.withBackoffice) {
    addRoutes(router, {
      parentName: options.routeBackoffice || 'Backoffice Root',
      basePath: 'inventory',
      routes: routerInventory,
      routeNamePrefix: 'Backoffice',
      filterConfig: {
        include: ['InventoryList', 'InventoryAudit']
      },
      meta: { context: 'backoffice' }
    });
  }

  // Organization routes - ограниченный доступ для организаций
  if (!options.withOrganizationRoutes) {
    addRoutes(router, {
      parentName: options.routeOrganizations || 'OrganizationRoot',
      basePath: 'inventory', 
      routes: routerInventory,
      routeNamePrefix: 'Organization',
      filterConfig: {
        include: ['InventoryList', 'InventoryAudit']
      },
      meta: { context: 'organization' }
    });
  }
}
```

**Зачем два контекста**: 
- **Backoffice context**: административный интерфейс с полным доступом ко всем функциям
- **Organization context**: клиентский интерфейс с ограничениями по ownership и функциональности

Фильтрация маршрутов через `filterConfig.include` позволяет включать только необходимые страницы для каждого контекста.

## Синхронная система пересчета доступности

Пересчет доступности товаров происходит **синхронно** в рамках транзакций изменения остатков и **асинхронно** через Change Streams при изменении ингредиентов. Функция `recalculateAvailability` в `inventory.helpers.js` обновляет данные доступности в `StockAvailability`:

```javascript
// В adjustment.service.js - create
async create(req, res) {
  const session = await db.mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Создание adjustment
    const [adjustment] = await db.stockAdjustment.create([adjustmentData], { session });
    
    // 2. Обновление количества в StockAvailability
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
    
    // 3. Пересчет доступности в той же транзакции
    if (affectedVariants.length) {
      await recalculateAvailability(db, logger, affectedVariants, adjustmentData.storage, session);
    }
    
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}
```

**Преимущества синхронного подхода**:
- **Консистентность данных**: доступность всегда соответствует текущим остаткам
- **Атомарность**: все изменения происходят в одной транзакции
- **Простота отладки**: нет асинхронных race conditions

### Автоматический пересчёт через Change Streams

Система использует MongoDB Change Streams для автоматического пересчёта доступности при изменении ингредиентов товаров. Реализация находится в `inventory.helpers.js`:

```javascript
// inventory.helpers.js - активно используется
export function initChangeStreams(db, logger, recalculateAvailability, invalidateCache) {
  const pipeline = [
    { $match: { 
      operationType: { $in: ['insert', 'update', 'replace', 'delete'] },
      'fullDocument.ingredients': { $exists: true }
    }}
  ];
  
  const changeStream = db.variant.collection.watch(pipeline, { 
    fullDocument: 'updateLookup' 
  });
  
  changeStream.on('change', async (change) => {
    // Асинхронный пересчет при изменении ингредиентов
    const variantId = change.documentKey._id;
    const storages = await db.stockAvailability.distinct('storage', {
      variant: variantId
    });
    
    for (const storage of storages) {
      await recalculateAvailability(db, logger, [variantId], storage);
    }
    
    invalidateCache(['availability', `variant:${variantId}`]);
  });
}
```

**Преимущества интегрированной системы**:
- Автоматический пересчет при изменении рецептов без задержки основных операций
- Консистентность данных между ингредиентами и доступностью
- Асинхронная обработка не блокирует основные операции

## Паттерн Observer для межмодульного взаимодействия

Система использует Observer pattern для уведомления других модулей о важных событиях:

```javascript
// В adjustment.service.js
observer.notify('stock.adjusted', {
  adjustment,
  availability,
  affectedVariants
});

// В audit.service.js
observer.notify('inventory.completed', {
  inventory,
  affectedVariants
});
```

**Зачем Observer**: Прямые вызовы между модулями создают tight coupling. Observer позволяет:
- **Расширяемость**: новые модули могут подписываться на события без изменения inventory
- **Асинхронность**: события обрабатываются через `setImmediate()`, не блокируя основной поток
- **Отказоустойчивость**: падение одного обработчика не влияет на других

## Кеширование и производительность

Архитектура включает многоуровневое кеширование для обеспечения производительности:

```javascript
// Кеширование в service layer (availability.service.js)
const { cache, logger } = createSharedServices(db);
const cacheKey = JSON.stringify({ type: 'availability', ...req.verifiedQuery });

let data = await cache.get(cacheKey);
if (!data) {
  data = await db.stockAvailability.aggregate(pipeline).exec();
  await cache.setWithTags(cacheKey, data, ['availability']);
}
```

**Стратегия инвалидации**: Используется tag-based invalidation через функцию `invalidateCache` из `inventory.helpers.js`:
- Изменение количества → инвалидация тегов `['availability']`
- Создание adjustment → инвалидация тегов `['adjustments', 'availability']`
- Завершение инвентаризации → инвалидация тегов `['adjustments', 'availability', 'inventories']`

## Транзакционная целостность

Критические операции (adjustments, audit completion) выполняются в MongoDB транзакциях:

```javascript
const session = await db.mongoose.startSession();
session.startTransaction();

try {
  // 1. Создание adjustment
  const [adjustment] = await db.stockAdjustment.create([adjustmentData], { session });
  
  // 2. Обновление количества в StockAvailability
  const availability = await updateStockQuantity(
    db, product, variant, storage, quantity, owner, creator, session
  );
  
  // 3. Пересчет доступности с учётом ингредиентов
  await recalculateAvailability(db, logger, affectedVariants, storage, session);
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**Атомарность операций**: Без транзакций возможны race conditions, когда количество обновилось, но доступность еще не пересчиталась. Транзакции гарантируют, что система никогда не находится в inconsistent состоянии. Все операции изменения остатков выполняются атомарно вместе с пересчётом доступности.