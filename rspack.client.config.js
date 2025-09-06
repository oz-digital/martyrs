import core from '@rspack/core';
import path from 'path';
import { fileURLToPath } from 'url';
import { VueLoaderPlugin } from 'vue-loader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { rspack } = core;
// Получаем формат из переменной среды, по умолчанию cjs
const format = process.env.FORMAT || 'esm';
const isESM = format === 'esm';
// Модули для сборки
const moduleEntries = {
  'modules/auth/auth.client': './src/modules/auth/auth.client.js',
  'modules/community/community.client': './src/modules/community/community.client.js',
  'modules/globals/globals.client': './src/modules/globals/globals.client.js',
  'modules/organizations/organizations.client': './src/modules/organizations/organizations.client.js',
  'modules/events/events.client': './src/modules/events/events.client.js',
  'modules/products/products.client': './src/modules/products/products.client.js',
  'modules/marketplace/marketplace.client': './src/modules/marketplace/marketplace.client.js',
  'modules/files/files.client': './src/modules/files/files.client.js',
  'modules/chats/chats.client': './src/modules/chats/chats.client.js',
  'modules/landing/landing.client': './src/modules/landing/landing.client.js',
  'modules/backoffice/backoffice.client': './src/modules/backoffice/backoffice.client.js',
  'modules/gallery/gallery.client': './src/modules/gallery/gallery.client.js',
  'modules/reports/reports.client': './src/modules/reports/reports.client.js',
  'modules/icons/icons.client': './src/modules/icons/icons.client.js',
  'modules/orders/orders.client': './src/modules/orders/orders.client.js',
  'modules/spots/spots.client': './src/modules/spots/spots.client.js',
  'modules/pages/pages.client': './src/modules/pages/pages.client.js',
  'modules/rents/rents.client': './src/modules/rents/rents.client.js',
  'modules/music/music.client': './src/modules/music/music.client.js',
  'modules/notifications/notifications.client': './src/modules/notifications/notifications.client.js',
};
export const mode = 'production';
export const devtool = false;
export const target = 'web';
export const externals = ['vue', 'vue-router', 'vue-i18n', 'sharp', 'web3', 'axios', 'isomorphic-dompurify'];
export const output = {
  path: path.resolve(__dirname, 'dist'),
  filename: '[name]' + (isESM ? '.js' : '.cjs'),
  library: {
    type: isESM ? 'module' : 'commonjs',
  },
  chunkFormat: isESM ? 'module' : 'commonjs',
  chunkLoading: isESM ? 'import' : 'require',
  clean: false,
};
export const experiments = {
  outputModule: isESM,
};
export const resolve = {
  alias: {
    '@martyrs': path.resolve(__dirname),
    vue: path.resolve(__dirname, 'node_modules/vue'),
    'vue-router': path.resolve(__dirname, 'node_modules/vue-router'),
    'vue-i18n': path.resolve(__dirname, 'node_modules/vue-i18n'),
  },
};
export const optimization = {
  splitChunks: {
    chunks: 'async',
    minSize: 0,
    // minRemainingSize: 0,
    minChunks: 1,
    maxAsyncRequests: 30,
    maxInitialRequests: 30,
    // enforceSizeThreshold: 50000,
  },
};
export const plugins = [
  new VueLoaderPlugin(),
  // new rspack.CssExtractRspackPlugin({
  //   filename: '[name].css',
  //   ignoreOrder: true,
  // })
];
export { moduleEntries as entry };
export default {
  context: __dirname,
  mode,
  entry: moduleEntries,
  devtool,
  target,
  externals,
  output,
  experiments,
  resolve,
  optimization,
  module: {
    rules: [
      {
        test: /\.m?js$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'ecmascript',
                jsx: false,
              },
              target: 'es2020',
            },
          },
        },
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          experimentalInlineMatchResource: true,
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
              url: {
                filter: (url, resourcePath) => {
                  if (url.indexOf('/fonts/') == 0) {
                    return false;
                  }
                  return true;
                },
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false,
            },
          },
        ],
        type: 'javascript/auto',
      },
    ],
  },
  plugins,
};
