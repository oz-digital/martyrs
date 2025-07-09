import { builtinModules } from 'module';
import path from 'path';

export default projectRoot => {
  return {
    // Режим разработки для сервера
    mode: 'development',
    
    // Настройки сборки для Node.js сервера
    build: {
      ssr: true,
      outDir: path.resolve(projectRoot, 'builds/web/server'),
      emptyOutDir: true,
      sourcemap: true,
      minify: false,
      
      rollupOptions: {
        input: path.resolve(projectRoot, 'src/server.js'),
        output: {
          format: 'esm', // Используем ESM для современного Node.js
          entryFileNames: 'server.js',
        },
        // Внешние зависимости - не включаем их в бандл
        external: [
          ...builtinModules,
          ...builtinModules.map(m => `node:${m}`),
          // Все пакеты из node_modules кроме тех, что нужны для бандла
          /^[^./]/,
        ],
      },
    },
    
    // Отключаем оптимизацию для серверного кода
    optimizeDeps: {
      disabled: true,
    },
    
    // Настройки разрешения путей
    resolve: {
      alias: {
        '@martyrs': path.resolve(projectRoot, 'martyrs'),
      },
    },
    
    // SSR настройки для сервера
    ssr: {
      target: 'node',
      // Форматирование ошибок в Node.js стиле
      format: 'esm',
    },
  };
};