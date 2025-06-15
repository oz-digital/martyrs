import module$0 from 'module';
import path from 'path';
const { builtinModules } = module$0;
export default projectRoot => {
  // Получаем список встроенных модулей Node.js
  const nodeBuiltins = builtinModules.filter(m => m !== 'process');
  return {
    // Обязательно указываем, что это SSR конфигурация
    ssr: {
      // Внешние зависимости для SSR (не включать в бандл)
      // Это эквивалент nodeExternals в Webpack
      noExternal: ['**/node_modules/**'],
      // Можно указать какие модули включать в бандл, если нужно
      // external: [...nodeBuiltins],
    },
    // Режим сборки для сервера всегда development
    // (production оптимизации менее важны для серверного кода)
    mode: 'development',
    // Убираем оптимизации, не нужные для SSR
    optimizeDeps: {
      disabled: true,
    },
    // Настройки сборки
    build: {
      ssr: path.resolve(projectRoot, 'src/server.js'),
      outDir: path.resolve(projectRoot, 'builds/web/server'),
      emptyOutDir: true, // эквивалент clean: true в Webpack
      sourcemap: true,
      // Настройки сборки, специфичные для SSR
      rollupOptions: {
        input: path.resolve(projectRoot, 'src/server.js'),
        output: {
          // Имя выходного файла
          entryFileNames: 'server.[hash].js',
          format: 'cjs', // CommonJS формат для Node.js
        },
        // Не включаем node_modules в бандл
        external: [
          ...nodeBuiltins,
          /^node:/, // Новый префикс импорта node:* модулей
          /^[^./]/, // Все пакеты, которые не начинаются с . или / (node_modules)
        ],
      },
      // Отключаем минимизацию для серверного кода
      minify: false,
    },
    // Настройки разрешения путей
    resolve: {
      alias: {
        '@martyrs': path.resolve(projectRoot, 'martyrs'),
      },
    },
    // Настройки сервера разработки
    server: {
      hmr: true, // Hot Module Replacement для серверного кода
    },
    // Определяем, как обрабатывать определенные импорты
    plugins: [
      // Плагин для обработки импортов Node.js
      {
        name: 'vite-plugin-node-polyfills',
        config(config) {
          // Добавляем пустышки для Node.js модулей, которые не нужны в бандле
          config.resolve = config.resolve || {};
          config.resolve.alias = config.resolve.alias || {};
          // 'path: false' в Webpack эквивалентно:
          if (!config.resolve.alias.path) {
            config.resolve.alias.path = false;
          }
        },
      },
      // Плагин для поддержки HMR в серверном коде
      {
        name: 'vite-plugin-ssr-hmr',
        apply: 'serve', // Только для режима разработки
        configureServer(server) {
          // Наблюдение за серверными файлами
          server.watcher.add(path.resolve(projectRoot, 'src/**/*'));
          // Можно добавить дополнительную логику для перезапуска сервера
          // при изменении серверных файлов
          server.watcher.on('change', file => {
            if (file.includes('src/server')) {
              console.log('Server file changed, reloading...');
              // В Vite перезагрузка модулей обрабатывается автоматически
            }
          });
        },
      },
    ],
  };
};
