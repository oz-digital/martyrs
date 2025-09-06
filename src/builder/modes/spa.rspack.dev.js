import history from 'connect-history-api-fallback';
import path from 'path';
import chalk from 'chalk';
import { rspack, ProgressPlugin } from '@rspack/core';
import devMiddleware from 'webpack-dev-middleware';

export default function createSpaDevServer(projectRoot, configs, createServer) {
  const { spa, api } = configs;
  const spaCompiler = rspack(spa);
  const serverCompiler = rspack(api);

  const createDevRenderer = () => {
    const progressPlugin = new ProgressPlugin((percentage, message, ...args) => {});

    spa.plugins = spa.plugins || [];
    spa.plugins.push(progressPlugin);
  };

  let serverInstance;
  let serverModule;

  const clientDevMiddleware = devMiddleware(spaCompiler, {
    publicPath: spa.output.publicPath,
    stats: false,
  });

  const port = process.env.PORT || 8080;

  // Function to start the server
  const startServer = async () => {
    if (serverInstance) {
      serverInstance.close();
    }

    // Проверяем, что серверный модуль загружен
    if (!serverModule) {
      return;
    }

    let { app, server, env } = await serverModule.createServer();

    // Используем connect-history-api-fallback перед другими middleware
    app.use(history());
    
    app.use(clientDevMiddleware);

    // Обрабатываем все маршруты
    app.get('*', (req, res, next) => {
      const filename = path.join(spaCompiler.outputPath, 'index.html');
      spaCompiler.outputFileSystem.readFile(filename, (err, result) => {
        if (err) {
          return next(err);
        }
        res.set('content-type', 'text/html');
        res.send(result);
        res.end();
      });
    });

    serverInstance = server;

    try {
      await server.listen(port);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  // Настройка наблюдения за изменениями
  serverCompiler.watch({}, async (err, stats) => {
    if (err) {
      console.error(err);
      return;
    }
    
    
    try {
      // Получаем путь к скомпилированному файлу - вызываем toJson() только один раз!
      const statsJson = stats.toJson();
      const { outputPath } = statsJson;
      const entryName = Object.keys(statsJson.entrypoints)[0];
      const assetName = statsJson.entrypoints[entryName].assets[0].name;
      
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

  createDevRenderer();

  return startServer;
}