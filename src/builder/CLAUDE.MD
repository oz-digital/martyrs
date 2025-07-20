# Builder Module - Техническая документация

## Архитектура

Builder - это модульная система сборки, поддерживающая 3 бандлера (Webpack, Rspack, Vite) и 2 режима рендеринга (SPA, SSR). Система построена для тестирования и публикации npm библиотеки с различными бандлерами.

## Файловая структура

```
builder/
├── builder.js                    # Главный экспорт всех модулей
├── modes/                        # Режимы работы серверов
│   ├── spa.dev.js                # SPA development server (Webpack)
│   ├── spa.rspack.dev.js         # SPA development server (Rspack)
│   ├── spa.prod.js               # SPA production server
│   ├── ssr.dev.js                # SSR development (default Webpack)
│   ├── ssr.prod.js               # SSR production server
│   ├── ssr.rspack.dev.js         # SSR development с Rspack
│   └── ssr.vite.dev.js           # SSR development с Vite
├── webpack/                      # Конфигурации Webpack
│   ├── index.js                  # Экспорт всех webpack конфигов
│   ├── webpack.config.base.js    # Базовая конфигурация
│   ├── webpack.config.api.js     # API server конфигурация
│   ├── webpack.config.spa.client.js      # SPA клиент
│   ├── webpack.config.ssr.client.js      # SSR клиент
│   └── webpack.config.ssr.server.js      # SSR сервер
├── rspack/                       # Конфигурации Rspack
│   ├── index.js                  # Экспорт всех rspack конфигов
│   ├── rspack.config.base.js     # Базовая конфигурация
│   ├── rspack.config.api.js      # API server конфигурация
│   ├── rspack.config.spa.client.js       # SPA клиент
│   ├── rspack.config.ssr.client.js       # SSR клиент
│   └── rspack.config.ssr.server.js       # SSR сервер
├── vite/                         # Конфигурации Vite
│   ├── index.js                  # Экспорт всех vite конфигов
│   ├── vite.config.base.js       # Базовая конфигурация
│   ├── vite.config.api.js        # API server конфигурация
│   ├── vite.config.spa.client.js         # SPA клиент
│   ├── vite.config.ssr.client.js         # SSR клиент
│   └── vite.config.ssr.server.js         # SSR сервер
├── ssr/                          # SSR утилиты
│   ├── ssr-render-html.js        # HTML рендеринг с отслеживанием обновлений
│   ├── ssr-render-html.vite.js   # HTML рендеринг для Vite (без polling)
│   ├── ssr-transform-webpack-stats.js    # Обработка webpack статистик
│   └── utils.js                  # Утилиты для работы с модулями
├── templates/                    # HTML шаблоны
│   ├── page.js                   # Полный HTML шаблон с аналитикой
│   └── screen.js                 # Упрощенный HTML шаблон
└── utils/
    └── hot-reload.js             # Утилиты для горячей перезагрузки
```

## Режимы работы (modes/)

### Паттерн функций

Все файлы режимов экспортируют функции со структурой:

```javascript
export default function createServer(projectRoot, configs) {
  // настройка компиляторов и middleware
  // динамический импорт серверного модуля через ESM
  
  const startServer = async () => {
    // запуск сервера на порту process.env.PORT || 8080
    console.log(`Server started at localhost:${port}`);
  };
  
  return startServer;
}
```

### spa.dev.js

**Параметры:**
- `projectRoot` - корневая папка проекта
- `{ spaConfig, apiConfig }` - конфигурации webpack

**Функциональность:**
- Создает 2 webpack компилятора (SPA client + API server)
- Динамический импорт серверного модуля через ESM с cache busting
- Использует `webpack-dev-middleware` для горячей перекомпиляции
- Настраивает `connect-history-api-fallback` для SPA роутинга
- Обслуживает index.html из памяти компилятора
- Автоматический перезапуск при изменениях серверного кода

### spa.rspack.dev.js

**Параметры:**
- `projectRoot` - корневая папка проекта
- `{ spaConfig, apiConfig }` - конфигурации rspack

**Функциональность:**
- Аналогичен spa.dev.js но использует Rspack вместо Webpack
- Более быстрая компиляция благодаря Rust-основе Rspack
- Встроенный SWC для трансформации JavaScript

### spa.prod.js

**Параметры:**
- `projectRoot` - корневая папка

**Функциональность:**
- Обслуживает готовые файлы из `builds/web/spa/`
- Читает index.html с диска
- Настраивает кэширование на 1 день

### ssr.dev.js 

