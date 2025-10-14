import vue from '@vitejs/plugin-vue';

import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@martyrs': resolve(__dirname),
    },
  },
  plugins: [
    vue(),
  ],
  build: {
    minify: false,
    sourcemap: true,
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: [
        resolve(__dirname, './src/modules/auth/auth.client.js'),
        resolve(__dirname, './src/modules/community/community.client.js'),
        resolve(__dirname, './src/modules/core/core.client.js'),
        resolve(__dirname, './src/modules/organizations/organizations.client.js'),
        resolve(__dirname, './src/modules/events/events.client.js'),
        resolve(__dirname, './src/modules/products/products.client.js'),
        resolve(__dirname, './src/modules/inventory/inventory.client.js'),
        resolve(__dirname, './src/modules/marketplace/marketplace.client.js'),
        resolve(__dirname, './src/modules/files/files.client.js'),
        resolve(__dirname, './src/modules/chats/chats.client.js'),
        resolve(__dirname, './src/modules/landing/landing.client.js'),
        resolve(__dirname, './src/modules/backoffice/backoffice.client.js'),
        resolve(__dirname, './src/modules/gallery/gallery.client.js'),
        resolve(__dirname, './src/modules/reports/reports.client.js'),
        resolve(__dirname, './src/modules/icons/icons.client.js'),
        resolve(__dirname, './src/modules/orders/orders.client.js'),
        resolve(__dirname, './src/modules/spots/spots.client.js'),
        resolve(__dirname, './src/modules/pages/pages.client.js'),
        resolve(__dirname, './src/modules/rents/rents.client.js'),
        resolve(__dirname, './src/modules/music/music.client.js'),
        resolve(__dirname, './src/modules/notifications/notifications.client.js'),
        // resolve(__dirname, './src/modules/wallet/wallet.client.js'),
      ],
      formats: ['es'],
      fileName: (format, entryName) => {
        const extension = format === 'es' ? 'js' : 'cjs';
        return `${entryName}.${extension}`;
      },
    },
    rollupOptions: {
      external: ['vue', , 'vue-router', 'vue-i18n', 'web3', 'axios', 'isomorphic-dompurify'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'vue-router': 'vue-router',
          'vue-i18n': 'vue-i18n',
          web3: 'web3',
        },
        preserveModules: true,
        assetFileNames: assetInfo => {
          if (assetInfo.name == 'martyrs.css') return 'style.css';
          return assetInfo.name;
        },
      },
    },
  },
});
