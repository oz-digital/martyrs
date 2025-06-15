import * as history from 'connect-history-api-fallback';
import path from 'path';
import webpack from 'webpack';
import devMiddleware from 'webpack-dev-middleware';
export default (function createSpaDevServer(projectRoot, { spaConfig, apiConfig, createServer }) {
  const spaCompiler = webpack(spaConfig);
  const serverCompiler = webpack(apiConfig);
  const createDevRenderer = () => {
    // Нативные ANSI escape коды для цветов
    const colors = {
      reset: '\x1b[0m',
      greenBright: '\x1b[92;1m', // яркий зеленый + жирный
      blueBright: '\x1b[94m', // яркий синий
      yellow: '\x1b[33m', // желтый
    };
    const progressPlugin = new webpack.ProgressPlugin((percentage, message, ...args) => {
      // readline.clearLine(process.stdout, 0);
      // readline.cursorTo(process.stdout, 0);
      process.stdout.write(
        colors.greenBright + `${(percentage * 100).toFixed(2)}% ` + colors.reset + colors.blueBright + message + colors.reset + ' ' + args.map(arg => colors.yellow + arg + colors.reset).join(' ')
      );
    });
    spaConfig.plugins.push(progressPlugin);
  };
  let serverInstance;
  const clientDevMiddleware = devMiddleware(spaCompiler, {
    publicPath: spaConfig.output.publicPath,
    stats: false,
  });
  // const clientHotMiddleware = hotMiddleware(spaCompiler, {
  //   heartbeat: 5000,
  //   log: false
  // });
  const port = process.env.PORT || 8080;
  // Функция для запуска сервера
  const startServer = async () => {
    if (serverInstance) {
      serverInstance.close();
    }
    // Очистка кэша модуля и всех его зависимостей
    Object.keys(require.cache).forEach(id => {
      delete require.cache[id];
    });
    const { createServer } = createServer;
    let { app, server, env } = await createServer();
    // Используем connect-history-api-fallback перед другими middleware
    app.use(history());
    app.use(clientDevMiddleware);
    // app.use(clientHotMiddleware);
    // app.use(compression());
    // Удаляем статическое обслуживание файлов
    // app.use(express.static(path.resolve(projectRoot, "builds/web/client")));
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
      console.log(`Server started at http://localhost:${port}\n`);
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
    console.log(stats.toString(apiConfig.stats));
    console.log('Server.js has changed, updating...');
    await startServer();
  });
  createDevRenderer();
  return startServer;
});
