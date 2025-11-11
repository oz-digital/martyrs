import path from "path";
import { rspack } from '@rspack/core';
import { VueLoaderPlugin } from "vue-loader";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import Dotenv from 'dotenv-webpack';

export default (projectRoot) => {
  return {
    context: projectRoot,
    resolve: {
       alias: {
        '@': path.resolve(projectRoot, 'src'),
        '@martyrs': path.resolve(projectRoot, 'martyrs'),
        'vue': path.resolve(projectRoot, 'node_modules/vue'),
        'vue-router': path.resolve(projectRoot, 'node_modules/vue-router'),
        'vue-i18n': path.resolve(projectRoot, 'node_modules/vue-i18n'),
      },
    },
    module: {
      rules: [
        
        {
          test: /\.m?js$/,
          exclude: /node_modules\/(?!(vue-meta)\/).*/,
          use: {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'ecmascript',
                  jsx: false
                },
                target: 'es2020'
              }
            }
          },
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            experimentalInlineMatchResource: true,
            preprocessOptions: {
              template: {
                preprocess: (content, { filename }) => {
                  const rewritten = content
                    // Обработка существующего синтаксиса v-slot
                    .replace(
                      /<(\w+)\s+v-slot(:[\w\-]+)?=("|'){([^"'}]+)}("|')\s*>/g,
                      (_match, tag, slotName, _q1, slotProps, _q2) => {
                        const slotAttr = slotName || '';
                        return `<template v-slot${slotAttr}="{${slotProps}}"><${tag}>`;
                      }
                    )
                    .replace(
                      /<\/(\w+)>\s*<!--\s*v-slot-close\s*-->/g,
                      (_match, tag) => `</${tag}></template>`
                    )
                    // Новая обработка для сокращенного синтаксиса #slotname
                    .replace(
                      /<(\w+)(\s+#[\w\-]+)([^>]*)\/>/g,
                      (_match, tag, slotDirective, attrs) => {
                        return `<template${slotDirective}><${tag}${attrs}/></template>`;
                      }
                    )
                    .replace(
                      /<(\w+)(\s+#[\w\-]+)([^>]*)>(.*?)<\/\1>/gs,
                      (_match, tag, slotDirective, attrs, content) => {
                        return `<template${slotDirective}><${tag}${attrs}>${content}</${tag}></template>`;
                      }
                    );

                  return { code: rewritten };
                }
              }
            }
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            // ВСЕГДА используем CssExtractRspackPlugin для SSR
            // Это нужно чтобы Beasties мог найти CSS файлы
            rspack.CssExtractRspackPlugin.loader,  
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                url: {
                  filter: (url, resourcePath) => {
                    // Не обрабатывать изображения из public
                    if (url.indexOf("/static/")==0) {
                      return false;
                    }
                    return true;
                  },
                }
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true, 
              }
            },
          ],
          type: 'javascript/auto'
        },
        {
          test: /\.(?:ico|gif|png|jpg|jpeg|mp4|webp|webm|svg|woff2?|eot|ttf|otf)$/i,
          type: "asset/resource",
        }
      ],
    },
    experiments: {
      css: false
    },
    plugins: [
      ...(process.env.BUNDLE_ANALYZER ? [new RsdoctorRspackPlugin(), new BundleAnalyzerPlugin()] : []),
      new VueLoaderPlugin(),
      // Используем CssExtractRspackPlugin в обоих режимах
      new rspack.CssExtractRspackPlugin({
        filename: process.env.NODE_ENV === 'production' 
          ? '[name].[contenthash].css' 
          : '[name].css',
        chunkFilename: process.env.NODE_ENV === 'production'
          ? '[id].[contenthash].css'
          : '[id].css',
        ignoreOrder: true,
      }),
      new CleanWebpackPlugin(),
      new Dotenv({
        path: `.env.${process.env.NODE_ENV}`,
        // ...(process.env.MODE === "SPA" ? [{path: '.env.mobile'}] : []),
      }),
      new rspack.DefinePlugin({
        __VUE_I18N_LEGACY_API__:false,
        __VUE_OPTIONS_API__:true,
        __VUE_PROD_DEVTOOLS_:false,
        __VUE_PROD_DEVTOOLS__: true,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
        __VUE_I18N_FULL_INSTALL__:true,
        __INTLIFY_PROD_DEVTOOLS__:false,
        __MOBILE_APP__: process.env.MODE === "SPA" ? true : false,
      })
    ],
    infrastructureLogging: {
      level: 'verbose',
    },
    stats: {
      // Минимальный вывод
      preset: 'minimal',
      // Или более детальная настройка:
      modules: false,
      chunks: false,
      chunkModules: false,
      chunkOrigins: false,
      entrypoints: false,
      assets: false,
      moduleTrace: false,
      errorDetails: false,
      // Показывать только ошибки и предупреждения
      errors: true,
      warnings: true,
      // Цвета в терминале
      colors: true
    }
  };
};