import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { promises } from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import Mustache from 'mustache';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { StatsWriterPlugin } from 'webpack-stats-plugin';

import template from '../templates/page.js';
import getClientConfig from './webpack.config.ssr.client.js';
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
      // ...(!isProd ? [new webpack.HotModuleReplacementPlugin()] : []),
      new StatsWriterPlugin(),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new HtmlWebpackPlugin({
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
      // new CopyWebpackPlugin({
      //   patterns: [
      //     { from: path.resolve(projectRoot, "../public/logo"), to: 'logo' },
      //     { from: path.resolve(projectRoot, "../public/walkthrough"), to: 'walkthrough' },
      //     { from: path.resolve(projectRoot, "../public/icons"), to: 'icons' }
      //   ]
      // })
      // new ServiceWorkerPlugin()
    ],
    optimization: {
      minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    },
  };
  return merge(getClientConfig(projectRoot), spaConfig);
};
