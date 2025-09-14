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
  const clientCompiler = rspack(client); 
  const ssrCompiler = rspack(ssr);
  const serverCompiler = rspack(api);
  const beastiesProcessor = createBeastiesProcessor(projectRoot);

  const createDevRenderer = (onUpdate) => {
    const createHotReloadingServerRenderer = () => {
      const progressPlugin = new ProgressPlugin((percentage, message, ...args) => {});

      ssr.plugins = ssr.plugins || [];
      ssr.plugins.push(progressPlugin);
      
      let renderApp = null;

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
      const ssrContext = {};
      
      const { html, meta, state, statusCode, usedModules, loadedModules } = await renderApp({
        ...stuff,
        ssrContext
      });

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

      let completeHtml = await renderHtml({
        appHtml: html,
        meta,
        head,
        body,
        initialState,
      });
      
      // Обрабатываем HTML через Beasties для извлечения критического CSS
      completeHtml = await beastiesProcessor.processHtml(completeHtml, {
        url: stuff.url
      });
      
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
      // Получаем путь к скомпилированному файлу
      const { outputPath } = stats.toJson();
      const entryName = Object.keys(stats.toJson().entrypoints)[0];
      const assetName = stats.toJson().entrypoints[entryName].assets[0].name;
      
      // Импортируем с уникальным параметром для сброса кэша
      serverModule = await import(`file://${path.resolve(outputPath, assetName)}?t=${Date.now()}`);
      
      if (typeof serverModule.createServer !== 'function') {
        throw new Error("Экспорт createServer не найден");
      }
      
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
      await server.listen(port);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  return startServer;
}