**Параметры:**
- `projectRoot` - корневая папка
- `{ clientConfig, apiConfig, ssrConfig }`

**Функциональность:**
- Использует @rspack/core по умолчанию
- Настраивает 3 компилятора (client, ssr, server)
- Динамический импорт SSR модулей через ESM
- Интеграция с `createHtmlRenderer` для финального HTML

### ssr.rspack.dev.js

**Особенности:**
- Тройная компиляция с Rspack
- `fork` для изоляции процессов
- Watch mode с автоперезапуском сервера
- Импорт с временными метками для сброса кэша

### ssr.vite.dev.js

**Особенности:**
- `createViteServer` в middleware режиме
- `vite.ssrLoadModule()` для динамической загрузки
- Встроенный HMR Vite
- File watching с debounce 500ms

### ssr.prod.js

**Функциональность:**
- Читает готовые `stats.json` и `manifest.json`
- Импортирует готовый SSR модуль
- Обслуживает статические файлы с кэшированием

## Конфигурации бандлеров

### Общие алиасы

Все бандлеры используют одинаковые алиасы:
```javascript
alias: {
  '@': path.resolve(projectRoot, 'src'),
  '@martyrs': path.resolve(projectRoot, 'martyrs'),
  vue: path.resolve(projectRoot, 'node_modules/vue'),
  'vue-router': path.resolve(projectRoot, 'node_modules/vue-router'),
  'vue-i18n': path.resolve(projectRoot, 'node_modules/vue-i18n'),
}
```

### Webpack конфигурации

#### webpack.config.base.js

**Параметры:** `(projectRoot)`

**Ключевые лоадеры:**
- `babel-loader` - JS/ESM с поддержкой `modules: false`
- `vue-loader` - Vue SFC файлы
- `css-loader` + `sass-loader` - CSS/SCSS обработка
- `url-loader` - статические ресурсы с `emitFile: false`

**Плагины:**
- `VueLoaderPlugin`, `CleanWebpackPlugin`, `MiniCssExtractPlugin`
- `dotenv` для переменных окружения
- Условный `BundleAnalyzerPlugin`

#### webpack.config.api.js

**Особенности:**
- `target: 'node'` для серверной среды
- `libraryTarget: 'module'` + `outputModule: true` для ESM
- `webpack-node-externals` с `importType: 'module'`
- Entry: `src/server.js`

#### webpack.config.spa.client.js

**Наследует:** ssr.client.js
**Дополнительно:**
- `HtmlWebpackPlugin` с Mustache шаблоном
- `LimitChunkCountPlugin` (1 chunk)
- `TerserPlugin` + `CssMinimizerPlugin` оптимизация

#### webpack.config.ssr.client.js

**Наследует:** base.js
**Особенности:**
- Hot reload entry в development
- `PurgeCSSPlugin` с safelist для Vue scoped styles
- Code splitting для vendor chunks
- `StatsWriterPlugin` для статистики

#### webpack.config.ssr.server.js

**Особенности:**
- `target: 'node'` + ESM модули
- `null-loader` для CSS файлов
- `LimitChunkCountPlugin` (1 chunk)
- `WebpackManifestPlugin` в production

### Rspack конфигурации

#### Ключевые отличия от Webpack:

**builtin:swc-loader вместо babel:**
```javascript
{
  test: /\.m?js$/,
  use: {
    loader: 'builtin:swc-loader',
    options: {
      jsc: {
        parser: { syntax: 'ecmascript' },
        target: 'es2020'
      }
    }
  }
}
```

**Встроенные минификаторы:**
```javascript
optimization: {
  minimizer: [
    new rspack.SwcJsMinimizerRspackPlugin(),
    new rspack.LightningCssMinimizerRspackPlugin()
  ]
}
```

**Кастомная обработка Vue шаблонов:**
- Поддержка сокращенного v-slot синтаксиса
- Regex трансформации для `#slotname`

### Vite конфигурации

#### Ключевые отличия:

**Автоматическая обработка:**
- Нет необходимости в лоадерах для большинства файлов
- Автоматическая экстракция CSS в production
- `emptyOutDir: true` заменяет CleanWebpackPlugin

**Кастомные плагины:**
```javascript
// PurgeCSS плагин
{
  name: 'vite-plugin-purge-css',
  apply: 'build',
  enforce: 'post',
  async generateBundle(options, bundle) {
    // Логика очистки CSS
  }
}
```

