import path from 'path';
import express from 'express';
import { readFileSync } from 'fs';
import { renderHtml } from '../ssr/ssr-render-html.js';
import { transformProdStats } from '../ssr/ssr-transform-webpack-stats.js';

export default function createSsrProdServer(projectRoot, { clientConfig, apiConfig }, createServerPath) {
  const clientStats = JSON.parse(readFileSync(path.join(projectRoot, 'builds/web/client/stats.json'), 'utf-8'));
  const serverManifest = JSON.parse(readFileSync(path.join(projectRoot, 'builds/web/server/manifest.json'), 'utf-8'));
  
  const { createServer } = createServerPath;

  const startServer = async () => {
    const { app, server, env } = await createServer();
    
    app.use(
      clientConfig.output.publicPath,
      express.static(path.resolve(projectRoot, 'builds/web/client'), {
        maxAge: '1d', // Кэширование на 1 день
      })
    );

    const { render } = await import(path.join(
      apiConfig.output.path,
      serverManifest['main.js']
    ));

    const { head, body } = transformProdStats({
      stats: clientStats,
      publicPath: clientConfig.output.publicPath,
    });

    app.use('/*', async (req, res) => {
      const { html, meta, state, statusCode } = await render({
        url: req.originalUrl,
        cookies: req.cookies,
        languages: req.acceptsLanguages(),
      });

      if (state.NotFound) {
        res.status(404);
      }

      const initialState = JSON.stringify(state);

      const completeHtml = await renderHtml({
        appHtml: html,
        meta,
        head,
        body,
        initialState,
      });

      res.status(statusCode).header('Content-Type', 'text/html; charset=utf-8').send(completeHtml);
    });

    return server;
  };

  const port = process.env.PORT || 8080;

  const start = async () => {
    const server = await startServer();
    try {
      server.listen(port, () => console.log(`Server running on port ${port}`));
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  return start;
}