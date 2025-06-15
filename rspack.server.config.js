import path from 'path';
import nodeExternals from 'webpack-node-externals';
// Получаем формат из переменной среды, по умолчанию cjs
const format = process.env.FORMAT || 'cjs';
const isESM = format === 'esm';
export const devtool = false;
export const entry = {
  'modules/auth/auth.server': './src/modules/auth/auth.server.js',
  'modules/community/community.server': './src/modules/community/community.server.js',
  'modules/globals/globals.server': './src/modules/globals/globals.server.js',
  'modules/organizations/organizations.server': './src/modules/organizations/organizations.server.js',
  'modules/products/products.server': './src/modules/products/products.server.js',
  'modules/events/events.server': './src/modules/events/events.server.js',
  'modules/files/files.server': './src/modules/files/files.server.js',
  'modules/chats/chats.server': './src/modules/chats/chats.server.js',
  'modules/gallery/gallery.server': './src/modules/gallery/gallery.server.js',
  'modules/reports/reports.server': './src/modules/reports/reports.server.js',
  'modules/orders/orders.server': './src/modules/orders/orders.server.js',
  'modules/wallet/wallet.server': './src/modules/wallet/wallet.server.js',
  'modules/spots/spots.server': './src/modules/spots/spots.server.js',
  'modules/pages/pages.server': './src/modules/pages/pages.server.js',
  'modules/rents/rents.server': './src/modules/rents/rents.server.js',
  'modules/notifications/notifications.server': './src/modules/notifications/notifications.server.js',
};
export const target = 'node';
export const resolve = {
  alias: {
    '@martyrs': path.resolve(__dirname, './'),
  },
};
export const externals = [nodeExternals()];
export const builtins = {
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
};
export const output = {
  path: path.resolve(__dirname, 'dist'),
  filename: '[name]' + (isESM ? '.js' : '.cjs'),
  library: {
    type: isESM ? 'module' : 'commonjs',
  },
  chunkFormat: isESM ? 'module' : 'commonjs',
  clean: false,
};
export const experiments = {
  outputModule: isESM,
};
// export { __dirname as context };
export default {
  context: __dirname,
  devtool,
  entry,
  target,
  resolve,
  externals,
  builtins,
  output,
  experiments,
  module: {
    rules: [
      {
        test: /\.js$/,
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
    ],
  },
};