**Умное разделение кода:**
```javascript
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('vue')) return 'vue-vendor';
    if (id.includes('@martyrs')) return 'martyrs-vendor';
  }
  if (id.includes('src/modules/')) {
    const match = id.match(/src\/modules\/([^\/]+)/);
    return `module-${match[1]}`;
  }
}
```

## SSR утилиты

### ssr-render-html.js

**Экспорт:**
- `renderHtml(stuff)` - рендеринг HTML с Mustache
- `createHtmlRenderer(onTemplateUpdate)` - фабрика с отслеживанием обновлений

**Функциональность:**
- Объединяет входные данные с переменными окружения
- `setInterval(1000ms)` для отслеживания изменений шаблонов
- Автоматическое внедрение ключей аналитики

### ssr-render-html.vite.js

**Отличия:** Убран `setInterval` - Vite сам обрабатывает HMR

### ssr-transform-webpack-stats.js

**Функции:**
- `extractAssets(stats, publicPath)` - извлечение JS/CSS из статистик
- `transformDevStats(stats, outputFileSystem)` - dev режим с inline CSS
- `transformProdStats({stats, publicPath})` - prod режим с файлами

**Dev vs Prod:**
- **Dev:** CSS встраивается в `<style>` теги через `outputFileSystem`
- **Prod:** CSS подключается через `<link>` теги

### utils.js

**Утилиты:**
- `normalizeAssets(assets)` - приведение к массиву
- `hash(str)` - MD5 хеш
- `requireFromString(src, filename)` - выполнение модуля из строки

## HTML шаблоны

### page.js

**Полный HTML шаблон с:**
- Facebook Pixel и Domain Verification
- Google Analytics
- PWA манифест и иконки
- Мета-теги через `{{{ meta.* }}}`
- Встроенное состояние: `data-user-state` и `data-state`

### screen.js

**Упрощенный шаблон:**
- Без Facebook интеграции
- Google Analytics в body
- Жестко установлен `lang="en"`

## Переменные окружения

### Выбор бандлера
```bash
BUNDLER=RSPACK|VITE|WEBPACK  # Default: WEBPACK
```

### Режим приложения
```bash
MODE=SSR|SPA                 # Default: SSR
NODE_ENV=development|production
```

### Аналитика
```bash
GOOGLE_TAG_ID=GA_MEASUREMENT_ID
FACEBOOK_PIXEL_ID=FB_PIXEL_ID
FACEBOOK_DOMAIN_VERIFICATION=VERIFICATION_CODE
GOOGLE_MAPS_API_KEY=MAPS_KEY
```

### Специальные режимы
```bash
MOBILE_APP=true              # Для Capacitor сборок
BUNDLE_ANALYZER=true         # Анализ размера бандла
```

## Выбор конфигурации в index.js

```javascript
const configs =
  process.env.BUNDLER === 'RSPACK'
    ? {
        api: rspackConfigs.apiConfig(projectRoot),
        spa: rspackConfigs.spaConfig(projectRoot),
        client: rspackConfigs.clientConfig(projectRoot),
        ssr: rspackConfigs.ssrConfig(projectRoot),
      }
    : process.env.BUNDLER === 'VITE'
    ? {
        api: viteConfigs.apiConfig(projectRoot),
        spa: viteConfigs.spaClientConfig(projectRoot),
        client: viteConfigs.ssrClientConfig(projectRoot),
        ssr: viteConfigs.ssrServerConfig(projectRoot),
      }
    : {
        api: webpackConfigs.apiConfig(projectRoot),
        spa: webpackConfigs.spaClientConfig(projectRoot),
        client: webpackConfigs.ssrClientConfig(projectRoot),
        ssr: webpackConfigs.ssrServerConfig(projectRoot),
      };

// Выбор функций создания серверов
const serverCreators = {
  ssr: {
    dev: bundler === 'RSPACK' ? createSsrRspackDevServer : 
         bundler === 'VITE' ? createSsrViteDevServer : createSsrDevServer,
    prod: createSsrProdServer,
  },
  spa: {
    dev: bundler === 'RSPACK' ? createSpaRspackDevServer : createSpaDevServer,
    prod: createSpaProdServer,
  },
};
```

## Архитектурные принципы

1. **Модульность** - каждый бандлер изолирован в своей папке
2. **Единый интерфейс** - все конфигурации принимают `projectRoot`  
3. **ESM First** - нативная поддержка ES модулей
4. **Hot Reload** - различные стратегии для каждого бандлера
5. **Тестируемость** - поддержка 3 бандлеров для npm публикации
6. **Производительность** - Rspack как основной для SSR dev
7. **Совместимость** - сохранение функциональности между бандлерами