# 6. Права доступа

## Архитектура системы авторизации

Модуль Inventory использует многоуровневую систему контроля доступа, основанную на трех основных принципах:

1. **JWT Authentication** - Базовая аутентификация пользователей
2. **ABAC Authorization** - Attribute-Based Access Control для fine-grained permissions
3. **Owner-based filtering** - Мультитенантная изоляция данных

## JWT Authentication Layer

### Типы аутентификации по endpoints

```javascript
// Строгая аутентификация - только авторизованные пользователи
app.post('/api/inventory/adjustments/create', 
  jwt.verifyToken(),                    // Требует валидный JWT
  // ... other middleware
);

// Мягкая аутентификация - поддержка анонимных запросов с фильтрацией
app.get('/api/inventory/adjustments', 
  jwt.verifyToken(true),               // true = не блокирует анонимов
  // ... other middleware
);

// Публичный доступ - без аутентификации
app.get('/api/inventory/availability', 
  // Нет jwt.verifyToken() - публичный endpoint
  verifier.verifyAvailabilityQuery,
  controller.availability.read
);
```

### Извлечение пользователя из JWT

После успешной аутентификации JWT middleware устанавливает:
- `req.userId` - ObjectId текущего пользователя
- `req.userDoc` - (опционально) полный объект пользователя с ролями

## ABAC Authorization System

### Текущее состояние политик

**Важно**: В текущей версии все ABAC политики в файле `inventory.policies.js` **закомментированы**, что означает **permissive mode** - все операции разрешены после JWT аутентификации.

```javascript
// Эти политики готовы к активации, но сейчас отключены:

// abac.registerResourcePolicy('stockAdjustment', async context => {
//   const { user, action, data } = context;
//   
//   if (action === 'create') {
//     const userDoc = context.userDoc || await db.user.findById(user).populate('roles');
//     const hasWarehouseRole = userDoc?.roles?.some(r => 
//       ['warehouse', 'admin', 'moderator'].includes(r.name || r)
//     );
//     
//     if (!hasWarehouseRole) {
//       return { allow: false, reason: 'WAREHOUSE_ROLE_REQUIRED' };
//     }
//   }
//   
//   return { allow: true, force: false };
// });
```

### Middleware интеграция ABAC

В маршрутах ABAC middleware активно используется:

```javascript
// Stock Adjustment creation
app.post('/api/inventory/adjustments/create', 
  jwt.verifyToken(), 
  verifier.verifyAdjustmentBody, 
  abac.middleware('stockAdjustment', 'create'),  // ABAC проверка
  controller.adjustments.create
);

// Stock Audit completion
app.post('/api/inventory/audits/complete', 
  jwt.verifyToken(), 
  verifier.verifyInventoryComplete, 
  abac.middleware('stockAudit', 'edit'),        // ABAC проверка
  controller.inventory.complete
);
```

### Потенциальные политики доступа

#### Stock Adjustment Policies

**Концепция**: Только складские работники могут изменять остатки товаров.

```javascript
// Готовая к активации политика
abac.registerResourcePolicy('stockAdjustment', async context => {
  const { user, action, data } = context;
  
  if (action === 'create') {
    // Проверка роли пользователя
    const userDoc = context.userDoc || await db.user.findById(user).populate('roles');
    const hasWarehouseRole = userDoc?.roles?.some(r => 
      ['warehouse', 'admin', 'moderator'].includes(r.name || r)
    );
    
    if (!hasWarehouseRole) {
      return { allow: false, reason: 'WAREHOUSE_ROLE_REQUIRED' };
    }
  }
  
  return { allow: true, force: false };
});
```

**Применение**:
- `warehouse` role - основные складские операции
- `admin` role - полный доступ ко всем операциям
- `moderator` role - надзорные функции

#### Stock Audit Policies

**Концепция**: Только создатель инвентаризации или администратор может ее завершить.

```javascript
// Готовая к активации политика
abac.registerResourcePolicy('stockAudit', async context => {
  const { user, action, currentResource } = context;
  
  if (action === 'edit' && currentResource) {
    // Проверка ownership или admin прав
    if (currentResource.creator.target.toString() !== user) {
      const userDoc = context.userDoc || await db.user.findById(user).populate('roles');
      const isAdmin = userDoc?.roles?.some(r => r.name === 'admin' || r === 'admin');
      
      if (!isAdmin) {
        return { allow: false, reason: 'NOT_INVENTORY_CREATOR' };
      }
    }
  }
  
  return { allow: true, force: false };
});
```

**Применение**:
- Создатель audit может его завершить
- Admin может завершать любые audit
- Другие пользователи получают отказ

## Owner-based Data Isolation

### Мультитенантная архитектура

Все основные модели используют `ownership.schema` для изоляции данных:

