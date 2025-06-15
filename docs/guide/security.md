# Security and Authentication

Martyrs реализует систему аутентификации на основе JSON Web Tokens (JWT) и управление доступом на основе атрибутов (Attribute-Based Access Control, ABAC). Ниже описаны механизмы работы аутентификации, проверки ролей и ABAC, а также приведены примеры их использования.

---

## 1. Аутентификация

Аутентификация в Martyrs осуществляется с использованием JWT-токенов. Пользователь получает токен после успешного входа в систему, и этот токен используется для проверки подлинности запросов.

### Middleware `verifyToken`

Middleware `verifyToken` проверяет наличие и валидность JWT-токена в запросе. Токен передается одним из двух способов:

- В заголовке `x-access-token`.
- В куки `user.accessToken` (внутри объекта `user`, который парсится из JSON).

#### Логика работы:

1. **Проверка сервисного ключа**: Если в запросе есть заголовок `x-service-key`, совпадающий с `process.env.SERVICE_KEY`, аутентификация пользователя не требуется. Запрос помечается как сервисный (`req.isServiceRequest = true`), и управление передается дальше.
2. **Извлечение токена**: Если токен отсутствует в заголовке, проверяются куки.
3. **Валидация токена**:
   - Если токен отсутствует и `continueOnFail = false`, возвращается ошибка 401 ("Unauthorized: No token provided").
   - Если токен есть, он проверяется с помощью `jwt.verify` и секретного ключа `process.env.SECRET_KEY`.
   - При успешной проверке в `req` добавляются `req.userId` (ID пользователя) и `req.user` (объект с `_id`).
   - Если токен недействителен и `continueOnFail = false`, возвращается ошибка 401 ("Unauthorized: Invalid token").
4. **Режим `continueOnFail`**: Если `continueOnFail = true`, запрос обрабатывается даже при отсутствии или ошибке токена, но `req.userId` устанавливается в `null`.

#### Пример использования:

```javascript
const middlewareFactory = require('./middleware/auth');
const auth = middlewareFactory(db);

app.get('/protected', auth.verifyToken(), (req, res) => {
  res.send(`Hello, user ${req.userId || 'guest'}`);
});
```

#### Пример с `continueOnFail`:

```javascript
app.get('/public', auth.verifyToken(true), (req, res) => {
  if (req.userId) {
    res.send('Welcome, authenticated user');
  } else {
    res.send('Welcome, guest');
  }
});
```

---

## 2. Проверка ролей

Martyrs предоставляет middleware для проверки ролей пользователя через функцию `checkRole`, которая используется для создания таких middleware, как `isAdmin` и `isModerator`.

### Middleware `checkRole`

- **Аргумент**: `roleToCheck` — строка с названием роли (например, "admin", "moderator").
- **Логика работы**:
  1. Находит пользователя в базе данных по `req.userId`.
  2. Извлекает роли пользователя из коллекции `Role`, связанные с `user.roles`.
  3. Проверяет наличие указанной роли.
  4. Если роль есть, управление передается дальше. Если нет — возвращается ошибка 403 ("Require [role] Role!").

#### Готовые middleware:

- `isAdmin` — проверяет роль "admin".
- `isModerator` — проверяет роль "moderator".

#### Пример использования:

```javascript
const { verifyToken, isAdmin } = middlewareFactory(db);

app.get('/admin', verifyToken(), isAdmin, (req, res) => {
  res.send('Admin panel');
});
```

---

## 3. ABAC (Attribute-Based Access Control)

ABAC в Martyrs реализован через класс `GlobalABAC`, который позволяет задавать гибкие политики доступа на основе атрибутов пользователя, ресурса, действия и контекста запроса.

### Класс `GlobalABAC`

`GlobalABAC` — это синглтон, управляющий политиками доступа. Он инициализируется с базой данных и настройками.

#### Конструктор:

- **`db`**: объект базы данных с моделями (например, `user`, `role`, `posts`).
- **`options`** (необязательный объект):
  - `strictMode` (по умолчанию `false`): если `true`, ошибки в политиках приводят к отказу в доступе.
  - `defaultDeny` (по умолчанию `false`): если `true`, доступ по умолчанию запрещен, если нет явного разрешения.
  - `serviceKey` (по умолчанию `process.env.SERVICE_KEY`): ключ для сервисных запросов.

#### Методы:

