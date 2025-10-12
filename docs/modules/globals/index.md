# Globals

## Введение

Модуль `globals` является ядром (core) всего фреймворка и обязателен для использования при работе с другими модулями. Он содержит основные конструкторские элементы, которые используются другими модулями фреймворка.
[[toc]]

## Серверная часть

Основные компоненты модуля `globals`:

- ABAC - система управления доступом на основе атрибутов
- Validator - компонент для валидации данных
- Verifier - компонент для проверки данных
- Observer - паттерн наблюдатель для реализации событийной модели
- Logger - система логирования
- Cache - система кэширования

### Инициализация модуля

Инициализация модуля `globals` происходит через функцию `initializeGlobals`. Эта функция должна вызываться в начале работы приложения, до инициализации других модулей.

```javascript
// Пример инициализации модуля globals
const globals = require('@martyrs/src/modules/core');

// Инициализация
core.initialize(app, db, origins, publicPath);
```

Параметры функции `initialize`:

- `app` - экземпляр Express приложения
- `db` - объект базы данных с Mongoose соединением
- `origins` - массив разрешенных источников для CORS
- `publicPath` - путь к публичным файлам

При инициализации модуль создаёт модель `Log` в MongoDB, если она ещё не существует, и инициализирует подсистему ABAC.

Исправим документацию, устранив указанные неточности и приведя её в соответствие с предоставленным кодом модуля. Ниже представлена обновлённая версия документации, которая отражает реальную функциональность системы ABAC (Attribute-Based Access Control).

---

### ABAC

**ABAC** (Attribute-Based Access Control) — это система управления доступом, основанная на атрибутах. Она позволяет гибко настраивать права доступа на основе атрибутов пользователя, ресурса, действия и окружения.

#### Основные концепции ABAC

- **User** — пользователь или система, запрашивающая доступ.
- **Resource** — объект, к которому запрашивается доступ.
- **Action** — операция, которую субъект хочет выполнить с ресурсом.
- **Data** — контекст запроса (например, время, IP-адрес и т.д.).
- **Policy** — правило, определяющее, разрешен ли доступ.

---

#### Инициализация ABAC

Для создания экземпляра ABAC используется синглтон-функция `getInstance`, которая принимает базу данных и необязательный объект настроек:

```javascript
const { getInstance } = require('@martyrs/src/modules/core/controllers/classes/core.abac.js');
const abac = getInstance(db, options);
```

- **`db`** — объект базы данных (обязательный параметр).
- **`options`** — необязательный объект с настройками:
  - `strictMode` (булево) — строгая проверка доступа (по умолчанию `false`).
  - `defaultDeny` (булево) — запрет доступа по умолчанию, если политики не дают явного разрешения (по умолчанию `false`).
  - `serviceKey` (строка) — ключ для сервисных запросов (по умолчанию берётся из `process.env.SERVICE_KEY`).

---

#### Регистрация политик

Политики в ABAC регистрируются с использованием следующих методов:

- **`registerGlobalPolicy(name, policyFn)`** — регистрирует глобальную политику.
- **`registerResourcePolicy(resourceName, policyFn)`** — регистрирует политику для конкретного ресурса.
- **`registerExtension(moduleName, extensionFn)`** — регистрирует расширение от внешнего модуля.

Пример регистрации глобальной политики:

```javascript
abac.registerGlobalPolicy('PersonalResourceOwnerPolicy', async context => {
  const { user, action, currentResource } = context;
  if (action === 'edit' && currentResource) {
    return currentResource.creator.target.equals(user);
  }
  return true;
});
```

**Примечание**: В документации ранее упоминался метод `abac.createPolicy`, но он отсутствует в коде модуля. Вместо него используются методы `registerGlobalPolicy` и `registerResourcePolicy`.

---

#### Проверка доступа

Метод **`checkAccess`** используется для проверки доступа и принимает объект контекста:

```javascript
const accessResult = await abac.checkAccess({
  user: userId,
  resource: 'posts',
  action: 'read',
  data: {
    /* данные запроса */
  },
  options: {
    /* дополнительные опции */
  },
  isServiceRequest: false,
});
```

