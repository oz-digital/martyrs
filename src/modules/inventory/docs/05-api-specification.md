# 5. API спецификация

## Обзор API endpoints

Модуль Inventory предоставляет RESTful API для управления складскими запасами. Все endpoints требуют аутентификации через JWT токен и поддерживают ABAC авторизацию.

**Base URL**: `/api/inventory`

## Stock Adjustments API

### GET /api/inventory/adjustments
Получение списка движений товаров с фильтрацией и пагинацией.

**Аутентификация**: Требуется JWT (`jwt.verifyToken(true)`)  
**Авторизация**: Не требуется (только фильтрация по owner)

**Query параметры**:
```javascript
{
  product?: string,     // ObjectId товара
  variant?: string,     // ObjectId варианта
  storage?: string,     // ObjectId склада
  reason?: string,      // Причина движения
  dateStart?: date,     // Начало периода
  dateEnd?: date,       // Конец периода
  skip?: integer,       // Offset для пагинации (default: 0)
  limit?: integer       // Лимит записей (default: 20, max: 100)
}
```

**Пример запроса**:
```bash
GET /api/inventory/adjustments?storage=507f1f77bcf86cd799439011&reason=restock&limit=10
Authorization: Bearer <jwt_token>
```

**Пример ответа**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "product": "507f1f77bcf86cd799439013",
    "variant": "507f1f77bcf86cd799439014",
    "storage": "507f1f77bcf86cd799439011",
    "source": {
      "type": "User",
      "target": "507f1f77bcf86cd799439015"
    },
    "reason": "restock",
    "quantity": 50,
    "cost": 1000,
    "comment": "Поступление от поставщика",
    "productData": {
      "name": "Пицца Маргарита",
      "sku": "PIZZA-001"
    },
    "createdAt": "2023-12-01T10:30:00Z",
    "owner": { "type": "organization", "target": "..." },
    "creator": { "type": "user", "target": "..." }
  }
]
```

### POST /api/inventory/adjustments/create
Создание движения товара (поступление/расход).

**Аутентификация**: Требуется JWT (`jwt.verifyToken()`)  
**Авторизация**: ABAC `stockAdjustment:create`

**Request Body**:
```javascript
{
  product: string,           // ObjectId товара (required)
  variant?: string,          // ObjectId варианта
  storage: string,           // ObjectId склада (required)
  source: {                  // Источник движения (required)
    type: 'User' | 'Order' | 'Inventory',
    target: string           // ObjectId источника
  },
  reason: 'restock' | 'sale' | 'return' | 'damage' | 'transfer' | 'custom',
  quantity: integer,         // Изменение количества (+/-) (required)
  cost?: number,            // Стоимость (>=0)
  comment?: string          // Комментарий
}
```

**Пример запроса**:
```bash
POST /api/inventory/adjustments/create
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "product": "507f1f77bcf86cd799439013",
  "variant": "507f1f77bcf86cd799439014",
  "storage": "507f1f77bcf86cd799439011",
  "source": {
    "type": "User",
    "target": "507f1f77bcf86cd799439015"
  },
  "reason": "restock",
  "quantity": 100,
  "cost": 2500,
  "comment": "Поступление товара на склад"
}
```

**Пример ответа**:
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "product": "507f1f77bcf86cd799439013",
  "variant": "507f1f77bcf86cd799439014",
  "storage": "507f1f77bcf86cd799439011",
  "source": {
    "type": "User",
    "target": "507f1f77bcf86cd799439015"
  },
  "reason": "restock",
  "quantity": 100,
  "cost": 2500,
  "comment": "Поступление товара на склад",
  "createdAt": "2023-12-01T10:30:00Z",
  "owner": { "type": "organization", "target": "..." },
  "creator": { "type": "user", "target": "..." }
}
```

**Побочные эффекты**:
- Обновляется количество в `StockAvailability` для товара
- Пересчитывается доступность в `StockAvailability` для всех зависимых вариантов
- Проверяются и отправляются `StockAlert` уведомления
- Генерируется событие `stock.adjusted`
- Инвалидируется кеш с тегами `['adjustments', 'availability']`


## Stock Availability API

### GET /api/inventory/availability
Получение текущих остатков и доступности товаров для продажи с учетом ингредиентов.

**Аутентификация**: Не требуется (публичный endpoint)  
**Авторизация**: Не требуется

**Query параметры**:
```javascript
{
  product?: string,     // Фильтр по товару
  storage?: string,     // Фильтр по складу
  skip?: integer,       // Offset (default: 0)
  limit?: integer,      // Лимит (default: 50, max: 100)
  details?: string,     // Дополнительная детализация
  search?: string,      // Поиск по названию
  sortParam?: string,   // Поле сортировки
  sortOrder?: 'asc' | 'desc'  // Направление сортировки
}
```

**Особенности ответа**:
- Включает поле `quantity` (физический остаток)
- Включает расчетные поля `available` и `constraints`
- Показывает ограничения по ингредиентам
- Оптимизирован для e-commerce интеграции

