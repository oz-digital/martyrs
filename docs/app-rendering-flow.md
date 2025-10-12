# Поток рендеринга приложения

## ДЕТАЛЬНЫЙ ПОТОК С КОНКРЕТНЫМИ ЗНАЧЕНИЯМИ

### 1. СТАРТ: `node index.js`
```javascript
// index.js вызывает:
createSsrProdServer(
  '/Users/magicofoz/Development/OZDAO/ozdao.dev/app',  // projectRoot
  {
    api: rspackConfig,    // конфиг API
    spa: rspackConfig,    // конфиг SPA  
    client: rspackConfig, // конфиг SSR клиента
    ssr: rspackConfig     // конфиг SSR сервера
  },
  createServer  // функция из src/server.js
)
```

### 2. SSR.PROD.JS получает запрос от браузера
```javascript
// Браузер запрашивает: GET /products?category=weed

app.use('/*', async (req, res) => {
  // req.originalUrl = '/products?category=weed'
  // req.cookies = { user: '{"_id":"123","email":"test@test.com"}' }
  
  const { _renderApp } = await import('builds/web/server/main.js');
  // _renderApp - это функция из client.js
  
  // ВЫЗЫВАЕМ _renderApp И ПЕРЕДАЕМ ЭТИ ПАРАМЕТРЫ:
  const result = await _renderApp({
    url: '/products?category=weed',        // ← ЭТО params.url
    cookies: { user: '{"_id":"123"...}' }, // ← ЭТО params.cookies  
    languages: ['en', 'ru'],               // ← ЭТО params.languages
    ssrContext: {}                         // ← ЭТО params.ssrContext
  });
})
```

### 3. CLIENT.JS получает эти параметры
```javascript
// client.js
export async function _renderApp(params) {
  // params = {
  //   url: '/products?category=weed',
  //   cookies: { user: '{"_id":"123"...}' },
  //   languages: ['en', 'ru'],
  //   ssrContext: {}
  // }
  
  const { renderApp } = await appPromise;
  // renderApp - функция из core.app.js
  
  // ПЕРЕДАЕМ ТЕ ЖЕ params В renderApp:
  return renderApp(params);
}
```

### 4. core.APP.JS - renderApp получает params
```javascript
async function renderApp({ url, cookies, languages, ssrContext }) {
  // ДЕСТРУКТУРИЗАЦИЯ params:
  // url = '/products?category=weed'
  // cookies = { user: '{"_id":"123"...}' }
  // languages = ['en', 'ru']
  // ssrContext = {}
  
  // Создаем Vue приложение
  const { app, router, store, i18n, meta } = await createApp();
  
  // ВЫЗЫВАЕМ appRenderer.render (ЭТО vue-app-renderer.js)
  const result = await appRenderer.render({
    url,        // '/products?category=weed'
    cookies,    // { user: '{"_id":"123"...}' }
    createApp: () => ({ app, router, store, i18n, meta }), // функция-фабрика
    ssrContext  // {}
  });
  
  return result;
}
```

### 5. VUE-APP-RENDERER.JS - ФИНАЛЬНЫЙ РЕНДЕРИНГ
```javascript
export async function render({ url, cookies, ssrContext, createApp }) {
  // url = '/products?category=weed'
  // cookies = { user: '{"_id":"123"...}' }
  // createApp = функция которая возвращает { app, router, store, i18n, meta }
  
  // Вызываем createApp чтобы получить объекты
  const { app, router, store, meta } = createApp();
  
  // ИСПОЛЬЗУЕМ url для навигации
  await router.push(url); // переходим на /products?category=weed
  
  // ИСПОЛЬЗУЕМ cookies для авторизации
  if (cookies.user) {
    const user = JSON.parse(cookies.user); // парсим { "_id": "123", "email": "test@test.com" }
    await store.auth.actions.initialize(user); // инициализируем юзера в store
  }
  
  // Рендерим в HTML
  const html = await renderToString(app, ssrContext);
  
  // ВОЗВРАЩАЕМ результат
  return {
    html: '<div id="app">...</div>',
    meta: { headTags: '...', bodyTags: '...' },
    state: { auth: { user: {...} }, products: [...] },
    statusCode: 200
  };
}
```

### 6. РЕЗУЛЬТАТ ИДЕТ ОБРАТНО
```javascript
// vue-app-renderer.js возвращает → core.app.js
// core.app.js возвращает → client.js  
// client.js возвращает → ssr.prod.js
// ssr.prod.js получает:
{
  html: '<div id="app">...</div>',
  meta: { headTags: '...', bodyTags: '...' },
  state: { auth: { user: {...} }, products: [...] },
  statusCode: 200
}

// И отправляет клиенту полный HTML
res.send(`
  <!DOCTYPE html>
  <html>
    <head>${meta.headTags}</head>
    <body>
      ${html}
      <script>window.__INITIAL_STATE__ = ${JSON.stringify(state)}</script>
    </body>
  </html>
`);
```