- **`user`** — идентификатор пользователя (строка).
- **`resource`** — тип ресурса (например, `'posts'`).
- **`action`** — действие (например, `'read'`, `'edit'`).
- **`data`** — данные запроса (объект, содержащий `body`, `query`, `params` и т.д.).
- **`options`** — дополнительные параметры (например, `allowUnauthenticated`).
- **`isServiceRequest`** — флаг, указывающий, является ли запрос сервисным.

**Результат**:

- Возвращает объект `{ allowed: boolean, reason: string }`, где:
  - `allowed` — разрешен ли доступ.
  - `reason` — причина решения (например, `'ACCESS_ALLOWED'` или `'DENIED_BY_GLOBAL_POLICY'`).

**Особенности**:

- Если указан `data._id`, `data.params._id` или `data.url`, метод автоматически загружает ресурс из базы данных и добавляет его в контекст как `currentResource`.
- Сервисные запросы (с валидным `serviceKey`) пропускают проверку доступа.

---

#### Middleware для Express

ABAC предоставляет middleware для интеграции с маршрутами Express:

```javascript
const middleware = abac.middleware('posts', 'read', { allowUnauthenticated: true });
app.get('/posts', middleware, (req, res) => {
  res.json({ message: 'Доступ разрешен' });
});
```

- **`resource`** — тип ресурса.
- **`action`** — действие.
- **`options`** — дополнительные параметры (например, `allowUnauthenticated`).

**Логика работы**:

- Middleware проверяет заголовок `x-service-key`. Если ключ валиден, запрос помечается как сервисный и передаётся дальше.
- В случае успеха вызывает `next()`. При запрете доступа возвращает ошибку `403` с телом `{ errorCode, message }`.

---

#### Пример политики личного владения ресурсом

Политика `PersonalResourceOwnerPolicy` проверяет права пользователя на основе владения ресурсом:

```javascript
abac.registerGlobalPolicy('PersonalResourceOwnerPolicy', async context => {
  const { user, action, data, currentResource } = context;
  const ObjectId = abac.db.mongoose.Types.ObjectId;

  if (action === 'create' && data.owner?.type === 'user') {
    return data.owner.target === user && data.creator.target === user;
  }

  if (action === 'read') {
    const allowedPublicStatuses = ['published', 'active', 'featured'];
    if (!user || (currentResource && !currentResource.creator.target.equals(new ObjectId(user)))) {
      if (currentResource && !allowedPublicStatuses.includes(currentResource.status)) {
        return false;
      }
    }
    return true;
  }

  if (['edit', 'delete'].includes(action) && currentResource?.owner.type === 'user') {
    return currentResource.creator.target.equals(new ObjectId(user));
  }

  return true;
});
```

- Для `create`: проверяет, что пользователь является владельцем и создателем.
- Для `read`: ограничивает доступ к ресурсам с публичными статусами для неавторизованных пользователей.
- Для `edit` и `delete`: разрешает доступ только владельцу.

---

#### Пример политики доступа к организациям

Политика `OrganizationAccessPolicy` управляет доступом к ресурсам организаций:

```javascript
abac.registerGlobalPolicy('OrganizationAccessPolicy', async context => {
  const { user, resource, data, action, currentResource, req } = context;
  const orgId = currentResource?.owner?.type === 'organization' ? String(currentResource.owner.target) : null;

  if (!orgId) return true;

  if (user) {
    const objectId = new abac.db.mongoose.Types.ObjectId(orgId);
    const isOrgOwner = await abac.db.organization.exists({ _id: objectId, owner: user });
    if (isOrgOwner) return true;

    const departments = await abac.db.department.find({
      organization: objectId,
      'members.user': user,
    });
    return departments.some(dept => dept.accesses?.[resource]?.[action]);
  }

  if (action === 'read' && req?.query) {
    const publicAccessVerifier = abac.publicAccessVerifier;
    const validationResult = publicAccessVerifier.verify(req.query, { only: ['status'] });
    req.query = validationResult.verifiedData;
    return validationResult.isValid;
  }

  return false;
});
```

- Проверяет, является ли пользователь владельцем организации или имеет доступ через департамент.
- Для `read` валидирует публичный доступ с помощью `Verifier`.

