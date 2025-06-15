import core from '@rspack/core.js';
import path from 'path';
import { VueLoaderPlugin } from 'vue-loader';
const { rspack } = core;
const format = process.env.FORMAT || 'esm';
const isESM = format === 'esm';
export const mode = 'production';
export const devtool = false;
export const target = 'web';
export const entry = {
  'library/martyrs': './src/main.js',
};
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
export const plugins = [
  new rspack.CssExtractRspackPlugin({
    filename: '[name].css',
    ignoreOrder: true,
  }),
  new VueLoaderPlugin(),
];
// export { __dirname as context };
export default {
  context: __dirname,
  mode,
  devtool,
  target,
  entry,
  externals,
  output,
  experiments,
  resolve,
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
                dynamicImport: true,
              },
              target: 'es2020',
            },
          },
        },
      },
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          rspack.CssExtractRspackPlugin.loader,
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
