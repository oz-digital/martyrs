import path from "path";
import chalk from "chalk";

import { rspack, ProgressPlugin } from "@rspack/core";
import { fork } from "child_process";

import devMiddleware from "webpack-dev-middleware";

import { createHtmlRenderer } from "../ssr/ssr-render-html.js";
import { createAssetResolver } from "../ssr/asset-resolver.js";
import { createBeastiesProcessor } from '../ssr/beasties-processor.js';

export default function createSsrDevServer(projectRoot, configs, createServer) {
  const { client, api, ssr } = configs;

  // [LOADING 1] Starting compilers initialization
  performance.mark('loading-1-start');
  console.log('[LOADING 1] Initializing Rspack compilers...');

  const clientCompiler = rspack(client);
  const ssrCompiler = rspack(ssr);
  const serverCompiler = rspack(api);
  const beastiesProcessor = createBeastiesProcessor(projectRoot);

  performance.mark('loading-1-end');
  performance.measure('loading-1', 'loading-1-start', 'loading-1-end');
  const measure1 = performance.getEntriesByName('loading-1')[0];
  console.log(`[LOADING 1] Compilers initialized in ${measure1?.duration?.toFixed(2)}ms`);

  const createDevRenderer = (onUpdate) => {
    const createHotReloadingServerRenderer = () => {
      const progressPlugin = new ProgressPlugin((percentage, message, ...args) => {});

      ssr.plugins = ssr.plugins || [];
      ssr.plugins.push(progressPlugin);
      
      let renderApp = null;

      // [LOADING 2] Starting SSR compilation watch
      performance.mark('loading-2-start');
      console.log('[LOADING 2] Starting SSR compilation watch...');

      ssrCompiler.watch(
        {
          "info-verbosity": "none",
        },
        async (error, stats) => {
          if (error) {
            console.error(chalk.red("Server critical error"));
            console.error(JSON.stringify(error, null, 2));
            throw error;
          }

          const jsonStats = stats.toJson();

          if (stats.hasErrors()) {
            console.error(chalk.red("❌ Ошибка компиляции"));
            
            jsonStats.errors.forEach((err, index) => {
              console.error(chalk.red(`\n=== ОШИБКА ${index + 1} ===`));
              
              // Основное сообщение ошибки
              if (err.message) {
                let message = err.message.replace(/\u001b\[[0-9;]*m/g, '');
                console.error(chalk.red(message));
              }
              
              // ФАЙЛ ГДЕ ОШИБКА
              if (err.moduleName) {
                console.error(chalk.yellow(`📄 ФАЙЛ: ${err.moduleName}`));
              }
              
              console.error(''); // пустая строка для разделения
            });
            
            return;
          }

          
          const { entrypoints, outputPath } = jsonStats;
          const { main: { assets: [mainChunkPath] } } = entrypoints;
          const mainModulePath = path.resolve(outputPath, mainChunkPath.name);
          
          // Dynamic import for ESM compatibility with cache busting
          // IMPORTANT: Add timestamp to force reimport after recompilation
          const module = await import(`${mainModulePath}?t=${Date.now()}`);
          renderApp = module._renderApp;

          // [LOADING 3] SSR module successfully compiled
          performance.mark('loading-3-end');
          performance.measure('loading-3', 'loading-2-start', 'loading-3-end');
          const measure3 = performance.getEntriesByName('loading-3')[0];
          console.log(`[LOADING 3] SSR module compiled in ${measure3?.duration?.toFixed(2)}ms`);
        }
      );
      
      return async (stuff) => {
        if (!renderApp) {
          throw new Error('SSR module not compiled yet');
        }
        const result = await renderApp(stuff);
        return result;
      };
    };

    const renderApp = createHotReloadingServerRenderer();
    const renderHtml = createHtmlRenderer(onUpdate);

    return async (stuff, { stats, outputFileSystem }) => {
      // [LOADING 4] Starting renderApp
      performance.mark('loading-4-start');
      console.log('[LOADING 4] Starting renderApp process...');

      const ssrContext = {};

      const { html, meta, state, statusCode, usedModules, loadedModules } = await renderApp({
        ...stuff,
        ssrContext
      });

      performance.mark('loading-4-end');
      performance.measure('loading-4', 'loading-4-start', 'loading-4-end');
      const measure4 = performance.getEntriesByName('loading-4')[0];
      console.log(`[LOADING 4] renderApp completed in ${measure4?.duration?.toFixed(2)}ms`);

      // Используем loadedModules если они есть, иначе usedModules
      const modulesToLoad = loadedModules || usedModules || [];

      let head = '';
      let body = '';
      
      if (cachedStatsJson) {
        // Используем кэшированный stats - это в 1000 раз быстрее!
        const resolver = createAssetResolver(cachedStatsJson);
        const tags = resolver.collect(modulesToLoad);
        head = tags.head;
        body = tags.body;
      } else if (stats && stats.toJson) {
        // Fallback если кэш еще не готов (только первый запрос)
        const statsJson = stats.toJson();
        
        const resolver = createAssetResolver(statsJson);
        const tags = resolver.collect(modulesToLoad);
        head = tags.head;
        body = tags.body;
      } else {
        // This shouldn't happen
        console.error('[DEBUG ssr.rspack.dev] No stats available!');
      }

      const initialState = JSON.stringify(state);
      const loadedModulesJson = JSON.stringify(loadedModules || []);

      // [LOADING 5] Starting HTML rendering and Beasties processing
      performance.mark('loading-5-start');
      console.log('[LOADING 5] Starting HTML rendering and Beasties processing...');

      let completeHtml = await renderHtml({
        appHtml: html,
        meta,
        head,
        body,
        initialState,
        loadedModulesJson,
      });

      // Обрабатываем HTML через Beasties для извлечения критического CSS
      completeHtml = await beastiesProcessor.processHtml(completeHtml, {
        url: stuff.url
      });

      performance.mark('loading-5-end');
      performance.measure('loading-5', 'loading-5-start', 'loading-5-end');
      const measure5 = performance.getEntriesByName('loading-5')[0];
      console.log(`[LOADING 5] HTML rendering and Beasties completed in ${measure5?.duration?.toFixed(2)}ms`);

      return { html: completeHtml, statusCode };
    };
  };

  let serverInstance;
  let rendererInstance;

  let serverModule;

  serverCompiler.watch({}, async (err, stats) => {
    if (err) {
      console.error(err);
      return;
    }
    
    
    try {
      // [LOADING 6] Loading server module
      performance.mark('loading-6-start');
      console.log('[LOADING 6] Loading server module...');

      // Получаем путь к скомпилированному файлу
      const { outputPath } = stats.toJson();
      const entryName = Object.keys(stats.toJson().entrypoints)[0];
      const assetName = stats.toJson().entrypoints[entryName].assets[0].name;

      // Импортируем с уникальным параметром для сброса кэша
      serverModule = await import(`file://${path.resolve(outputPath, assetName)}?t=${Date.now()}`);

      if (typeof serverModule.createServer !== 'function') {
        throw new Error("Экспорт createServer не найден");
      }

      performance.mark('loading-6-end');
      performance.measure('loading-6', 'loading-6-start', 'loading-6-end');
      const measure6 = performance.getEntriesByName('loading-6')[0];
      console.log(`[LOADING 6] Server module loaded in ${measure6?.duration?.toFixed(2)}ms`);

      await startServer();
    } catch (error) {
      console.error("Ошибка при загрузке серверного модуля:", error);
    }
  });

  // Кэшируем stats после компиляции чтобы не вызывать toJson() на каждый запрос  
  let cachedStatsJson = null;
  
  clientCompiler.hooks.done.tap('cache-stats', (stats) => {
    cachedStatsJson = stats.toJson({
      assets: true,
      chunks: true,
      modules: true,
      entrypoints: true,
      chunkModules: true
    });
  });

  const clientDevMiddleware = devMiddleware(clientCompiler, {
    publicPath: client.output.publicPath,
    serverSideRender: true,
    stats: {
      children: true,
      assets: true,
      chunks: true,
      modules: true,
      entrypoints: true,
      chunkModules: true
    },
  });

  const port = process.env.PORT || 8080;

  // Function to start the server
  const startServer = async () => {
    if (serverInstance) {
      serverInstance.close();
    }

     // Проверяем, что серверный модуль загружен
    if (!serverModule) {
      console.error("Серверный модуль еще не скомпилирован");
      return;
    }


    let { app, server, env } = await serverModule.createServer();

    app.use(clientDevMiddleware);

    // SSR client-side compilation
    if (!rendererInstance) {
      rendererInstance = createDevRenderer(() => {
        clientCompiler.hooks.done.tap("reload", () => {
          setTimeout(() => {
            // const client = await import("webpack-hot-middleware/client");
            // client?.reload();
          }, 500);
        });
      });
    }

    // Serve SSR content for all routes
    app.use("/*", async (req, res) => {
      const result = await rendererInstance(
        {
          url: req.originalUrl,
          cookies: req.cookies,
          languages: req.acceptsLanguages(),
        },
        res.locals.webpack.devMiddleware // Update to rspack middleware context
      );

      res.status(result.statusCode)
        .header("Content-Type", "text/html; charset=utf-8")
        .send(result.html);
    });

    serverInstance = server;

    try {
      // [LOADING 7] Starting server
      performance.mark('loading-7-start');
      console.log('[LOADING 7] Starting server on port ' + port + '...');

      await server.listen(port);

      performance.mark('loading-7-end');
      performance.measure('loading-7', 'loading-7-start', 'loading-7-end');
      const measure7 = performance.getEntriesByName('loading-7')[0];
      console.log(`[LOADING 7] Server started successfully in ${measure7?.duration?.toFixed(2)}ms`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  return startServer;
}