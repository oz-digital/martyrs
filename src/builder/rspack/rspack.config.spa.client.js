import core from '@rspack/core';
import { promises } from 'fs';
import Mustache from 'mustache';
import path from 'path';
import { merge } from 'webpack-merge';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import { InjectManifest } from '@aaroon/workbox-rspack-plugin';
import { RspackManifestPlugin } from 'rspack-manifest-plugin';
import template from '../templates/page.js';
import getClientConfig from './rspack.config.ssr.client.js';
const { rspack } = core;
const fs = { promises }.promises;
const isProd = process.env.NODE_ENV === 'production';
export default projectRoot => {
  const spaConfig = {
    mode: !isProd ? 'development' : 'production',
    devtool: 'source-map',
    entry: {
      main: path.resolve(projectRoot, 'src/client.js'),
    },
    output: {
      filename: 'main.js',
      path: path.resolve(projectRoot, 'builds/web/spa'),
      clean: true,
    },
    target: 'web',
    plugins: [
      // ...(!isProd ? [new rspack.HotModuleReplacementPlugin()] : []),
      new StatsWriterPlugin(),
      new rspack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new rspack.HtmlRspackPlugin({
        templateContent: async () => {
          const meta = {
            htmlAttrs: 'lang="en"',
            headAttrs: '',
            bodyAttrs: '',
            // head: '<meta name="description" content="Example">',
            body: '',
          };
          const data = {
            googleTagId: process.env.GOOGLE_TAG_ID,
            googleMapApiKey: process.env.GOOGLE_MAPS_API_KEY,
            meta,
          };
          return Mustache.render(template, data);
        },
        filename: 'index.html',
        inject: 'body',
      }),
      // new rspack.CopyRspackPlugin({
      //   patterns: [
      //     { from: path.resolve(projectRoot, "../public/logo"), to: 'logo' },
      //     { from: path.resolve(projectRoot, "../public/walkthrough"), to: 'walkthrough' },
      //     { from: path.resolve(projectRoot, "../public/icons"), to: 'icons' }
      //   ]
      // })
      // PWA: инжектим манифест в существующий sw.js (унифицированно с SSR)
      new InjectManifest({
        swSrc: path.resolve(projectRoot, '../public/sw.js'),
        swDest: 'sw.js',
        exclude: [/\.html$/, /\.map$/],
        manifestTransforms: [
          (manifestEntries) => {
            const manifest = manifestEntries.filter(entry => {
              return !entry.url.match(/\.(html|map)$/) && entry.size < 5 * 1024 * 1024;
            });
            return { manifest };
          }
        ]
      }),
      // PWA Manifest
      new RspackManifestPlugin({
        fileName: 'manifest.json',
        seed: {
          name: process.env.APP_NAME || 'OZDAO App',
          short_name: process.env.APP_SHORT_NAME || 'OZDAO',
          description: process.env.APP_DESCRIPTION || 'OZDAO Progressive Web App',
          theme_color: '#000000',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/favicon/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/favicon/android-chrome-512x512.png', 
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        generate: (seed, files, entrypoints) => {
          return seed;
        }
      }),
    ],
    optimization: {
      minimizer: [new rspack.SwcJsMinimizerRspackPlugin(), , new rspack.LightningCssMinimizerRspackPlugin()],
    },
  };
  return merge(getClientConfig(projectRoot), spaConfig);
};
