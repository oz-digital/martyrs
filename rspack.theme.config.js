import core from '@rspack/core.js';
import path from 'path';
const { rspack } = core;
export const mode = 'production';
export const devtool = false;
export const entry = {
  'theme/index': './src/styles/theme.scss',
};
export const output = {
  path: path.resolve(__dirname, 'dist'),
  clean: false,
};
export const experiments = {
  css: true,
};
export const plugins = [
  new rspack.CssExtractRspackPlugin({
    filename: 'theme/index.css',
    ignoreOrder: true,
  }),
];
// export { __dirname as context };
export default {
  context: __dirname,
  mode,
  devtool,
  entry,
  output,
  module: {
    rules: [
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
  experiments,
  plugins,
};
