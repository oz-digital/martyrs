// vite.modules.server.config

import { resolve } from 'path';
import { defineConfig } from 'vite';

import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  resolve: {
    alias: {
      '@martyrs': resolve(__dirname, './'),
    },
  },
  plugins: [commonjs()],
  esbuild: {
    platform: 'node',
    target: 'node20',
  },
  build: {
    target: 'node20',
    rollupOptions: {
      external: ['sharp', 'express', 'jsonwebtoken', 'crypto', 'mongodb', 'mongoose', 'nodemailer', 'puppeteer'],
    },
    ssr: {
      noExternal: true,
      target: 'node',
      format: 'cjs',
    },
    emptyOutDir: false,
    lib: {
      entry: [
        resolve(__dirname, './src/modules/auth/auth.server.js'),
        resolve(__dirname, './src/modules/community/community.server.js'),
        resolve(__dirname, './src/modules/core/core.server.js'),
        resolve(__dirname, './src/modules/organizations/organizations.server.js'),
        resolve(__dirname, './src/modules/products/products.server.js'),
        resolve(__dirname, './src/modules/inventory/inventory.server.js'),
        resolve(__dirname, './src/modules/events/events.server.js'),
        resolve(__dirname, './src/modules/files/files.server.js'),
        resolve(__dirname, './src/modules/chats/chats.server.js'),
        resolve(__dirname, './src/modules/gallery/gallery.server.js'),
        resolve(__dirname, './src/modules/reports/reports.server.js'),
        resolve(__dirname, './src/modules/orders/orders.server.js'),
        // resolve(__dirname, './src/modules/wallet/wallet.server.js'),
        resolve(__dirname, './src/modules/spots/spots.server.js'),
        resolve(__dirname, './src/modules/pages/pages.server.js'),
        resolve(__dirname, './src/modules/rents/rents.server.js'),
        resolve(__dirname, './src/modules/music/music.server.js'),
        resolve(__dirname, './src/modules/notifications/notifications.server.js'),
      ],
      formats: ['cjs', 'es'],
      fileName: (format, entryName) => {
        const extension = format === 'es' ? 'js' : 'cjs';
        return `${entryName}.${extension}`;
      },
    },
  },
});
