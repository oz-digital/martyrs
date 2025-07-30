# Модуль чатов

## Обзор архитектуры

Модуль реализует real-time чат с использованием WebSocket и MongoDB для хранения истории сообщений.

### Структура файлов

```
chats/
├── chats.client.js          # Точка входа клиентской части
├── chats.server.js          # Точка входа серверной части
├── components/
│   ├── pages/
│   │   └── ChatPage.vue     # Главная страница чата
│   ├── sections/
│   │   └── ChatWindow.vue   # Окно чата с сообщениями
│   └── blocks/
│       └── ChatMessage.vue  # Компонент отдельного сообщения
├── controllers/
│   └── chats.controller.js  # Бизнес-логика (сохранение/получение сообщений)
├── models/
│   └── chat.model.js        # MongoDB модель сообщения
├── routes/
│   └── chats.routes.js      # HTTP маршруты и WebSocket обработчики
└── store/
    └── chat.store.js        # Управление состоянием на клиенте
```

## Ключевые компоненты

### WebSocket интеграция

Модуль использует глобальный WebSocket класс из `@martyrs/src/modules/globals/views/classes/globals.websocket.js`:

- Подключение: `globalWebSocket.connect(userId)`
- Подписка на модуль: `globalWebSocket.subscribeModule('chat')`
- Отправка сообщений: `globalWebSocket.send({ type: 'message', module: 'chat', ... })`

### Store (chat.store.js)

Управляет состоянием чата на клиенте:
- `state.messages` - массив сообщений текущего чата
- `state.currentChatId` - ID активного чата
- `state.username` - имя текущего пользователя

Основные методы:
- `connectWebSocket(userId)` - подключение к WebSocket
- `setCurrentChat(chatId)` - переключение чата и загрузка истории
- `addMessage(message)` - отправка нового сообщения

### Серверные обработчики

WebSocket обработчики регистрируются через `wss.registerModule('chat', handler)`:

1. `joinChat` - присоединение к чату (добавление chatId в ws.activeChats)
2. `message` - обработка входящего сообщения:
   - Сохранение в БД
   - Рассылка всем участникам чата через `broadcastToModuleWithFilter`

REST API:
- `GET /messages/:chatId` - получение истории сообщений

## Модель данных

```javascript
ChatMessageSchema = {
  username: String,     // Имя отправителя
  chatId: String,      // ID чата
  text: String,        // Текст сообщения
  createdAt: Date      // Время создания (автоматически)
}
```

## Проблемы и TODO

### Критические проблемы

1. **Нет авторизации** в WebSocket обработчиках
   - Любой может отправлять сообщения от имени любого пользователя
   - Нет проверки прав доступа к чату

3. **Отсутствует валидация данных**
   - Нет проверки обязательных полей
   - Нет санитизации входящих данных

### Улучшения

1. **Обработка ошибок**
   - Добавить try/catch в компоненты
   - Показывать уведомления об ошибках пользователю

2. **Оптимизация**
   - Пагинация для истории сообщений
   - Виртуальный скроллинг для больших чатов

3. **Функциональность**
   - Индикатор набора текста
   - Статусы доставки сообщений
   - Поддержка файлов/изображений
   - Уведомления о новых сообщениях

## Использование

### Инициализация на клиенте

```javascript
import ModuleChats from '@martyrs/src/modules/chats/chats.client.js';

// В главном приложении
ModuleChats.initialize(app, store, router);
```

### Использование в компоненте

```vue
<ChatPage 
  :username="currentUser.name"
  :user="currentUser.id"
  :chatID="selectedChatId"
/>
```

### Инициализация на сервере

```javascript
import { initialize } from '@martyrs/src/modules/chats/chats.server.js';

// При старте сервера
initialize(app, db, wss, origins, publicPath);
```

## Зависимости

- `globals.websocket.js` - глобальный WebSocket класс
- `auth/controllers/middlewares` - middleware для авторизации (не используется)
- `globals/controllers/utils/mailing.js` - отправка уведомлений (импортирован, но не используется)