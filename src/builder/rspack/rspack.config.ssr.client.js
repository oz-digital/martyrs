import path from "path";
import glob from 'glob-all';
import { rspack } from '@rspack/core';
import { merge } from "webpack-merge";
import { StatsWriterPlugin } from "webpack-stats-plugin";
import { GenerateSW, InjectManifest } from '@aaroon/workbox-rspack-plugin';
import { PurgeCSSPlugin } from "purgecss-webpack-plugin";
import { RspackManifestPlugin } from 'rspack-manifest-plugin';
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
      // PWA PWA PWA PWA PWA
      // PWA: инжектим манифест в существующий sw.js
      new InjectManifest({
        swSrc: path.resolve(projectRoot, '../public/sw.js'),
        swDest: 'sw.js',
        exclude: [
          /\.html$/,
          /\.map$/,
          /\.js$/,  // Исключаем JS из прекэша для SSR
          /\.css$/, // Исключаем CSS из прекэша для SSR
        ],
        include: [
          /\.(png|jpg|jpeg|gif|webp|svg|ico)$/,
          /\.(woff|woff2|ttf|eot|otf)$/,
          /favicon/
        ],
        manifestTransforms: [
          (manifestEntries) => {
            const manifest = manifestEntries.filter(entry => {
              return !entry.url.match(/\.(html|map)$/) && entry.size < 5 * 1024 * 1024;
            });
            return { manifest };
          }
        ]
      }),
      // // PWA Manifest
      new RspackManifestPlugin({
        fileName: 'manifest.json',
        seed: {
          name: process.env.APP_NAME || 'App by Martyrs Framework',
          short_name: process.env.APP_SHORT_NAME || 'App',
          description: process.env.APP_DESCRIPTION || 'Progressive Web App by Martyrs Framework',
          theme_color: '#000000',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/favicon/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/favicon/android-chrome-512x512.png', 
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        generate: (seed) => seed
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