---

#### Валидатор и верификатор

Классы `Validator` и `Verifier` используются для проверки параметров запроса:

```javascript
const Verifier = require('@martyrs/src/modules/core/controllers/classes/core.verifier.js');
const publicAccessVerifier = new Verifier({
  status: {
    rule: 'optional',
    default: 'published',
    validator: Validator.schema({ context: 'Status' }).string().required().oneOf(['published', 'active', 'featured']),
  },
});
```

- **`Validator`** — определяет схему валидации.
- **`Verifier`** — проверяет данные запроса и возвращает результат `{ isValid, verifiedData }`.

Эти классы интегрированы в политики, например, для проверки статуса ресурса.

---

#### Обработка сервисных запросов

Если запрос содержит заголовок `x-service-key`, совпадающий с `options.serviceKey`, он считается сервисным, и проверка доступа пропускается:

```javascript
if (req.headers['x-service-key'] && abac.validateServiceKey(req.headers['x-service-key'])) {
  req.isServiceRequest = true;
}
```

---

#### Загрузка ресурса

Метод `checkAccess` автоматически загружает ресурс, если в `data` указан `_id`, `params._id` или `url`:

```javascript
if (data._id) {
  const resourceModel = abac.getResourceModel('posts');
  context.currentResource = await resourceModel.findById(data._id);
}
```

Загруженный ресурс доступен в контексте как `currentResource`.

---

### Validator

Validator - это класс для валидации данных с богатым набором правил проверки. Он позволяет создавать схемы валидации и проверять данные на соответствие этим схемам.

#### Основные возможности Validator

- Валидация примитивных типов (строки, числа, логические значения)
- Валидация сложных типов (массивы, объекты, даты)
- Проверка обязательных полей
- Проверка минимальных и максимальных значений
- Проверка по регулярным выражениям
- Проверка email-адресов
- Валидация по пользовательским функциям
- Валидация вложенных объектов и массивов

#### Создание валидатора

```javascript
const Validator = require('@martyrs/src/modules/core/controllers/classes/validator.js');

// Создание схемы валидации
const userSchema = Validator.schema({ context: 'Пользователь' }).object({
  name: Validator.schema().string().required(),
  age: Validator.schema().integer().min(18).max(100),
  email: Validator.schema().string().email(),
  roles: Validator.schema()
    .array()
    .items(Validator.schema().string().oneOf(['admin', 'user', 'guest'])),
});
```

#### Валидация данных

```javascript
// Валидация данных
const userData = {
  name: 'John',
  age: 25,
  email: 'john@example.com',
  roles: ['user'],
};

const result = userSchema.validate(userData);
if (result.isValid) {
  console.log('Данные валидны');
} else {
  console.error('Ошибки валидации:', result.errors);
}
```

### Verifier

Verifier - это класс для валидации query-параметров в веб-приложениях. Он позволяет определить конфигурацию для параметров и валидировать входящие данные в соответствии с этой конфигурацией.

#### Основные возможности Verifier

- Валидация параметров на основе пользовательской конфигурации
- Применение значений по умолчанию для отсутствующих или невалидных параметров
- Удаление невалидных параметров
- Детальная отчетность о результатах валидации
- Встроенный middleware для использования с Express.js
- Защита от прототипного загрязнения

#### Создание экземпляра Verifier

```javascript
const Validator = require('@martyrs/src/modules/core/controllers/classes/validator.js');

// Создаем конфигурацию параметров
const queryConfig = {
  page: {
    rule: 'optional',
    default: 1,
    validator: Validator.schema().integer().min(1),
  },
  limit: {
    rule: 'optional',
    default: 20,
    validator: Validator.schema().integer().min(1).max(100),
  },
  sort: {
    rule: 'optional',
    default: 'createdAt',
    validator: Validator.schema().string().oneOf(['createdAt', 'updatedAt', 'name']),
  },
};

// Создаем экземпляр Verifier
const queryVerifier = new Verifier(queryConfig);
```

#### Валидация параметров