**Пример ответа**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439018",
    "product": "507f1f77bcf86cd799439013",
    "variant": "507f1f77bcf86cd799439014",
    "storage": "507f1f77bcf86cd799439011",
    "quantity": 10,         // Физический остаток
    "available": 8,         // Доступно для продажи
    "reservations": 2,      // Зарезервировано
    "constraints": [        // Ограничения по ингредиентам
      {
        "ingredient": "507f1f77bcf86cd799439019",
        "stock": 50,        // Остаток ингредиента
        "required": 2,      // Требуется на единицу
        "available": 25     // Можно произвести единиц
      }
    ],
    "calculatedAt": "2023-12-01T10:35:00Z"
  }
]
```

## Stock Audit API

### GET /api/inventory/audits
Получение списка инвентаризаций.

**Аутентификация**: Требуется JWT  
**Авторизация**: Не требуется (фильтрация по owner)

**Query параметры**: Стандартные для листинга

**Пример ответа**:
```json
[
  {
    "_id": "507f1f77bcf86cd79943901A",
    "storage": "507f1f77bcf86cd799439011",
    "status": "published",
    "positions": [
      {
        "product": "507f1f77bcf86cd799439013",
        "variant": "507f1f77bcf86cd799439014",
        "quantity": 5,
        "reason": "custom",
        "comment": "Недостача при инвентаризации"
      }
    ],
    "comment": "Плановая инвентаризация декабрь 2023",
    "createdAt": "2023-12-01T09:00:00Z",
    "owner": { "type": "organization", "target": "..." },
    "creator": { "type": "user", "target": "..." }
  }
]
```

### POST /api/inventory/audits/create
Создание новой инвентаризации.

**Аутентификация**: Требуется JWT  
**Авторизация**: ABAC `stockAudit:create`

**Request Body**:
```javascript
{
  storage: string,           // ObjectId склада (required)
  comment?: string,          // Комментарий к инвентаризации
  status?: 'draft' | 'published',  // Статус (default: 'draft')
  positions: [               // Массив позиций (required)
    {
      product: string,       // ObjectId товара (required)
      variant?: string,      // ObjectId варианта
      quantity: integer      // Количество для корректировки (required)
    }
  ]
}
```

**Поведение в зависимости от статуса**:
- **draft**: Сохраняет данные без влияния на остатки
- **published**: Сразу создает adjustments и обновляет балансы

### POST /api/inventory/audits/complete
Публикация (завершение) инвентаризации.

**Аутентификация**: Требуется JWT  
**Авторизация**: ABAC `stockAudit:edit`

**Request Body**:
```javascript
{
  _id: string               // ObjectId инвентаризации
}
```

**Выполняемые операции**:
1. Создание `StockAdjustment` для каждой позиции
2. Batch обновление количества в `StockAvailability`
3. Пересчет доступности в `StockAvailability` для затронутых товаров
4. Изменение статуса audit на `published`
5. Генерация события `inventory.completed`

## Stock Alerts API

### Полный CRUD через универсальный контроллер
**Base Path**: `/api/inventory/alerts`

**Доступные endpoints**:
- `GET /api/inventory/alerts` - Список алертов
- `POST /api/inventory/alerts` - Создание алерта
- `GET /api/inventory/alerts/:id` - Получение алерта
- `PUT /api/inventory/alerts/:id` - Обновление алерта
- `DELETE /api/inventory/alerts/:id` - Удаление алерта

**Схема алерта**:
```javascript
{
  product: string,          // ObjectId товара (required)
  variant?: string,         // ObjectId варианта (null = все варианты)
  storage?: string,         // ObjectId склада (null = все склады)
  threshold: number,        // Пороговое значение (required, >=0)
  enabled: boolean          // Активность алерта (default: true)
}
```

**Пример создания алерта**:
```bash
POST /api/inventory/alerts
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "product": "507f1f77bcf86cd799439013",
  "variant": null,
  "storage": "507f1f77bcf86cd799439011", 
  "threshold": 10,
  "enabled": true
}
```

## Коды ошибок и обработка

### Стандартные HTTP коды
- `200` - Успешная операция
- `201` - Создание ресурса
- `400` - Ошибка валидации
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

### Формат ошибок валидации
```json
{
  "errors": [
    {
      "field": "quantity",
      "message": "Quantity must be an integer",
      "value": "invalid_value"
    }
  ]
}
```

### Формат серверных ошибок  
```json
{
  "message": "Internal server error occurred",
  "code": "INVENTORY_ERROR",
  "details": "Additional error context"
}
```

## Производительность и кеширование

### Кешируемые endpoints
- `GET /api/inventory/adjustments` - TTL 300 секунд, теги `['adjustments']`
- `GET /api/inventory/availability` - TTL 300 секунд, теги `['availability']`
- `GET /api/inventory/alerts` - TTL 300 секунд, теги `['stockAlerts', 'inventory']`

### Инвалидация кеша
- **Stock Adjustment операции** → инвалидация `['adjustments', 'availability']`
- **Inventory Audit операции** → инвалидация `['inventories', 'availability']`
- **Alert операции** → инвалидация `['stockAlerts', 'inventory']`

### Рекомендации по использованию
- Используйте пагинацию для больших наборов данных
- Применяйте фильтры для снижения объема трафика
- Кешируйте результаты на клиенте с учетом TTL
- Подписывайтесь на события через WebSocket для real-time обновлений