import path from "path";
import glob from 'glob-all';
import { rspack } from '@rspack/core';
import { merge } from "webpack-merge";
import { StatsWriterPlugin } from "webpack-stats-plugin";
import { GenerateSW, InjectManifest } from '@aaroon/workbox-rspack-plugin';
import { PurgeCSSPlugin } from "purgecss-webpack-plugin";
import baseConfig from './rspack.config.base.js';

export default (projectRoot) => {
  const isProd = process.env.NODE_ENV === "production";
  const config = {
    mode: !isProd ? "development" : "production",
    devtool: !isProd ? "inline-source-map" : "source-map",
    entry: {
      main: path.resolve(projectRoot, "src/client.js"),
    },
    module: {
      rules: [],
    },
    output: {
      filename: "[name].js",
      chunkFilename: '[name].js',
      path: path.resolve(projectRoot, "builds/web/client"),
      publicPath: "/",
      clean: true
    },
    
    plugins: [
      // ...(!isProd ? [new rspack.HotModuleReplacementPlugin()] : []),
      new StatsWriterPlugin(),
      new PurgeCSSPlugin({
        paths: glob.sync([
          path.join(projectRoot, 'src/**/*.vue'),
          path.join(projectRoot, 'src/**/*.js'),
          path.join(projectRoot, 'martyrs/src/**/*.vue'),
          path.join(projectRoot, 'martyrs/src/**/*.js'),
          path.join(projectRoot, '/node_modules/@ozdao/martyrs/**/*.css'),
          path.join(projectRoot, '/node_modules/@ozdao/martyrs/**/*.scss'),
          path.join(projectRoot, '/node_modules/@ozdao/martyrs/src/**/*.vue'),
          path.join(projectRoot, '/node_modules/@ozdao/martyrs/src/**/*.js'),
          path.join(projectRoot, '/node_modules/@vuepic/vue-datepicker/**/*.js')
        ]),
        safelist: { 
          standard: ["safelisted", /^html/, /^:root/],
          deep: [/^safelisted-deep-/, /^html/, /^:root/],
            greedy: [/^data-v-/, /\[data-v-.*\]/, /\[data-v-[a-zA-Z0-9]*\]/] 
        },
        rejected: true, 
        extractors: [
          {
            extractor: (content) => {
              // Ищем классы и селекторы с префиксами Tailwind
              const normalClasses = content.match(/[A-Za-z0-9-_:\/]+/g) || [];
              
              // Дополнительно ищем Vue атрибуты data-v-*
              // Это важно для правильного распознавания scoped стилей
              const scopedAttrs = content.match(/\[data-v-[a-zA-Z0-9]*\]/g) || [];
              
              // Объединяем результаты
              return [...normalClasses, ...scopedAttrs];
            },
            extensions: ['vue', 'js', 'css', 'scss'],
          },
        ],
      }),
    ],
    optimization: {
      usedExports: true,  
      splitChunks: {
        chunks: "async",
        minSize: 0,
        // minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        // enforceSizeThreshold: 50000,
      },
      minimize: isProd,
      minimizer: [
        new rspack.SwcJsMinimizerRspackPlugin(), 
        new rspack.LightningCssMinimizerRspackPlugin()
      ],
    },
  };
  return merge(baseConfig(projectRoot), config);
};