## ГИДРАТАЦИЯ НА КЛИЕНТЕ

После загрузки страницы браузер выполняет тот же `client.js`, но уже в браузере:

```javascript
// core.app.js - блок FOR SSR / CLIENT ENTRY
if (typeof window !== 'undefined' && !process.env.MOBILE_APP) {
  createApp().then(({ app, router, store }) => {
    router.isReady().then(() => {
      // Монтируем приложение к существующему HTML
      app.mount('#app'); // ГИДРАТАЦИЯ
      
      // Загружаем состояние из HTML
      const stateElement = document.querySelector('[data-state]');
      const initialState = JSON.parse(stateElement.innerHTML);
      store.setInitialState(initialState, true); // true = гидратация
    });
  });
}
```

## ОТВЕТЫ НА КЛЮЧЕВЫЕ ВОПРОСЫ:

### ЧТО ЗА params?
Это объект с 4 полями: `{ url, cookies, languages, ssrContext }`

### ОТКУДА params?
Создается в `ssr.prod.js` из данных HTTP запроса (`req.originalUrl`, `req.cookies` и т.д.)

### КУДА ПЕРЕДАЕТСЯ params?
Передается по цепочке:
- `ssr.prod.js` → `client.js _renderApp()` → `core.app.js renderApp()` → `vue-app-renderer.js render()`

### vue-app-renderer ИСПОЛЬЗУЕТСЯ?
ДА! Он импортируется в `core.app.js` строка 16:
```javascript
const appRenderer = await getAppRenderer();
// getAppRenderer() = import('../utils/vue-app-renderer.js')
```
И вызывается в строке 233:
```javascript
const result = await appRenderer.render({ url, cookies, createApp, ssrContext });
```

### КАК ПЕРЕДАЕТСЯ ВСЕ В vue-app-renderer?
Через объект с 4 полями:
- `url` - строка URL
- `cookies` - объект с куками
- `createApp` - функция которая создает Vue приложение
- `ssrContext` - контекст для SSR

## ПОЛНАЯ СХЕМА ЗАПУСКА И ПЕРЕДАЧИ АРГУМЕНТОВ

### 1. ЗАПУСК: `node index.js`

**Файл:** `/app/index.js`

```javascript
// Определяем корневую папку проекта
const projectRoot = path.dirname(__filename); // /app

// Создаем конфиги Rspack (передаем projectRoot во все конфиги)
const configs = {
  api: rspackConfigs.apiConfig(projectRoot),     // конфиг для API сервера
  spa: rspackConfigs.spaConfig(projectRoot),     // конфиг для SPA клиента
  client: rspackConfigs.clientConfig(projectRoot), // конфиг для SSR клиента
  ssr: rspackConfigs.ssrConfig(projectRoot)      // конфиг для SSR сервера
};

// Импортируем createServer из src/server.js
import createServer from './src/server.js';

// Выбираем функцию в зависимости от MODE и NODE_ENV
const serverFunc = MODE === 'SSR' 
  ? (isDev ? createSsrRspackDevServer : createSsrProdServer)
  : (isDev ? createSpaRspackDevServer : createSpaProdServer);

// Вызываем выбранную функцию, передаем 3 аргумента:
const start = serverFunc(projectRoot, configs, createServer);
start(); // запускаем сервер
```

### 2. SSR PRODUCTION: `createSsrProdServer`

**Файл:** `/app/martyrs/src/builder/modes/ssr.prod.js`

```javascript
export default function createSsrProdServer(projectRoot, configs, createServer) {
  // projectRoot = '/app'
  // configs = { api, spa, client, ssr }
  // createServer = функция из src/server.js
  
  return async function start() {
    // 1. Вызываем createServer из src/server.js
    const { app, server, env } = await createServer.createServer();
    // app = Express приложение с API эндпоинтами
    // server = HTTP/HTTPS сервер
    // env = переменные окружения
    
    // 2. Импортируем _renderApp из собранного client.js
    const { _renderApp } = await import('builds/web/server/main.js');
    // _renderApp = экспортированная функция из client.js
    
    // 3. Обрабатываем все запросы
    app.use('/*', async (req, res) => {
      // Вызываем _renderApp с параметрами запроса
      const { html, meta, state, statusCode } = await _renderApp({
        url: req.originalUrl,     // '/some/page'
        cookies: req.cookies,      // { user: '...' }
        languages: req.acceptsLanguages(), // ['en', 'ru']
        ssrContext: {}            // контекст для Vue SSR
      });
      
      // Генерируем финальный HTML
      const completeHtml = await renderHtml({
        appHtml: html,            // отрендеренный Vue компонент
        meta,                     // мета-теги от @unhead/vue
        head,                     // скрипты для <head>
        body,                     // скрипты для <body>
        initialState: JSON.stringify(state) // состояние store
      });
      
      res.send(completeHtml);
    });
    
    server.listen(8080);
  };
}
```

### 3. CLIENT.JS: точка входа приложения

**Файл:** `/app/src/client.js`

