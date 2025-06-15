import * as history from 'connect-history-api-fallback';
import * as express from 'express';
import fs from 'fs';
import path from 'path';
export default (function createSpaProdServer(projectRoot, { createServer }) {
  let serverInstance;
  const port = process.env.PORT || 8080;
  // Функция для запуска сервера
  const startServer = async () => {
    const { createServer } = createServer;
    let { app, server } = await createServer();
    // Включаем сжатие ответов
    // app.use(compression());
    // Статическое обслуживание сбилженных файлов
    app.use(express.static(path.resolve(projectRoot, 'builds/web/spa')));
    app.use(
      history({
        index: '/index.html',
      })
    );
    app.get('*', (req, res) => {
      fs.readFile(path.resolve(projectRoot, 'builds/web/spa', 'index.html'), 'utf-8', (err, content) => {
        if (err) {
          console.log('We cannot open "index.html" file.');
          res.writeHead(500, {
            'Content-Type': 'text/plain; charset=utf-8',
          });
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
        });
        res.end(content);
      });
    });
    // Запуск сервера
    serverInstance = server;
    try {
      await server.listen(port);
      console.log(`Production server started at http://localhost:${port}\n`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };
  return startServer;
});
