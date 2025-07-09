import fs from 'fs';
import lodash from 'lodash';
import path from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
import page from '../templates/page.js';
import baseConfig from './vite.config.base.js';
const { merge } = lodash;
export default projectRoot => {
  const isProd = process.env.NODE_ENV === 'production';
  // SPA config - equivalent to the spaConfig in the original webpack
  const spaConfig = {
    // Set mode based on environment
    mode: !isProd ? 'development' : 'production',
    // Entry point (entry is implicit in Vite but can be specified)
    build: {
      rollupOptions: {
        input: path.resolve(projectRoot, 'src/client.js'),
      },
      // Override output directory
      outDir: path.resolve(projectRoot, 'builds/web/spa'),
      // Clean the output directory before build
      emptyOutDir: true,
    },
    // Add HTML plugin for SPA
    plugins: [
      createHtmlPlugin({
        minify: isProd,
        inject: {
          data: {
            googleTagId: process.env.GOOGLE_TAG_ID,
            googleMapApiKey: process.env.GOOGLE_MAPS_API_KEY,
          },
        },
        template: page,
      }),
      // Stats plugin (equivalent to StatsWriterPlugin)
      {
        name: 'stats-writer',
        apply: 'build',
        writeBundle(options, bundle) {
          const stats = JSON.stringify(
            Object.keys(bundle).reduce((acc, key) => {
              acc[key] = {
                size: bundle[key].code?.length || 0,
              };
              return acc;
            }, {})
          );
          fs.writeFileSync(path.resolve(options.dir, 'stats.json'), stats);
        },
      },
      // Limit chunks (equivalent to LimitChunkCountPlugin)
      {
        name: 'limit-chunks',
        apply: 'build',
        config(config) {
          if (!config.build) config.build = {};
          if (!config.build.rollupOptions) config.build.rollupOptions = {};
          if (!config.build.rollupOptions.output) config.build.rollupOptions.output = {};
          config.build.rollupOptions.output.manualChunks = () => 'main';
        },
      },
      // Uncomment if you need CopyWebpackPlugin equivalent
      /*
            require('vite-plugin-static-copy').viteStaticCopy({
              targets: [
                { src: path.resolve(projectRoot, "../public/logo"), dest: '' },
                { src: path.resolve(projectRoot, "../public/walkthrough"), dest: '' },
                { src: path.resolve(projectRoot, "../public/icons"), dest: '' }
              ]
            })
            */
    ],
    // Server options
    server: {
      hot: true,
    },
  };
  // Merge client config with spa config (equivalent to webpack-merge)
  return merge(baseConfig(projectRoot), spaConfig);
};
