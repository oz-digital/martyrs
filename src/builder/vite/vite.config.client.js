import fs from 'fs';
import lodash from 'lodash';
import path from 'path';
import * as purgecss from 'purgecss';
import * as workboxBuild from 'workbox-build';
import baseConfig from './vite.config.base.js';
const { merge } = lodash;
const { generateSW } = workboxBuild;
export default projectRoot => {
  const isProd = process.env.NODE_ENV === 'production';
  // Базовая конфигурация для клиентской части
  const clientConfig = {
    // Основная точка входа
    build: {
      outDir: path.resolve(projectRoot, 'builds/web/client'),
      emptyOutDir: true, // эквивалент clean: true в Webpack
      sourcemap: true,
      rollupOptions: {
        input: {
          main: path.resolve(projectRoot, 'src/client.js'),
        },
        output: {
          // Настройки форматирования имен файлов
          entryFileNames: '[name].[hash].js',
          chunkFileNames: '[name].[hash].js',
          assetFileNames: '[name].[hash].[ext]',
          // Настройки разделения кода
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendors';
            }
          },
        },
      },
      // Оптимизация в production
      minify: isProd ? 'terser' : false,
      terserOptions: isProd
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          }
        : undefined,
      // Настройки CSS минификации
      cssMinify: isProd ? 'cssnano' : false,
      cssCodeSplit: true,
    },
    // В режиме разработки используем HMR
    server: {
      hmr: !isProd,
    },
    // Добавляем пользовательские плагины
    plugins: [
      // Плагин для PurgeCSS
      {
        name: 'vite-plugin-purge-css',
        apply: 'build', // Применяем только при сборке
        enforce: 'post', // После всех других плагинов
        transformIndexHtml: {
          enforce: 'post',
          transform(html, { bundle }) {
            if (!isProd) return html;
            // Здесь можно реализовать PurgeCSS для HTML
            return html;
          },
        },
        async generateBundle(options, bundle) {
          if (!isProd) return;
          const cssFiles = Object.keys(bundle).filter(key => key.endsWith('.css'));
          for (const cssFile of cssFiles) {
            const content = bundle[cssFile].source;
            const purged = await new purgecss.PurgeCSS().purge({
              content: [
                path.join(projectRoot, 'src/**/*.vue'),
                path.join(projectRoot, 'martyrs/src/**/*.vue'),
                path.join(projectRoot, '/node_modules/@ozdao/martyrs/src/**/*.vue'),
                path.join(projectRoot, '/node_modules/@vuepic/vue-datepicker/**/*.js'),
              ],
              css: [{ raw: content }],
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
            });
            if (purged.length > 0 && purged[0].css) {
              bundle[cssFile].source = purged[0].css;
            }
          }
        },
      },
      // Workbox плагин для PWA
      {
        name: 'vite-plugin-workbox',
        apply: 'build',
        closeBundle: async () => {
          if (!isProd) {
            // Для режима разработки можно создать минимальный сервис-воркер
            const devSwContent = `
              self.addEventListener('install', () => self.skipWaiting());
              self.addEventListener('activate', () => self.clients.claim());
            `;
            fs.writeFileSync(path.join(path.resolve(projectRoot, 'builds/web/client'), 'sw.js'), devSwContent);
            return;
          }
          // Для продакшена используем полноценный Workbox
          const { swDest, count, size, warnings } = await generateSW({
            globDirectory: path.resolve(projectRoot, 'builds/web/client'),
            swDest: path.join(path.resolve(projectRoot, 'builds/web/client'), 'sw.js'),
            clientsClaim: true,
            skipWaiting: true,
          });
          if (warnings.length > 0) {
            console.warn('Workbox warnings: ', warnings);
          }
          console.log(`Generated service worker at ${swDest}, which will precache ${count} files (${size} bytes)`);
        },
      },
      // Плагин для записи статистики сборки
      {
        name: 'vite-plugin-stats-writer',
        apply: 'build',
        closeBundle: async (options, bundle) => {
          // Создаем статистику сборки
          const stats = {
            entrypoints: {},
            assetsByChunkName: {},
            assets: [],
          };
          // Заполняем статистику на основе бандла
          for (const [fileName, asset] of Object.entries(bundle)) {
            if (fileName.endsWith('.js')) {
              stats.assets.push({
                name: fileName,
                size: asset.code ? asset.code.length : 0,
                emitted: true,
              });
              if (fileName.includes('main')) {
                stats.entrypoints.main = { assets: [fileName] };
                stats.assetsByChunkName.main = [fileName];
              } else if (fileName.includes('vendors')) {
                stats.assetsByChunkName.vendors = [fileName];
              }
            }
          }
          // Записываем статистику в файл
          fs.writeFileSync(path.join(path.resolve(projectRoot, 'builds/web/client'), 'stats.json'), JSON.stringify(stats, null, 2));
        },
      },
    ],
  };
  // Объединяем базовый конфиг с клиентским
  return merge({}, baseConfig(projectRoot), clientConfig);
};