```javascript
// Запрос с параметрами для проверки
const queryParams = {
  page: '2',
  limit: '15',
  sort: 'name',
  extraParam: 'value',
};

// Проверяем параметры
const result = queryVerifier.verify(queryParams);

if (result.isValid) {
  console.log('Параметры валидны:', result.verifiedData);
} else {
  console.error('Ошибки валидации:', result.verificationErrors);
}
```

#### Использование с Express

```javascript
const express = require('express');
const app = express();

// Применяем middleware для валидации query-параметров
app.get('/api/items', queryVerifier.middleware(), (req, res) => {
  // req.query содержит проверенные и обработанные параметры
  // req.queryValidation содержит полный результат валидации
  const { page, limit, sort } = req.query;

  // Логика обработки запроса...

  res.json({ page, limit, sort });
});

app.listen(3000);
```

#### Методы класса Verifier

##### updateConfig(newConfig)

Обновляет конфигурацию параметров, добавляя или изменяя существующие параметры.

```javascript
// Изначальная конфигурация
const verifier = new Verifier({
  page: { rule: 'optional', default: 1 },
});

// Добавляем новый параметр и изменяем существующий
verifier.updateConfig({
  page: { default: 5 },
  limit: { rule: 'optional', default: 20 },
});
```

##### getConfig()

Возвращает копию текущей конфигурации.

```javascript
const config = queryVerifier.getConfig();
console.log(config);
```

##### verifyParam(paramName, value)

Проверяет отдельный параметр на соответствие конфигурации.

```javascript
const isValid = queryVerifier.verifyParam('page', 5);
console.log(isValid); // true или false
```

##### verify(query, options)

Валидирует объект параметров в соответствии с конфигурацией.

```javascript
const result = queryVerifier.verify(
  { page: 2, limit: 50 },
  {
    applyDefaults: true,
    removeInvalid: true,
    only: ['page', 'limit'],
    except: null,
  }
);
```

##### middleware(options)

Создает middleware-функцию для Express.js, которая автоматически проверяет request.query.

```javascript
// Валидация только определенных параметров
app.get(
  '/api/items',
  queryVerifier.middleware({
    only: ['page', 'limit'],
    applyDefaults: true,
  }),
  (req, res) => {
    // Обработка запроса
  }
);
```

#### Примеры использования

##### Валидация с частичным применением настроек

```javascript
const params = {
  page: -1,
  limit: 'not-a-number',
  sort: 'invalid',
  extra: 'value',
};

// Проверяем только page и limit, не удаляем невалидные параметры
const result = queryVerifier.verify(params, {
  only: ['page', 'limit'],
  removeInvalid: false,
});

console.log(result.verifiedData);
// Будет содержать значение по умолчанию для page, исходное значение для limit и extra
```

##### Работа с результатами валидации

```javascript
const result = queryVerifier.verify(queryParams);

// Проверенные данные после применения всех правил
console.log(result.verifiedData);

// Параметры, к которым были применены значения по умолчанию
console.log(result.appliedDefaults);

// Параметры, которые были удалены из-за невалидности
console.log(result.removedParams);

// Параметры, которые не были описаны в конфигурации
console.log(result.untouchedParams);

// Результат валидации (true/false)
console.log(result.isValid);

// Ошибки валидации по каждому параметру
console.log(result.verificationErrors);
```

### Observer

Observer - это реализация паттерна "Наблюдатель" для создания событийной модели в приложении. Он позволяет компонентам подписываться на события и реагировать на них асинхронно.

#### Создание и использование Observer

```javascript
const Observer = require('@martyrs/src/modules/core/controllers/classes/observer.js');

// Создание экземпляра Observer
const events = new Observer();

// Подписка на событие
events.subscribe('userCreated', userData => {
  console.log('Новый пользователь создан:', userData);
});

// Подписка на событие с однократным выполнением
events.subscribe(
  'userDeleted',
  userId => {
    console.log('Пользователь удален:', userId);
  },
  true
);

// Генерация события
await events.notify('userCreated', { id: '123', name: 'John' });

// Отмена подписки
const callback = data => console.log(data);
events.subscribe('someEvent', callback);
events.remove('someEvent', callback);
```

#### Особенности Observer

