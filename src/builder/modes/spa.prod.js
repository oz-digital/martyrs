import history from 'connect-history-api-fallback';
import express from 'express';
import fs from 'fs';
import path from 'path';
export default function createSpaProdServer(projectRoot, configs, createServer) {
  let serverInstance;
  const port = process.env.PORT || 8080;
  
  // Кэшируем index.html в памяти при старте сервера
  let cachedIndexHtml = null;
  
  // Функция для запуска сервера
  const startServer = async () => {
    let { app, server } = await createServer.createServer();
    
    // Читаем index.html один раз при старте
    try {
      cachedIndexHtml = fs.readFileSync(path.resolve(projectRoot, 'builds/web/spa', 'index.html'), 'utf-8');
      console.log('Index.html cached in memory');
    } catch (err) {
      console.error('Cannot read index.html:', err);
      process.exit(1);
    }
    
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
      // Используем закэшированный HTML
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      });
      res.end(cachedIndexHtml);
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
}