1. **`registerGlobalPolicy(name, policyFn)`**: Регистрирует глобальную политику для всех запросов.
2. **`registerResourcePolicy(resourceName, policyFn)`**: Регистрирует политику для конкретного ресурса.
3. **`registerExtension(moduleName, extensionFn)`**: Регистрирует расширение от внешнего модуля.
4. **`checkAccess(context)`**: Проверяет доступ на основе контекста.
5. **`middleware(resource, action, options)`**: Создает middleware для Express.

#### Контекст проверки доступа:

Объект `context` включает:

- `user`: ID пользователя (из `req.userId`).
- `resource`: тип ресурса (например, "posts").
- `action`: действие (например, "read", "write").
- `data`: данные запроса (`req.body`, `req.query`, `req.params`).
- `options`: дополнительные настройки (например, `allowUnauthenticated`).
- `req`, `res`: объекты запроса и ответа Express.
- `isServiceRequest`: флаг сервисного запроса.
- `currentResource`: загруженный ресурс (добавляется при предзагрузке).
- `resourceModel`: модель ресурса (добавляется при предзагрузке).

---

### Логика проверки доступа (`checkAccess`)

1. **Сервисные запросы**: Если `isServiceRequest = true`, доступ разрешен (`SERVICE_REQUEST_ALLOWED`).
2. **Аутентификация**: Если пользователь не аутентифицирован и `allowUnauthenticated` не указано, доступ запрещен (`UNAUTHENTICATED_ACCESS_DENIED`).
3. **Предзагрузка ресурса**: Если есть `_id`, `params._id` или `url`, ресурс загружается из базы:
   - Модель определяется через `getResourceModel` (например, "posts" → `db.blogposts`).
   - Если ресурс не найден, доступ запрещен (`RESOURCE_NOT_FOUND`).
4. **Глобальные политики**: Выполняются все политики из `policies.global`. Если любая возвращает `false`, доступ запрещен (`DENIED_BY_GLOBAL_POLICY_[NAME]`).
5. **Политики ресурсов**: Выполняется политика ресурса из `policies.resources`. Если возвращает `true`, доступ разрешен (`RESOURCE_POLICY_ALLOWED`).
6. **Расширения**: Выполняются расширения из `policies.extensions`. Если любое возвращает `{ rule: 'optional' }`, доступ разрешен (`ALLOWED_BY_[MODULE]_EXTENSION`).
7. **Финальное решение**: Если нет явного разрешения, доступ зависит от `defaultDeny`:
   - `true` → запрещено (`ACCESS_DENIED`).
   - `false` → разрешено (`ACCESS_ALLOWED`).

---

### Middleware для Express

Метод `middleware` создает middleware для проверки доступа.

#### Параметры:

- `resource`: тип ресурса.
- `action`: действие.
- `options`: дополнительные настройки.

#### Пример:

```javascript
const abac = require('./abac').getInstance(db);

app.get('/posts/:id', abac.middleware('posts', 'read'), (req, res) => {
  res.send('Post details');
});
```

---

## 4. Регистрация политик

### Глобальные политики

Применяются ко всем запросам:

```javascript
abac.registerGlobalPolicy('bannedUsers', async context => {
  const user = await context.db.user.findById(context.user);
  return !user?.isBanned;
});
```

### Политики ресурсов

Определяют доступ к конкретным ресурсам:

```javascript
abac.registerResourcePolicy('posts', async context => {
  if (context.action === 'read') return true;
  if (context.action === 'write' && context.user) {
    return context.currentResource.author === context.user;
  }
  return false;
});
```

### Расширения

Добавляют проверки от внешних модулей:

```javascript
abac.registerExtension('premiumModule', async context => {
  if (context.resource === 'premiumContent' && context.user) {
    const user = await context.db.user.findById(context.user);
    return { allowed: user.isPremium };
  }
  return { allowed: false };
});
```

---

## 5. Обработка сервисных запросов

Сервисные запросы идентифицируются по заголовку `x-service-key`. Если он совпадает с `process.env.SERVICE_KEY`, аутентификация не требуется.

---

## 6. Настройки

- **`strictMode`**: Если `true`, ошибки в политиках приводят к отказу.
- **`defaultDeny`**: Если `true`, доступ запрещен по умолчанию.
- **`serviceKey`**: Ключ для сервисных запросов.

---