```javascript
// 1. Вызываем createUniversalApp с функциями-геттерами
const appPromise = createUniversalApp({
  getConfig,   // async функция возвращающая конфиг
  getRouter,   // функция создающая роутер
  getLocales,  // функция создающая i18n
  getStore,    // функция возвращающая store
  hooks: {
    afterInitialize: ({ store }) => {}
  }
});

// 2. Экспортируем функцию _renderApp для SSR
export async function _renderApp(params) {
  // params = { url, cookies, languages, ssrContext }
  const { renderApp } = await appPromise;
  return renderApp(params); // вызываем renderApp из core.app.js
}
```

### 4. core.APP.JS: фабрика приложения

**Файл:** `/app/martyrs/src/modules/core/views/classes/core.app.js`

```javascript
export function createUniversalApp({ getConfig, getRouter, getLocales, getStore, hooks }) {
  
  async function initializeApp() {
    // 1. Вызываем getConfig для получения конфигурации
    const config = await getConfig(); // { env, app, modules }
    
    // 2. Функция создания Vue приложения
    function createApp() {
      const store = getStore();        // получаем Vuex store
      const app = CreateVueAppSSR(layoutApp, config); // создаем Vue app
      const i18n = getLocales();       // создаем i18n
      const router = getRouter({ app, store, router: null, config });
      
      return { app, router, store, i18n, meta };
    }
    
    // 3. Функция для SSR рендеринга
    async function renderApp({ url, cookies, languages, ssrContext }) {
      // Создаем приложение
      const { app, router, store, i18n, meta } = await createApp();
      
      // Передаем в vue-app-renderer.render
      const result = await appRenderer.render({
        url,       // URL для рендеринга
        cookies,   // куки с сервера
        createApp: () => ({ app, router, store, i18n, meta }),
        ssrContext // контекст SSR
      });
      
      return result; // { html, meta, state, statusCode }
    }
    
    return { createApp, renderApp };
  }
  
  return initializeApp(); // возвращаем промис
}
```

### 5. VUE-APP-RENDERER.JS: SSR рендеринг

**Файл:** `/app/martyrs/src/modules/core/views/utils/vue-app-renderer.js`

```javascript
export async function render({ url, cookies, ssrContext, createApp }) {
  // 1. Создаем приложение
  const { app, router, store, meta } = createApp();
  
  // 2. Навигируем на нужный URL
  await router.push(url);        // переходим на страницу
  await router.isReady();        // ждем готовности роутера
  
  // 3. Инициализируем пользователя если есть кука
  if (cookies.user) {
    const user = JSON.parse(cookies.user);
    await store.auth.actions.initialize(user);
  }
  
  // 4. Рендерим Vue приложение в HTML строку
  const html = await renderToString(app, ssrContext);
  
  // 5. Рендерим мета-теги
  const payload = await renderSSRHead(meta, {});
  
  // 6. Получаем состояние store
  const initialState = await store.getInitialState();
  
  return {
    html,                    // отрендеренный HTML
    meta: payload,           // мета-теги
    state: initialState,     // состояние store
    statusCode: 200 или 404  // HTTP статус
  };
}
```

## ИТОГО: Поток данных

1. **index.js** передает в `createSsrProdServer`:
   - `projectRoot` = путь к проекту
   - `configs` = конфиги webpack/rspack
   - `createServer` = функция создания Express сервера

2. **ssr.prod.js** вызывает:
   - `createServer.createServer()` → получает Express app
   - `import('builds/web/server/main.js')` → получает `_renderApp` функцию

3. **client.js** экспортирует `_renderApp`, которая вызывает:
   - `renderApp(params)` из `createUniversalApp`

4. **core.app.js** в `renderApp`:
   - Вызывает `getConfig()` → получает конфиг
   - Вызывает `getStore()` → получает store
   - Вызывает `getRouter()` → создает роутер
   - Вызывает `getLocales()` → создает i18n
   - Передает все в `vue-app-renderer.render()`

5. **vue-app-renderer.js**:
   - Создает Vue приложение
   - Рендерит в HTML строку
   - Возвращает HTML + состояние

6. **Результат** возвращается обратно по цепочке в `ssr.prod.js`, который отправляет HTML клиенту.

## Ключевые различия SSR vs SPA:

### SSR:
- Использует `CreateVueAppSSR` (createSSRApp из Vue)
- Двухэтапный процесс: рендеринг на сервере → гидратация на клиенте
- Состояние передается через `data-state` в HTML
- SEO-friendly, быстрый First Contentful Paint

### SPA:
- Использует `CreateVueApp` (обычный createApp из Vue)
- Одноэтапный процесс: создание и монтирование на клиенте
- Пустой HTML с `<div id="app"></div>`
- Быстрая навигация после загрузки

## Модульная загрузка:
- **Критические модули** (globals, auth, organizations, backoffice) загружаются сразу
- **Остальные модули** загружаются по требованию через router guard
- **Предзагрузка** важных модулей в фоне через `requestIdleCallback`