import compression from 'compression';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createHtmlRenderer } from '../ssr/ssr-render-html.js';
// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  greenBright: '\x1b[92;1m',
  blue: '\x1b[34m',
  blueBright: '\x1b[94m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};
export default (function createSsrDevServer(projectRoot, { clientConfig, apiConfig, ssrConfig, createServer }) {
  let serverInstance;
  let viteDevServer;
  let rendererInstance;
  const port = process.env.PORT || 8080;
  // Создаем рендерер для SSR
  const createDevRenderer = onUpdate => {
    const renderHtml = createHtmlRenderer(onUpdate);
    return async (stuff, vite) => {
      // Динамически импортируем входную точку SSR
      let ssrEntry;
      try {
        // Используем Vite для трансформации и загрузки SSR-скрипта
        ssrEntry = await vite.ssrLoadModule(ssrConfig.entry);
      } catch (error) {
        console.error(colors.red + 'SSR compilation error' + colors.reset);
        console.error(error);
        return {
          html: `<pre>${error.stack}</pre>`,
          statusCode: 500,
        };
      }
      // Рендерим приложение с помощью SSR
      try {
        const { html, meta, state, statusCode } = await ssrEntry.render(stuff);
        // Получаем скрипты и стили клиентской части для вставки в HTML
        const headTags = [];
        const bodyTags = [];
        // Добавляем основной скрипт клиентской части
        bodyTags.push(`<script type="module" src="/@vite/client"></script>`);
        bodyTags.push(`<script type="module" src="${clientConfig.entry}"></script>`);
        const initialState = JSON.stringify(state);
        // Рендерим финальный HTML
        const completeHtml = await renderHtml({
          appHtml: html,
          meta,
          head: headTags.join('\n'),
          body: bodyTags.join('\n'),
          initialState,
        });
        return { html: completeHtml, statusCode };
      } catch (error) {
        console.error(colors.red + 'Render error' + colors.reset);
        console.error(error.stack);
        return {
          html: `<pre>${error.stack}</pre>`,
          statusCode: 500,
        };
      }
    };
  };
  // Функция для запуска сервера
  const startServer = async () => {
    if (serverInstance) {
      serverInstance.close();
    }
    // Очистка кэша модулей
    Object.keys(require.cache).forEach(id => {
      delete require.cache[id];
    });
    try {
      // Создаем Vite Dev Server
      if (!viteDevServer) {
        viteDevServer = await createViteServer({
          root: projectRoot,
          server: {
            middlewareMode: true,
            hmr: true,
            watch: {
              usePolling: true,
              interval: 100,
            },
          },
          appType: 'custom',
          logLevel: 'info',
          // Используем настройки из клиентского конфига
          ...clientConfig,
        });
      }
      // Создаем рендерер, если его ещё нет
      if (!rendererInstance) {
        rendererInstance = createDevRenderer(() => {
          console.log(colors.green + 'Client updated, triggering reload...' + colors.reset);
        });
      }
      let { app, server, env } = await createServer();
      // Применяем Vite middleware
      app.use(viteDevServer.middlewares);
      // Middleware для SSR
      app.use('/*', async (req, res) => {
        try {
          const result = await rendererInstance(
            {
              url: req.originalUrl,
              cookies: req.cookies,
              languages: req.acceptsLanguages(),
            },
            viteDevServer
          );
          res.status(result.statusCode).header('Content-Type', 'text/html; charset=utf-8').send(result.html);
        } catch (error) {
          console.error(colors.red + 'SSR middleware error' + colors.reset);
          console.error(error);
          viteDevServer.ssrFixStacktrace(error);
          res.status(500).send(`<pre>${error.stack}</pre>`);
        }
      });
      app.use(compression());
      serverInstance = server;
      await server.listen(port);
      console.log(`${colors.greenBright}Server started at localhost:${port}${colors.reset}\n`);
      // Настройка наблюдения за изменениями серверных файлов
      const watcher = fs.watch(path.dirname(createServer), { recursive: true });
      watcher.on('change', async (eventType, filename) => {
        if (filename && filename.endsWith('.js')) {
          console.log(`${colors.blue}Server file changed: ${filename}, updating...${colors.reset}`);
          try {
            await startServer();
          } catch (err) {
            console.error(colors.red + 'Server restart failed' + colors.reset);
            console.error(err);
          }
        }
      });
    } catch (err) {
      console.error(colors.red + 'Server start failed' + colors.reset);
      console.error(err);
      process.exit(1);
    }
  };
  return startServer;
});
