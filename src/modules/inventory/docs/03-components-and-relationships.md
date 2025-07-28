# 3. Компоненты и их взаимодействие

## Route Layer - HTTP API endpoints

### Основные маршруты инвентаризации

Файл `inventory.routes.js` определяет основные HTTP endpoints с полной middleware цепочкой:

```javascript
export default function(app, db) {
  const jwt = jwtFactory(db);
  const verifier = verifierFactory(db);
  const abac = getInstance(db);
  const adjustmentService = adjustmentServiceFactory(db);
  const availabilityService = availabilityServiceFactory(db);
  const auditService = auditServiceFactory(db);
  
  // Типичная цепочка middleware: Auth → Validation → Authorization → Business Logic
  app.post('/api/inventory/adjustments/create', 
    jwt.verifyToken(),                        // JWT аутентификация
    verifier.verifyAdjustmentBody,            // Валидация входных данных
    abac.middleware('stockAdjustment', 'create'), // ABAC авторизация
    adjustmentService.create                  // Бизнес-логика
  );
}
```

**Архитектурная особенность**: Каждый маршрут проходит через стандартизированную цепочку middleware, что обеспечивает:
- **Единообразие**: одинаковая схема безопасности для всех endpoints
- **Расширяемость**: легко добавить новые middleware без изменения бизнес-логики
- **Тестируемость**: каждый слой можно тестировать изолированно

### Группировка endpoints по сущностям

```javascript
// StockAdjustment routes
app.get('/api/inventory/adjustments', ...)        // Чтение списка движений
app.post('/api/inventory/adjustments/create', ...)  // Создание движения

// StockAvailability routes  
app.get('/api/inventory/availability', ...)        // Текущие остатки и доступность

// StockAudit routes
app.get('/api/inventory/audits', ...)              // Список инвентаризаций
app.post('/api/inventory/audits/create', ...)      // Создание инвентаризации
app.post('/api/inventory/audits/complete', ...)    // Завершение инвентаризации
```

**Зачем такая группировка**: Каждая группа endpoints соответствует отдельной бизнес-сущности, что упрощает:
- **API discovery**: разработчикам понятно, где искать нужную функциональность
- **Версионирование**: можно изменять API для одной сущности независимо от других
- **Мониторинг**: метрики можно собирать по типам операций

### CRUD паттерн для Stock Alerts

Файл `stock.alerts.routes.js` демонстрирует использование универсального CRUD класса:

```javascript
const stockAlertsCRUD = new CRUD({
  app, db,
  model: db.stockAlert,
  modelName: 'stockAlert',
  basePath: '/api/inventory/alerts',
  
  auth: true,                    // Требует аутентификации
  
  verifiers: {                   // Кастомные валидаторы для каждой операции
    create: verifier.createVerifier,
    read: verifier.readVerifier,
    update: verifier.updateVerifier,
    delete: verifier.deleteVerifier
  },
  
  abac: abac,                    // ABAC авторизация
  
  cache: {                       // Конфигурация кеширования
    enabled: true,
    ttl: 300,
    tags: ['stockAlerts', 'inventory']
  },
  
  events: {                      // Система событий
    enabled: true,
    logReads: false              // Не логировать чтение (слишком много событий)
  }
});
```

**Преимущества CRUD паттерна**:
- **Стандартизация**: все CRUD операции работают одинаково
- **Конфигурируемость**: можно настроить кеширование, события, валидацию отдельно для каждой сущности
- **DRY принцип**: не нужно дублировать код для базовых операций

## Store Layer - Клиентское состояние

### Reactive State Management

Файл ` inventory.store.js` использует Vue 3 Composition API для управления состоянием:

