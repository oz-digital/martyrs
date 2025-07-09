import fs from 'fs';
import lodash from 'lodash';
import path from 'path';
import * as purgecss from 'purgecss';
import { InjectManifest } from 'workbox-webpack-plugin';
import baseConfig from './vite.config.base.js';
const { merge } = lodash;
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
          // Оптимизированное разделение кода для уменьшения размера бандла
          manualChunks(id) {
            // Вендорные библиотеки
            if (id.includes('node_modules')) {
              // Vue экосистема
              if (id.includes('vue') || id.includes('@vue')) {
                return 'vue-vendor';
              }
              // Martyrs модули
              if (id.includes('@martyrs') || id.includes('@ozdao')) {
                return 'martyrs-vendor';
              }
              // UI библиотеки
              if (id.includes('datepicker') || id.includes('chart') || id.includes('ui')) {
                return 'ui-vendor';
              }
              // Остальные вендорные пакеты
              return 'vendor';
            }
            // Модули приложения
            if (id.includes('src/modules/')) {
              const match = id.match(/src\/modules\/([^\/]+)/);
              if (match) {
                return `module-${match[1]}`;
              }
            }
          },
        },
        // Настройки tree-shaking
        treeshake: {
          preset: 'recommended',
          moduleSideEffects: false,
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
                path.join(projectRoot, 'src/**/*.js'),
                path.join(projectRoot, 'martyrs/src/**/*.vue'),
                path.join(projectRoot, 'martyrs/src/**/*.js'),
                path.join(projectRoot, '/node_modules/@ozdao/martyrs/**/*.css'),
                path.join(projectRoot, '/node_modules/@ozdao/martyrs/**/*.scss'),
                path.join(projectRoot, '/node_modules/@ozdao/martyrs/src/**/*.vue'),
                path.join(projectRoot, '/node_modules/@ozdao/martyrs/src/**/*.js'),
                path.join(projectRoot, '/node_modules/@vuepic/vue-datepicker/**/*.js'),
              ],
              css: [{ raw: content }],
              safelist: {
                standard: ['safelisted', /^html/, /^:root/],
                deep: [/^safelisted-deep-/, /^html/, /^:root/],
                greedy: [/^data-v-/, /\[data-v-.*\]/, /\[data-v-[a-zA-Z0-9]*\]/],
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
            });
            if (purged.length > 0 && purged[0].css) {
              bundle[cssFile].source = purged[0].css;
            }
          }
        },
      },
      // Workbox плагин для PWA (InjectManifest как в rspack)
      {
        name: 'vite-plugin-workbox-inject',
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
          // Для продакшена используем InjectManifest
          const { InjectManifest } = await import('workbox-webpack-plugin');
          const injectManifest = new InjectManifest({
            swSrc: path.resolve(projectRoot, '../public/sw.js'),
            swDest: path.join(path.resolve(projectRoot, 'builds/web/client'), 'sw.js'),
            exclude: [/\.html$/, /\.map$/],
            manifestTransforms: [
              (manifestEntries) => {
                const manifest = manifestEntries.filter(entry => {
                  return !entry.url.match(/\.(html|map)$/) && entry.size < 5 * 1024 * 1024;
                });
                return { manifest };
              }
            ]
          });
          await injectManifest.apply();
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
      // Плагин для генерации PWA манифеста
      {
        name: 'vite-plugin-pwa-manifest',
        apply: 'build',
        closeBundle: async () => {
          if (!isProd) return;
          
          const manifest = {
            name: process.env.APP_NAME || 'OZDAO App',
            short_name: process.env.APP_SHORT_NAME || 'OZDAO',
            description: process.env.APP_DESCRIPTION || 'OZDAO Progressive Web App',
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
          };
          
          fs.writeFileSync(
            path.join(path.resolve(projectRoot, 'builds/web/client'), 'manifest.json'),
            JSON.stringify(manifest, null, 2)
          );
        },
      },
    ],
  };
  // Объединяем базовый конфиг с клиентским
  return merge({}, baseConfig(projectRoot), clientConfig);
};
