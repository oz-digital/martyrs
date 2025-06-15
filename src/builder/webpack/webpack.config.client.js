import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import glob from 'glob-all';
import path from 'path';
import { PurgeCSSPlugin } from 'purgecss-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { merge } from 'webpack-merge';
import { StatsWriterPlugin } from 'webpack-stats-plugin';

import baseConfig from './webpack.config.base.js';
export default projectRoot => {
  const isProd = process.env.NODE_ENV === 'production';
  const config = {
    mode: !isProd ? 'development' : 'production',
    devtool: !isProd ? 'inline-source-map' : 'source-map',
    entry: {
      main: !isProd ? [path.resolve('../utils/hot-reload.js'), path.resolve(projectRoot, 'src/client.js')] : path.resolve(projectRoot, 'src/client.js'),
    },
    module: {
      rules: [],
    },
    output: {
      filename: '[name].[fullhash].js',
      chunkFilename: '[name].[contenthash].js',
      path: path.resolve(projectRoot, 'builds/web/client'),
      publicPath: '/',
      clean: true,
    },
    plugins: [
      // ...(!isProd ? [new webpack.HotModuleReplacementPlugin()] : []),
      new StatsWriterPlugin(),
      ...(!isProd
        ? [
            // new WorkboxPlugin.GenerateSW({
            //   clientsClaim: true,
            //   skipWaiting: true,
            //   disableDevLogs: true
            // }),
          ]
        : []),
      new PurgeCSSPlugin({
        printRejected: true,
        paths: glob.sync([
          path.join(projectRoot, 'src/**/*.vue'),
          path.join(projectRoot, 'src/**/*.js'),
          path.join(projectRoot, 'martyrs/src/**/*.vue'),
          path.join(projectRoot, 'martyrs/src/**/*.js'),
          path.join(projectRoot, '/node_modules/@ozdao/martyrs/**/*.css'),
          path.join(projectRoot, '/node_modules/@ozdao/martyrs/**/*.scss'),
          path.join(projectRoot, '/node_modules/@ozdao/martyrs/src/**/*.vue'),
          path.join(projectRoot, '/node_modules/@ozdao/martyrs/src/**/*.js'),
          path.join(projectRoot, '/node_modules/@vuepic/vue-datepicker/**/*.js'),
        ]),
        safelist: {
          standard: ['safelisted', /^html/, /^:root/],
          deep: [/^safelisted-deep-/, /^html/, /^:root/],
          greedy: [/data-v-.*/],
        },
        extractors: [
          {
            extractor: content => {
              // fix for escaped tailwind prefixes (sm:, lg:, etc)
              return content.match(/[A-Za-z0-9-_:/]+/g) || [];
            },
            extensions: ['vue'],
          },
        ],
      }),
    ],
    optimization: {
      usedExports: true,
      splitChunks: {
        chunks: 'async',
        minSize: 0,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      },
      minimize: isProd,
      minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    },
  };
  return merge(baseConfig(projectRoot), config);
};