```javascript
const state = reactive({
  // Основные коллекции данных
  adjustments: [],      // История движений товаров
  availability: [],     // Текущие остатки и доступность для продажи
  inventories: [],      // Список инвентаризаций
  
  // Состояние текущей операции (например, создание инвентаризации)
  current: {
    storage: null,      // Выбранный склад
    positions: [],      // Позиции в инвентаризации
    comment: '',        // Комментарий
    status: 'draft'     // Статус draft/published
  },
  
  // Фильтры для поиска и сортировки
  filters: {
    storage: null,      // Фильтр по складу
    product: null,      // Фильтр по товару
    dateStart: null,    // Период от
    dateEnd: null       // Период до
  }
});
```

**Почему reactive**: Vue 3 reactive обеспечивает автоматическое обновление UI при изменении данных без необходимости вызывать специальные методы обновления.

### Actions - API Integration

```javascript
const actions = {
  async createAdjustment(data) {
    try {
      const response = await $axios.post('/api/inventory/adjustments/create', data);
      state.adjustments.unshift(response.data);  // Добавляем в начало списка
      return response.data;
    } catch (error) {
      setError(error);                           // Глобальная обработка ошибок
      throw error;                               // Пробрасываем для компонента
    }
  }
};
```

**Паттерн обработки**: Каждый action выполняет три операции:
1. **API запрос**: отправка данных на сервер
2. **State update**: обновление локального состояния
3. **Error handling**: обработка ошибок через глобальную систему

### Mutations - State Modifications

```javascript
const mutations = {
  addPosition(position) {
    state.current.positions.push(position);     // Добавление позиции в инвентаризацию
  },
  
  removePosition(index) {
    state.current.positions.splice(index, 1);  // Удаление позиции
  },
  
  resetCurrent() {                              // Сброс текущей операции
    state.current = {
      storage: null,
      positions: [],
      comment: '',
      status: 'draft'
    };
  }
};
```

**Separation of Concerns**: Mutations отвечают только за изменение состояния, а actions - за взаимодействие с API. Это упрощает тестирование и отладку.

## Component Layer - UI интеграция

### Context-Aware Navigation

Компонент `Inventory.vue` адаптируется к контексту выполнения:

```vue
<template>
  <header class="mn-b-medium flex-v-center flex-nowrap flex">
    <h2>Inventory</h2>
    
    <!-- Кнопка создания инвентаризации - зависит от контекста -->
    <button
      v-if="route.meta.context === 'backoffice'"
      @click="router.push({ name: 'BackofficeInventoryAudit' })"
      class="mn-l-small radius-100 i-big hover-scale-1 cursor-pointer t-white bg-second"
    />
    
    <button
      v-if="route.meta.context === 'organization'"
      @click="router.push({ name: 'OrganizationInventoryAudit', params: { _id: route.params._id } })"
      class="mn-l-small radius-100 i-big hover-scale-1 cursor-pointer t-white bg-second"
    />
  </header>
</template>
```

**Адаптивность**: Один компонент работает в двух режимах:
- **Backoffice**: полные админские права без привязки к конкретной организации
- **Organization**: работа в рамках конкретной организации (параметр `_id`)

### Feed Integration Pattern

```vue
<Feed
  :search="true"
  v-model:sort="sort"
  :store="{
    read: (options) => products.actions.read(options),  // Делегирование чтения в products store
    state: products.state
  }"
  :options="{
    limit: 15,
    lookup: ['inventory','categories'],                  // Подключение инвентарных данных
    owner: route.params._id,                            // Фильтрация по владельцу
    sortParam: sort.param,
    sortOrder: sort.order
  }"
  v-slot="{ items }"
>
```

**Паттерн интеграции**: Компонент Inventory не работает напрямую с товарами, а делегирует это Products store. При этом он добавляет lookup для инвентарных данных, получая комбинированную информацию.

### Table Customization

