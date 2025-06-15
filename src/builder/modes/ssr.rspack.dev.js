import path from "path";
import chalk from "chalk";

import { rspack, ProgressPlugin } from "@rspack/core";
import { fork } from "child_process";

import devMiddleware from "webpack-dev-middleware";

import { createHtmlRenderer } from "../ssr/ssr-render-html.js";
import { transformDevStats } from "../ssr/ssr-transform-webpack-stats.js";

export default function createSsrDevServer(projectRoot, { clientConfig, apiConfig, ssrConfig }) {
  const clientCompiler = rspack(clientConfig); 
  const ssrCompiler = rspack(ssrConfig);
  const serverCompiler = rspack(apiConfig);

  const createDevRenderer = (onUpdate) => {
    const createHotReloadingServerRenderer = (config) => {
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
            console.error(chalk.red("Client compilation error"));
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
          const { entrypoints, outputPath } = jsonStats;
          const { main: { assets: [mainChunkPath] } } = entrypoints;
          const mainModulePath = path.resolve(outputPath, mainChunkPath.name);
          
          // Dynamic import for ESM compatibility
          const module = await import(mainModulePath);
          renderApp = module.render;
          setCompilationDone();
        }
      );
      
      return async (stuff) => {
        await ssrCompilation;
        const result = await renderApp(stuff);
        return result;
      };
    };

    const renderApp = createHotReloadingServerRenderer(ssrConfig);
    const renderHtml = createHtmlRenderer(onUpdate);

    return async (stuff, { stats, outputFileSystem }) => {
      const { html, meta, state, statusCode } = await renderApp(stuff);

      const { head, body } = transformDevStats(stats.toJson(), outputFileSystem);

      const initialState = JSON.stringify(state);

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

  let serverModule;

  serverCompiler.watch({}, async (err, stats) => {
    if (err) {
      console.error(err);
      return;
    }
    
    console.log(stats.toString(apiConfig.stats));
    
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
      
      console.log("Сервер скомпилирован, перезапуск...");
      await startServer();
    } catch (error) {
      console.error("Ошибка при загрузке серверного модуля:", error);
    }
  });

  const clientDevMiddleware = devMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    serverSideRender: true,
    stats: {
      children: true
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
      console.log(`Server started at localhost:${port}\n`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  return startServer;
}