- Асинхронное выполнение обработчиков событий
- Поддержка однократного выполнения (опция `once`)
- Защита от ошибок в обработчиках (ошибки логируются, но не прерывают выполнение)
- Возможность отмены подписки

### Logger

Logger - это компонент для логирования событий и ошибок в приложении. Записи логов сохраняются в MongoDB с использованием модели `Log`.

#### Использование Logger

```javascript
const Logger = require('@martyrs/src/modules/core/controllers/classes/logger.js');

// Создание экземпляра Logger
const logger = new Logger(db);

// Логирование информации
await logger.info('Приложение запущено');

// Логирование ошибки
try {
  // Некоторый код
} catch (err) {
  await logger.error(`Произошла ошибка: ${err.message}`);
}

// Middleware для логирования запросов
app.use(async (req, res, next) => {
  await logger.info(`Request: ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Логирование ошибок
app.use(async (err, req, res, next) => {
  await logger.error(`Error: ${err.message} in ${req.method} ${req.url}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Логирование бизнес-событий
app.post('/api/login', async (req, res) => {
  try {
    // Аутентификация...
    const user = await authenticateUser(req.body);

    if (user) {
      await logger.info(`User logged in: ${user.username} (${user.id})`);
      res.json({ token: generateToken(user) });
    } else {
      await logger.info(`Failed login attempt for username: ${req.body.username}`);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    await logger.error(`Login error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

#### Модель Log

```javascript
const LogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    level: String, // 'info', 'error', etc.
    message: String,
  },
  { versionKey: false }
);
```

### Cache

Cache - это компонент для кэширования данных в памяти. Он позволяет сократить количество обращений к базе данных и ускорить работу приложения.

#### Основные возможности Cache

- Кэширование с установленным временем жизни (TTL)
- Кэширование с тегами для группировки и управления связанными данными
- Удаление кэша по ключу, тегу или группе тегов
- Получение статистики использования кэша

#### Использование Cache

```javascript
const Cache = require('@martyrs/src/modules/core/controllers/classes/cache.js');

// Создание экземпляра Cache с TTL в 5 минут
const cache = new Cache({ ttlSeconds: 300 });

// Сохранение данных в кэше
await cache.set('user:123', userData);

// Сохранение данных с тегами
await cache.setWithTags('posts:recent', postsData, ['posts', 'recent']);

// Получение данных из кэша
const user = await cache.get('user:123');

// Удаление данных по ключу
await cache.del('user:123');

// Удаление данных по тегу
await cache.delByTag('posts');

// Удаление данных по нескольким тегам
await cache.delByTags(['posts', 'recent']);

// Очистка всего кэша
await cache.flush();

// Получение статистики кэша
const stats = await cache.stats();

// Кэширование результатов запросов к API для получения списка пользователей с кэшированием
app.get('/api/users', async (req, res) => {
  const cacheKey = 'users:list';

  // Попытка получить данные из кэша
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  // Если данных нет в кэше, получаем из БД
  try {
    const users = await db.users.find().lean();

    // Сохраняем в кэш с тегом 'users'
    await cache.setWithTags(cacheKey, users, ['users']);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// При изменении данных пользователя, инвалидируем кэш
app.post('/api/users', async (req, res) => {
  try {
    const newUser = await db.users.create(req.body);

    // Инвалидируем кэш, связанный с пользователями
    await cache.delByTag('users');

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

## Интеграция с другими модулями

Модуль `globals` является основой для других модулей фреймворка и предоставляет им базовые возможности.

Пример интеграции с другим модулем:

```javascript
// Модуль auth, использующий globals
const globals = require('@martyrs/src/modules/core');
const { Validator, Logger, Cache } = globals;

function initializeAuth(app, db) {
  // Используем Logger из globals
  const logger = new Logger(db);

  // Используем Cache из globals
  const cache = new Cache({ ttlSeconds: 3600 }); // 1 час

  // Используем Validator из globals
  const loginSchema = Validator.schema().object({
    username: Validator.schema().string().required(),
    password: Validator.schema().string().required(),
  });

  // Маршруты и бизнес-логика...

  return {
    logger,
    cache,
    // Другие экспортируемые объекты...
  };
}

module.exports = {
  initialize: initializeAuth,
};
```