```vue
<Table
  :columns="columns.filter(col => col.visible)"          // Динамические колонки
  :items="items"
  class="bg-white z-index-1 br-solid br-1px br-light radius-medium"
>
  <!-- Кастомная ячейка для отображения доступности -->
  <template #cell-available="{ row }">
    <div class="flex-column flex">
      <span class="d-block mn-b-thin">
        {{ row.totalAvailable || 0 }}
      </span>
      
      <!-- Прогресс-бар уровня запасов -->
      <div class="w-full h-0-5r bg-light radius-small overflow-hidden">
        <div 
          class="h-full radius-small"
          :class="getStockLevelClass(row.totalAvailable)"
          :style="{ width: getStockLevelPercent(row.totalAvailable) + '%' }"
        />
      </div>
    </div>
  </template>
  
  <!-- Кастомная ячейка для складов -->
  <template #cell-storages="{ row }">
    <div class="w-max-10r flex-nowrap flex t-trim">
      <p
        v-if="row.availabilityDetails?.length"
        v-for="avail in row.availabilityDetails" 
        :key="avail._id"
        class="w-max t-trim pd-small mn-r-micro radius-small bg-light t-small"
      >
        <span class="t-medium">{{ avail.available || 0 }}</span> ·  
        <span class="t-small">{{ avail.storageName || avail.storage }}:</span>
      </p>
      <p v-else>No stock</p>
    </div>
  </template>
</Table>
```

**Rich Data Presentation**: Компонент не только отображает сырые данные, но и:
- **Визуализирует уровни запасов** через цветовые индикаторы и прогресс-бары
- **Группирует данные по складам** для удобного восприятия
- **Позволяет настраивать видимость колонок** через `columns.filter(col => col.visible)`

## Межкомпонентное взаимодействие

### Цепочка передачи данных

```
User Action (click) → Component Event Handler → Store Action → API Request → Server Controller → Database → Response → Store State Update → Component Re-render
```

**Конкретный пример - создание stock adjustment**:

1. **User Action**: Пользователь заполняет `AdjustmentForm.vue` и нажимает "Save"
2. **Component**: `AdjustmentForm.vue` эмитит событие `@save` с данными adjustment
3. **Parent Component**: `Inventory.vue` получает событие и вызывает `inventory.actions.createAdjustment(data)`
4. **Store Action**: Отправляет POST `/api/inventory/adjustments/create`
5. **Server Route**: `jwt.verifyToken() → verifier.verifyAdjustmentBody → abac.middleware → adjustmentService.create`
6. **Business Logic**: Создает adjustment, обновляет количество в StockAvailability, пересчитывает доступность
7. **Response**: Возвращает созданный объekt adjustment
8. **Store Update**: `state.adjustments.unshift(response.data)`
9. **UI Update**: Таблица автоматически обновляется через reactive связь

### Event Bus Pattern

```javascript
// В adjustment.service.js
observer.notify('stock.adjusted', {
  adjustment,
  availability,
  affectedVariants
});

// В другом модуле
observer.on('stock.adjusted', (data) => {
  // Реакция на изменение остатков
  updateRelatedData(data.affectedVariants);
});
```

**Слабая связанность**: Компоненты не знают друг о друге напрямую, что позволяет:
- **Легко добавлять новые обработчики** без изменения основного кода
- **Изолировать ошибки**: падение одного обработчика не влияет на другие
- **Упрощать тестирование**: можно мокать события

## Dependency Injection Pattern

### Factory Pattern для Services

```javascript
// В routes/inventory.routes.js
const jwt = jwtFactory(db);          // Создание JWT service с доступом к db
const verifier = verifierFactory(db); // Создание validator service
const abac = getInstance(db);        // Singleton ABAC instance
const adjustmentService = adjustmentServiceFactory(db); // Создание adjustment service
const availabilityService = availabilityServiceFactory(db); // Создание availability service
const auditService = auditServiceFactory(db); // Создание audit service
```

**Преимущества**:
- **Тестируемость**: легко подставить моки вместо реальных services
- **Конфигурируемость**: можно передавать разные конфигурации через параметры
- **Отложенная инициализация**: services создаются только когда нужны

Эта архитектура обеспечивает высокую модульность и maintainability кода, позволяя легко тестировать, расширять и модифицировать отдельные компоненты без влияния на систему в целом.