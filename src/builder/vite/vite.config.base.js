import vue from '@vitejs/plugin-vue';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import rollupPluginVisualizer from 'rollup-plugin-visualizer';
// Функция для загрузки переменных окружения
function loadEnv(mode) {
  const envFile = `.env.${mode}`;
  if (fs.existsSync(envFile)) {
    const envConfig = dotenv.parse(fs.readFileSync(envFile));
    for (const [key, value] of Object.entries(envConfig)) {
      process.env[key] = value;
    }
  }
}
export default projectRoot => {
  // Загружаем переменные окружения
  loadEnv(process.env.NODE_ENV || 'development');
  return {
    root: projectRoot,
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, 'src'),
        '@martyrs': path.resolve(projectRoot, 'martyrs'),
        vue: path.resolve(projectRoot, 'node_modules/vue'),
        'vue-router': path.resolve(projectRoot, 'node_modules/vue-router'),
        'vue-i18n': path.resolve(projectRoot, 'node_modules/vue-i18n'),
      },
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            // Настройки компилятора Vue
          },
        },
      }),
      // Дополнительные плагины для анализа бандла по условию
      ...(process.env.BUNDLE_ANALYZER
        ? [
            {
              name: 'bundle-analyzer',
              configResolved(config) {
                // Динамически импортируем rollup-plugin-visualizer только когда нужно
                const { visualizer } = rollupPluginVisualizer;
                config.plugins.push(
                  visualizer({
                    open: true,
                    filename: 'stats.html',
                    gzipSize: true,
                    brotliSize: true,
                  })
                );
              },
            },
          ]
        : []),
    ],
    // Настройки для CSS
    css: {
      preprocessorOptions: {
        scss: {
          sourceMap: true,
        },
      },
      // Экстракция CSS в продакшн
      // В Vite это делается автоматически в production режиме
    },
    // Настройки сборки
    build: {
      outDir: 'dist',
      emptyOutDir: true, // Эквивалент CleanWebpackPlugin
      sourcemap: true,
      rollupOptions: {
        output: {
          // Настройки для получения хэша в имени файла
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
        },
      },
    },
    // Определение глобальных переменных для Vue
    define: {
      __VUE_I18N_LEGACY_API__: false,
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS_: false,
      __VUE_PROD_DEVTOOLS__: true,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
      __VUE_I18N_FULL_INSTALL__: true,
      __INTLIFY_PROD_DEVTOOLS__: false,
      __MOBILE_APP__: process.env.MODE === 'SPA' ? true : false,
    },
    // Настройки лога
    logLevel: 'info', // 'info' | 'warn' | 'error' | 'silent'
    // Настройка для assets
    assetsInclude: ['**/*.ico', '**/*.gif', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.mp4', '**/*.webp', '**/*.webm', '**/*.svg', '**/*.woff', '**/*.woff2', '**/*.eot', '**/*.ttf', '**/*.otf'],
    // Опция для URL в CSS, аналогичная той что была в Rspack
    experimental: {
      // Vite по умолчанию обрабатывает asset URLs в CSS
      // Если нужно отключить обработку URL для определенных файлов,
      // это можно сделать через свой плагин
      renderBuiltUrl(filename, { hostType }) {
        if (filename.includes('/fonts/')) {
          return { relative: true }; // Не обрабатывать URL для фонтов
        }
        return { relative: true }; // Для остальных использовать относительные пути
      },
    },
  };
};
