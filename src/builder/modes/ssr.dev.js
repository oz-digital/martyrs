import path from "path";
import chalk from "chalk";
import { rspack, ProgressPlugin } from "@rspack/core";
import { createHtmlRenderer } from "../ssr/ssr-render-html.js";
import { transformDevStats } from "../ssr/ssr-transform-webpack-stats.js";

export default function createSsrDevServer(projectRoot, { clientConfig, apiConfig, ssrConfig, createServer }) {
  // Добавляем HMR плагины в клиентскую конфигурацию
  const addHmrToClientConfig = (config) => {
    config.plugins = config.plugins || [];
    // Встроенный HMR плагин от Rspack
    config.plugins.push(new rspack.HotModuleReplacementPlugin());
    // Добавляем HMR entry
    config.entry = {
      main: [
        "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000",
        ...(Array.isArray(config.entry.main) ? config.entry.main : [config.entry.main])
      ]
    };
    return config;
  };

  // Применяем HMR к клиентской конфигурации
  const clientConfigWithHmr = addHmrToClientConfig({ ...clientConfig });
  const clientCompiler = rspack(clientConfigWithHmr);
  const ssrCompiler = rspack(ssrConfig);

  const createDevRenderer = () => {
    const createHotReloadingServerRenderer = (config) => {
      // Добавляем прогресс-плагин для отображения процесса сборки
      const progressPlugin = new ProgressPlugin((percentage, message, ...args) => {
        console.log(
          chalk.greenBright(`${(percentage * 100).toFixed(2)}% `) +
          chalk.blueBright(message) +
          " " +
          args.map((arg) => chalk.yellow(arg)).join(" ")
        );
      });

      config.plugins = config.plugins || [];
      config.plugins.push(progressPlugin);
      
      let renderApp = null;
      let setCompilationDone = null;
      let ssrCompilation = new Promise((resolve) => { setCompilationDone = resolve });

      // Запускаем наблюдение за SSR сборкой
      ssrCompiler.watch({ "info-verbosity": "none" }, async (error, stats) => {
        if (error) {
          console.error(chalk.red("Server critical error"));
          console.error(JSON.stringify(error, null, 2));
          throw error;
        }

        const jsonStats = stats.toJson();

        if (stats.hasErrors()) {
          console.error(chalk.red("Server compilation error"));
          jsonStats.errors.forEach((err) => {
            if (err.details) {
              console.error(err.details);
            } else if (typeof err === 'object') {
              try {
                console.error(JSON.stringify(err, null, 2));
              } catch (e) {
                console.error(e);
              }
            } else {
              console.error(chalk.red(err.slice()));
            }
          });
          return;
        }
        
        // Получаем путь к собранному SSR бандлу
        const { entrypoints, outputPath } = jsonStats;
        const { main: { assets: [mainChunkPath] } } = entrypoints;
        const mainModulePath = path.resolve(outputPath, mainChunkPath.name);
        
        // Динамический импорт для ESM совместимости
        const module = await import(mainModulePath);
        renderApp = module.render;
        setCompilationDone();
      });
      
      return async (stuff) => {
        await ssrCompilation;
        return await renderApp(stuff);
      };
    };

    const renderApp = createHotReloadingServerRenderer(ssrConfig);
    const renderHtml = createHtmlRenderer();

    return async (stuff, stats) => {
      const { html, meta, state, statusCode } = await renderApp(stuff);
      
      // Трансформируем статистику для вставки в HTML
     const publicPath = clientConfigWithHmr.output.publicPath;
    const { head, body } = extractAssets(stats, publicPath);

      const initialState = JSON.stringify(state);
      
      // Рендерим финальный HTML
      const completeHtml = await renderHtml({
        appHtml: html,
        meta,
        head,
        body,
        initialState,
      });
      
      return { html: completeHtml, statusCode };
    };
  };

  let serverInstance;
  let rendererInstance;
  const port = process.env.PORT || 8080;

  // Функция запуска сервера
  const startServer = async () => {
    if (serverInstance) {
      serverInstance.close();
    }

    // Создаем экземпляр сервера с помощью предоставленной функции
    const { app, server } = await createServer.createServer();
    
    // Инициализируем Dev middleware с использованием встроенного в Rspack middleware
    const devMiddleware = clientCompiler.devMiddleware(app, {
      publicPath: clientConfigWithHmr.output.publicPath,
      stats: false,
    });

    // Инициализируем Hot middleware с использованием встроенного в Rspack middleware
    clientCompiler.hotMiddleware(app);
    
    // Создаем рендерер для SSR, если его еще нет
    if (!rendererInstance) {
      rendererInstance = createDevRenderer();
      
      // Обновляем страницу при изменениях в клиентском коде
      clientCompiler.hooks.done.tap("reload", (stats) => {
        // Инвалидация кеша клиентского кода происходит автоматически с HMR
      });
    }

    // Обрабатываем все запросы через SSR
    app.use("/*", async (req, res) => {
      try {
        const stats = clientCompiler.getStats().toJson();
        
        const result = await rendererInstance(
          {
            url: req.originalUrl,
            cookies: req.cookies,
            languages: req.acceptsLanguages(),
          },
          stats
        );

        res.status(result.statusCode)
          .header("Content-Type", "text/html; charset=utf-8")
          .send(result.html);
      } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      }
    });

    serverInstance = server;

    try {
      await server.listen(port);
      console.log(`Server started at localhost:${port}\n`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  return startServer;
}