```javascript
// В каждой модели (кроме StockAvailability)
applyOwnershipSchema(StockAdjustmentSchema, db);

// Структура ownership
{
  owner: {
    type: 'organization' | 'user',
    target: ObjectId                    // ID организации или пользователя
  },
  creator: {
    type: 'user',
    target: ObjectId                    // ID создавшего пользователя
  }
}
```

### Автоматическая фильтрация по owner

В контроллерах происходит неявная фильтрация данных:

```javascript
// Пример из availability controller
const matchConditions = {
  ...(req.verifiedQuery?.owner && { 
    'owner.target': new db.mongoose.Types.ObjectId(req.verifiedQuery.owner) 
  })
};

// Пользователи видят только свои данные или данные своей организации
```

### Наследование ownership

При создании ресурсов owner наследуется:

```javascript
// В adjustment creation
const adjustmentData = {
  ...req.verifiedBody,
  creator: { type: 'user', target: req.userId },      // Создатель = текущий пользователь
  owner: req.verifiedBody.owner                       // Owner передается в запросе
};
```

## Права доступа по операциям

### Матрица доступа

| Операция | Аутентификация | ABAC Policy | Owner Filter | Публичный доступ |
|----------|---------------|-------------|--------------|------------------|
| **GET /adjustments** | Мягкая ✓ | Нет | ✓ | Частично |
| **POST /adjustments/create** | Строгая ✓ | stockAdjustment:create | ✓ | Нет |
| **GET /balance** | Мягкая ✓ | Нет | ✓ | Частично |
| **GET /availability** | Нет | Нет | Частично | ✓ |
| **GET /audits** | Строгая ✓ | Нет | ✓ | Нет |
| **POST /audits/create** | Строгая ✓ | stockAudit:create | ✓ | Нет |
| **POST /audits/complete** | Строгая ✓ | stockAudit:edit | ✓ | Нет |
| **CRUD /alerts/** | Строгая ✓ | Настраиваемо | ✓ | Нет |

### Особенности доступа

#### Публичный endpoint availability
```javascript
// Единственный endpoint без аутентификации
app.get('/api/inventory/availability', 
  verifier.verifyAvailabilityQuery,    // Только валидация
  controller.availability.read         // Без auth/abac middleware
);
```

**Назначение**: Поддержка e-commerce интеграций, где внешние системы должны проверять доступность товаров без аутентификации.

#### Мягкая аутентификация для чтения
```javascript
// Поддерживает и авторизованных, и анонимных пользователей
app.get('/api/inventory/adjustments', 
  jwt.verifyToken(true),               // true = не блокирует анонимов
  verifier.verifyAdjustmentQuery, 
  controller.adjustments.read
);
```

**Логика**: 
- Авторизованные пользователи видят данные своей организации
- Анонимные пользователи получают пустые результаты (owner filter блокирует)

## Context-aware авторизация

### Различия контекстов

Клиентская часть поддерживает два контекста с разными правами:

```javascript
// Backoffice context - админская панель
meta: { context: 'backoffice' }
// Полный доступ ко всем функциям, cross-organization просмотр

// Organization context - клиентский интерфейс  
meta: { context: 'organization' }
// Ограниченный доступ только к данным своей организации
```

### Влияние на UI

```vue
<!-- Условный рендеринг на основе контекста -->
<button
  v-if="route.meta.context === 'backoffice'"
  @click="router.push({ name: 'BackofficeInventoryAudit' })"
/>

<button
  v-if="route.meta.context === 'organization'"
  @click="router.push({ 
    name: 'OrganizationInventoryAudit', 
    params: { _id: route.params._id } 
  })"
/>
```

## Активация политик безопасности

### Пошаговая активация ABAC

Для включения строгих политик доступа:

1. **Раскомментировать политики** в `inventory.policies.js`
2. **Настроить роли пользователей** в системе управления ролями
3. **Протестировать политики** на тестовой среде
4. **Задокументировать изменения** для команды

### Пример активации

```javascript
// 1. Раскомментировать политику
abac.registerResourcePolicy('stockAdjustment', async context => {
  // ... policy logic
});

// 2. Обновить тесты
it('should deny access for non-warehouse users', async () => {
  const response = await request(app)
    .post('/api/inventory/adjustments/create')
    .set('Authorization', `Bearer ${regularUserToken}`)
    .send(adjustmentData);
  
  expect(response.status).toBe(403);
  expect(response.body.reason).toBe('WAREHOUSE_ROLE_REQUIRED');
});
```

### Мигграционные соображения

**Текущее состояние**: Permissive mode позволяет всем аутентифицированным пользователям выполнять любые операции.

**После активации**: Потребуется:
- Назначить роли существующим пользователям
- Обновить интеграции для обработки 403 ошибок
- Подготовить документацию по ролям для бизнес-пользователей

Эта архитектура обеспечивает гибкость настройки прав доступа от полностью открытой системы до строго регламентированной с детальным контролем на уровне операций и ресурсов.