import path from 'path';
import express from 'express';
import { readFileSync } from 'fs';
import { renderHtml } from '../ssr/ssr-render-html.js';
import { createAssetResolver } from '../ssr/asset-resolver.js';
import { createBeastiesProcessor } from '../ssr/beasties-processor.js';

export default function createSsrProdServer(projectRoot, configs, createServer) {
  // [LOADING 8] Loading stats and manifest files
  performance.mark('loading-8-start');
  console.log('[LOADING 8] Loading stats.json and manifest.json...');

  // Load stats for asset resolution
  const statsJson = JSON.parse(readFileSync(path.join(projectRoot, 'builds/web/client/stats.json'), 'utf-8'));
  const serverManifest = JSON.parse(readFileSync(path.join(projectRoot, 'builds/web/server/manifest.json'), 'utf-8'));
  const resolver = createAssetResolver(statsJson);
  const beastiesProcessor = createBeastiesProcessor(projectRoot);

  performance.mark('loading-8-end');
  performance.measure('loading-8', 'loading-8-start', 'loading-8-end');
  const measure8 = performance.getEntriesByName('loading-8')[0];
  console.log(`[LOADING 8] Stats and manifest loaded in ${measure8?.duration?.toFixed(2)}ms`);

  const startServer = async () => {
    const { app, server, env } = await createServer.createServer();
    
    // Статика отдается через Nginx, Express не обрабатывает статические файлы
    // Это решает проблему с производительностью

    // [LOADING 9] Importing SSR module from build
    performance.mark('loading-9-start');
    console.log('[LOADING 9] Importing SSR module from build...');

    const { _renderApp } = await import(path.join(
      path.resolve(projectRoot, 'builds/web/server'),
      serverManifest['main.js']
    ));

    performance.mark('loading-9-end');
    performance.measure('loading-9', 'loading-9-start', 'loading-9-end');
    const measure9 = performance.getEntriesByName('loading-9')[0];
    console.log(`[LOADING 9] SSR module imported in ${measure9?.duration?.toFixed(2)}ms`);

    app.use('/*', async (req, res) => {
      // Логируем если это запрос к JS чанку
      if (req.originalUrl.includes('.js')) {
        console.log('[SSR] JS request caught in SSR handler:', req.originalUrl);
      }
      // [LOADING 10] Starting renderApp processing
      performance.mark('loading-10-start');
      console.log('[LOADING 10] Starting renderApp processing...');

      const ssrContext = {};

      const { html, meta, state, statusCode, usedModules, loadedModules } = await _renderApp({
        url: req.originalUrl,
        cookies: req.cookies,
        languages: req.acceptsLanguages(),
        ssrContext
      });

      performance.mark('loading-10-end');
      performance.measure('loading-10', 'loading-10-start', 'loading-10-end');
      const measure10 = performance.getEntriesByName('loading-10')[0];
      console.log(`[LOADING 10] renderApp processing completed in ${measure10?.duration?.toFixed(2)}ms`);

      if (state.NotFound) {
        res.status(404);
      }

      const initialState = JSON.stringify(state);
      const loadedModulesJson = JSON.stringify(loadedModules || []);

      // Используем loadedModules если они есть, иначе usedModules
      const modulesToLoad = loadedModules || usedModules || [];

      // [LOADING 11] Collecting assets through resolver
      performance.mark('loading-11-start');
      console.log('[LOADING 11] Collecting assets through resolver...');

      // Use asset resolver to get only needed chunks with critical CSS mode
      const { head, body } = resolver.collect(modulesToLoad, { criticalCss: true });

      performance.mark('loading-11-end');
      performance.measure('loading-11', 'loading-11-start', 'loading-11-end');
      const measure11 = performance.getEntriesByName('loading-11')[0];
      console.log(`[LOADING 11] Assets collected in ${measure11?.duration?.toFixed(2)}ms`);

      // [LOADING 12] Starting HTML finalization and Beasties processing
      performance.mark('loading-12-start');
      console.log('[LOADING 12] Starting HTML finalization and Beasties processing...');

      let completeHtml = await renderHtml({
        appHtml: html,
        meta,
        head,
        body,
        initialState,
        loadedModulesJson,
      });

      // Обрабатываем HTML через Beasties для извлечения критического CSS
      // Beasties сам определит какие стили используются в HTML
      completeHtml = await beastiesProcessor.processHtml(completeHtml, {
        url: req.originalUrl
      });

      performance.mark('loading-12-end');
      performance.measure('loading-12', 'loading-12-start', 'loading-12-end');
      const measure12 = performance.getEntriesByName('loading-12')[0];
      console.log(`[LOADING 12] HTML finalized and processed in ${measure12?.duration?.toFixed(2)}ms`);

      res.status(statusCode).header('Content-Type', 'text/html; charset=utf-8').send(completeHtml);
    });

    return server;
  };

  const port = process.env.PORT || 8080;

  const start = async () => {
    const server = await startServer();
    try {
      // [LOADING 13] Starting production server
      performance.mark('loading-13-start');
      console.log('[LOADING 13] Starting production server on port ' + port + '...');

      server.listen(port, () => {
        performance.mark('loading-13-end');
        performance.measure('loading-13', 'loading-13-start', 'loading-13-end');
        const measure13 = performance.getEntriesByName('loading-13')[0];
        console.log(`[LOADING 13] Production server started in ${measure13?.duration?.toFixed(2)}ms`);
      });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  return start;
}