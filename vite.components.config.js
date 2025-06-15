import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@martyrs': resolve(__dirname),
    },
  },
  plugins: [vue()],
  build: {
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: './src/main.js',
      formats: ['es', 'cjs'],
      name: 'martyrs',
      fileName: format => `martyrs.${format}.js`,
    },
    rollupOptions: {
      manualChunks: () => 'main',
      external: ['vue', 'vue-router', 'vue-i18n', 'sharp', 'web3', 'axios', 'isomorphic-dompurify'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use '../../../src/styles/theme.scss';`,
      },
    },
  },
});
