import path from 'path';
import express from 'express';
import { readFileSync } from 'fs';
import { renderHtml } from '../ssr/ssr-render-html.js';
import { createAssetResolver } from '../ssr/asset-resolver.js';
import { createBeastiesProcessor } from '../ssr/beasties-processor.js';

export default function createSsrProdServer(projectRoot, configs, createServer) {
  // Load stats for asset resolution
  const statsJson = JSON.parse(readFileSync(path.join(projectRoot, 'builds/web/client/stats.json'), 'utf-8'));
  const serverManifest = JSON.parse(readFileSync(path.join(projectRoot, 'builds/web/server/manifest.json'), 'utf-8'));
  const resolver = createAssetResolver(statsJson);
  const beastiesProcessor = createBeastiesProcessor(projectRoot);

  const startServer = async () => {
    const { app, server, env } = await createServer.createServer();
    
    // Статика отдается через Nginx, Express не обрабатывает статические файлы
    // Это решает проблему с производительностью

    const { render } = await import(path.join(
      path.resolve(projectRoot, 'builds/web/server'),
      serverManifest['main.js']
    ));

    app.use('/*', async (req, res) => {
      // Логируем если это запрос к JS чанку
      if (req.originalUrl.includes('.js')) {
        console.log('[SSR] JS request caught in SSR handler:', req.originalUrl);
      }
      const ssrContext = {};
      
      const { html, meta, state, statusCode, usedModules, loadedModules } = await render({
        url: req.originalUrl,
        cookies: req.cookies,
        languages: req.acceptsLanguages(),
        ssrContext
      });

      if (state.NotFound) {
        res.status(404);
      }

      const initialState = JSON.stringify(state);

      // Используем loadedModules если они есть, иначе usedModules
      const modulesToLoad = loadedModules || usedModules || [];

      // Use asset resolver to get only needed chunks with critical CSS mode
      const { head, body } = resolver.collect(modulesToLoad, { criticalCss: true });

      let completeHtml = await renderHtml({
        appHtml: html,
        meta,
        head,
        body,
        initialState,
      });
      
      // Обрабатываем HTML через Beasties для извлечения критического CSS
      // Beasties сам определит какие стили используются в HTML
      completeHtml = await beastiesProcessor.processHtml(completeHtml, {
        url: req.originalUrl
      });

      res.status(statusCode).header('Content-Type', 'text/html; charset=utf-8').send(completeHtml);
    });

    return server;
  };

  const port = process.env.PORT || 8080;

  const start = async () => {
    const server = await startServer();
    try {
      server.listen(port, () => {});
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  return start;
}