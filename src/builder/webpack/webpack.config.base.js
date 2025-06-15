import path from 'path';
import webpack from 'webpack';
import dotenv from 'dotenv-webpack';

import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

export default projectRoot => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, 'src'),
        '@martyrs': path.resolve(projectRoot, 'martyrs'),
        vue: path.resolve(projectRoot, 'node_modules/vue'),
        'vue-router': path.resolve(projectRoot, 'node_modules/vue-router'),
        'vue-i18n': path.resolve(projectRoot, 'node_modules/vue-i18n'),
      },
      fallback: {
        path: false,
      },
      extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules\/(?!(vue-meta)\/).*/,
          use: {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(projectRoot, 'babel.config.js'),
              // Добавляем опции для ESM
              presets: [
                ['@babel/preset-env', {
                  modules: false, // Важно: отключаем преобразование в CommonJS
                  targets: {
                    node: 'current',
                  },
                }]
              ],
              plugins: [
                // Заменяем @babel/plugin-transform-runtime на ESM совместимую версию
                ['@babel/plugin-transform-runtime', {
                  useESModules: true, // Важно: используем ESM версию хелперов
                  regenerator: true,
                }],
              ]
            },
          },
        },
        {
          test: /\.vue$/,
          use: [
            {
              loader: 'vue-loader',
            },
          ],
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            process.env.NODE_ENV !== 'production' ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
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
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.(?:ico|gif|png|jpg|jpeg|mp4|webp|webm|svg|woff2?|eot|ttf|otf)$/i,
          use: {
            loader: 'url-loader',
            options: {
              emitFile: false,
            },
          },
        },
      ],
    },
    plugins: [
      ...(process.env.BUNDLE_ANALYZER ? [new BundleAnalyzerPlugin()] : []),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[id].[contenthash].css',
        ignoreOrder: true,
      }),
      new CleanWebpackPlugin(),
      new VueLoaderPlugin(),
      new dotenv({
        path: `.env.${process.env.NODE_ENV}`,
      }),
      new webpack.DefinePlugin({
        __VUE_I18N_LEGACY_API__: false,
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS_: false,
        __VUE_PROD_DEVTOOLS__: true,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
        __VUE_I18N_FULL_INSTALL__: true,
        __INTLIFY_PROD_DEVTOOLS__: false,
        __MOBILE_APP__: process.env.MODE === 'SPA' ? true : false,
      }),
    ],
    infrastructureLogging: {
      level: 'verbose',
    },
    stats: {
      colors: true,
      hash: true,
      version: true,
      timings: true,
      assets: true,
      chunks: true,
      modules: true,
      reasons: true,
      children: true,
      source: true,
      errors: true,
      errorDetails: true,
      errorStack: true,
      warnings: true,
      publicPath: true,
    },
  };
};
