# Техническая документация: Модуль Inventory

## 1. Назначение модуля

Модуль `inventory` управляет складскими операциями в системе martyrs. Основные функции:
- **Учёт остатков и доступности** (stock availability) товаров с учётом ингредиентов
- **Корректировки остатков** (stock adjustments) с историей изменений  
- **Инвентаризация** (stock audits) с пакетным обновлением остатков
- **Алерты** по критическим остаткам
- **Автоматический пересчёт** доступности через Change Streams

## 2. Общая архитектура (клиент ⇄ сервер)

### Инициализация модуля

**Клиентская сторона** (`inventory.client.js`):
```
Vue App → initializeInventory() → Router + Components
                ↓
    addRoutes() для backoffice/organization контекстов
```

**Серверная сторона** (`inventory.server.js`):
```
Express App → initializeInventory() → Models + Routes + Policies
                ↓
    Регистрация моделей в db + настройка API endpoints
```

### Архитектура взаимодействий

```
Vue Components (UI)
      ↓ HTTP requests
Vue Store (inventory.store.js) 
      ↓ axios calls
Express Routes (inventory.routes.js)
      ↓ middleware chain
[JWT] → [Verifier] → [ABAC] → [Service]
      ↓ business logic
Services (adjustment/availability/audit.service.js)
      ↓ shared helpers
Helpers (inventory.helpers.js)
      ↓ database operations  
MongoDB Models + Cache + Observer + Change Streams
```

## 3. Потоки данных и точки входа

### Основные API endpoints:

```
GET  /api/inventory/adjustments     - История корректировок
POST /api/inventory/adjustments/create - Создание корректировки

GET  /api/inventory/availability    - Доступность и остатки товаров

GET  /api/inventory/audits          - Список инвентаризаций
POST /api/inventory/audits/create   - Создание инвентаризации
POST /api/inventory/audits/complete - Завершение инвентаризации
```

### Клиентские маршруты:

```
/inventory/        → InventoryList   (Inventory.vue)
/inventory/audit   → InventoryAudit  (InventoryEdit.vue)
```

Поддерживает два контекста:
- **backoffice**: `BackofficeInventoryList`, `BackofficeInventoryAudit`  
- **organization**: `OrganizationInventoryList`, `OrganizationInventoryAudit`

## 4. Аутентификация и авторизация (пошагово)

### Middleware цепочка:

1. **JWT верификация** (`jwtFactory`):
   ```js
   jwt.verifyToken()      // обязательная аутентификация
   jwt.verifyToken(true)  // опциональная аутентификация
   ```

2. **Валидация входных данных** (`verifierFactory`):
   ```js
   verifier.verifyAdjustmentQuery    // GET параметры
   verifier.verifyAdjustmentBody     // POST тело запроса
   verifier.verifyBalanceQuery       // фильтры остатков
   verifier.verifyInventoryBody      // данные инвентаризации
   ```

3. **ABAC авторизация** (`globalsabac`):
   ```js
   abac.middleware('stockAdjustment', 'create')  // для создания корректировок
   abac.middleware('stockAudit', 'create')       // для создания инвентаризации  
   abac.middleware('stockAudit', 'edit')         // для завершения инвентаризации
   ```

### Политики безопасности:

В `inventory.policies.js` **закомментированы** стандартные политики:
- Создание корректировки: роли `warehouse`, `admin`, `moderator`
- Завершение инвентаризации: только создатель или `admin`

**Примечание**: Политики отключены - требуется настройка в зависимости от бизнес-требований.

## 5. Структура файлов и их связи

```
inventory/
├── inventory.client.js           # Точка входа клиента
├── inventory.server.js           # Точка входа сервера
├── router/
│   └── inventory.router.js       # Клиентские маршруты
├── routes/
│   ├── inventory.routes.js       # API endpoints
│   └── stock.alerts.routes.js    # API для алертов
├── services/
│   ├── adjustment.service.js     # Сервис корректировок
│   ├── availability.service.js   # Сервис доступности
│   ├── audit.service.js          # Сервис инвентаризаций
│   └── inventory.helpers.js      # Общие функции и хелперы
├── middlewares/
│   ├── inventory.verifier.js     # Валидация запросов
│   └── stock.alerts.verifier.js  # Валидация алертов
├── models/
│   ├── stock.adjustment.model.js # История корректировок
│   ├── stock.availability.model.js # Остатки и доступность
│   ├── stock.audit.model.js      # Инвентаризации
│   └── stock.alerts.model.js     # Алерты по остаткам
├── store/
│   ├──  inventory.store.js       # Vue состояние
│   └── stock.alerts.store.js     # Состояние алертов
├── components/
│   ├── pages/
│   │   ├── Inventory.vue         # Список товаров с остатками
│   │   └── InventoryEdit.vue     # Создание инвентаризации
│   └── forms/
│       ├── AdjustmentForm.vue    # Форма корректировки
│       ├── HistoryView.vue       # История движений
│       ├── ColumnSettingsMenu.vue # Настройки колонок
│       └── StockAlertsForm.vue   # Настройка алертов
├── policies/
│   └── inventory.policies.js     # ABAC политики (отключены)
└── workers/
    └── inventory.availability.worker.js # Фоновый пересчёт
```

### Ключевые зависимости:

- **Глобальные модули**: `@martyrs/src/modules/core/*` (cache, logger, validator, abac)
- **Аутентификация**: `@martyrs/src/modules/auth/controllers/middlewares/authJwt.js`
- **Vue компоненты**: Vue 3 Composition API + реактивное состояние
- **MongoDB Change Streams**: Автоматический пересчёт при изменении ингредиентов

## 6. Как интегрировать модуль в проект

