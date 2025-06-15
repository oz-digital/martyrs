// babel.config.js
export default {
  presets: [
    ['@babel/preset-env', {
      modules: false, // Важно: отключаем преобразование в CommonJS
      targets: {
        node: 'current',
      },
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      useESModules: true, // Используем ESM версию хелперов
      regenerator: true,
    }]
  ]
};