### Серверная интеграция:

```js
import { initialize as initInventory } from './modules/inventory/inventory.server.js';

// В основном server.js
initInventory(app, db, origins, publicPath);
```

При инициализации автоматически запускаются Change Streams для отслеживания изменений в ингредиентах товаров.

### Клиентская интеграция:

```js
import inventoryModule from './modules/inventory/inventory.client.js';

// В Vue приложении
inventoryModule.initialize(app, store, router, {
  routeBackoffice: 'Backoffice Root',
  routeOrganizations: 'OrganizationRoot',
  withBackoffice: false,        // включить backoffice роуты
  withOrganizationRoutes: false // включить organization роуты
});
```

### Экспорт компонентов:

```js
import { 
  Inventory, 
  InventoryEdit,
  AdjustmentForm, 
  HistoryView,
  ColumnSettingsMenu,
  StockAlertsForm 
} from './modules/inventory/inventory.client.js';
```

## 7. Расширение модуля

### Добавление новой причины корректировки:

1. **Модель** (`stock.adjustment.model.js`):
   ```js
   reason: { 
     enum: ['restock', 'sale', 'return', 'damage', 'transfer', 'custom', 'new_reason']
   }
   ```

2. **Валидатор** (`middlewares/inventory.verifier.js`):
   ```js
   validator: Validator.schema().string().oneOf([..., 'new_reason'])
   ```

### Добавление нового типа инвентаризации:

1. **Расширить схему** `stock.audit.model.js`
2. **Добавить валидацию** в `middlewares/inventory.verifier.js`  
3. **Обновить бизнес-логику** в `services/audit.service.js`
4. **Создать UI компонент** в `components/forms/`

### Добавление кастомных политик ABAC:

```js
// В inventory.policies.js
abac.registerResourcePolicy('stockAdjustment', async context => {
  const { user, action, data } = context;
  
  // Ваша логика авторизации
  if (action === 'create' && data.reason === 'damage') {
    // Только менеджеры могут списывать по браку
    return await checkManagerRole(user);
  }
  
  return { allow: true };
});
```

## 8. Безопасность

### Аутентификация:
- **JWT токены** через `authJwt.js` middleware
- **Опциональная аутентификация** для публичных endpoints (`availability`)

### Валидация данных:
- **Joi-схемы** через `core.validator.js`
- **Строгая типизация** параметров и тела запросов
- **Санитизация** входных данных

### Авторизация:
- **ABAC система** через `core.abac.js`
- **Контекстная авторизация** (resource + action)
- **Роли и права доступа** настраиваются через политики

### Защита API:
- **CORS** настройки через `origins`
- **Rate limiting** на уровне Express
- **Логирование** всех операций через `core.logger.js`

### Транзакции:
- **MongoDB сессии** для атомарных операций
- **Rollback** при ошибках через `session.abortTransaction()`

## 9. Ключевые сценарии использования

### Сценарий 1: Корректировка остатков

```
1. Пользователь заходит в Inventory.vue
2. Нажимает "создать корректировку" 
3. Заполняет AdjustmentForm.vue (товар, склад, количество, причина)
4. POST /api/inventory/adjustments/create
   ├── JWT проверка токена
   ├── Валидация данных
   ├── ABAC проверка прав ('stockAdjustment', 'create')  
   ├── Создание StockAdjustment записи
   ├── Обновление StockAvailability (+quantity)
   ├── Пересчёт StockAvailability.доступности для затронутых вариантов
   ├── Проверка алертов по критическим остаткам
   └── Инвалидация кеша
5. Обновление UI через reactive store
```

### Сценарий 2: Инвентаризация склада

```
1. Переход в InventoryEdit.vue
2. Выбор склада и добавление позиций
3. POST /api/inventory/audits/create (status: 'draft' | 'published')
4. Если status = 'published':
   ├── Создание StockAdjustment для каждой позиции
   ├── Batch update StockAvailability через bulkWrite
   ├── Пересчёт availability для всех затронутых товаров
   └── Уведомления через Observer pattern
5. Если status = 'draft' - сохранение без применения
6. POST /api/inventory/audits/complete для применения draft инвентаризации
```

### Сценарий 3: Мониторинг доступности товаров

```
1. GET /api/inventory/availability?storage=X&details=true
2. Агрегация из Products с join к StockAvailability
3. Расчёт итоговой доступности:
   ├── Прямые остатки (quantity в StockAvailability)
   ├── On-demand производство (через ингредиенты)
   └── Ограничения по ингредиентам
4. Кеширование результата на 5 минут
5. Real-time обновления через change streams на коллекции variants
```

### Сценарий 4: Автоматические алерты

```
1. При любом изменении остатков (adjustment/inventory)
2. Поиск активных алертов для товара/склада
3. Проверка threshold vs текущий остаток
4. Если остаток < порога:
   ├── HTTP запрос в /api/notifications
   ├── Метаданные: alertId, productId, currentStock, threshold
   └── Уведомление создателю алерта
5. Логирование ошибок, но не прерывание основной операции
```

---

**Заключение**: Модуль inventory реализует полноценную систему складского учёта с поддержкой сложных сценариев (on-demand производство, пакетные операции, real-time уведомления). Архитектура построена на принципах разделения ответственности, транзакционности и масштабируемости.

Основные особенности архитектуры:
- **Модульность**: сервисы разделены по бизнес-функциям (adjustment, availability, audit)
- **Единая модель StockAvailability**: хранит и остатки (quantity) и доступность (available)
- **Change Streams**: автоматический пересчёт при изменении ингредиентов
- **Общие хелперы**: переиспользуемые функции вынесены в inventory.helpers.js