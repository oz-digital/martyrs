import { resolve } from 'path';
import { defineConfig } from 'vite';

import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  resolve: {
    alias: {
      '@martyrs': resolve(__dirname, './'),
    },
  },
  plugins: [
    commonjs({
      ignoreDynamicRequires: true, // игнорирование предупреждений о динамическом require
    }),
  ],
  esbuild: {
    platform: 'node',
    target: 'node20',
  },
  build: {
    target: 'node20',
    rollupOptions: {
      external: ['webpack', 'chalk', 'comperssion', '@rspack/cli', '@rspack/core', '@rspack'],
    },
    ssr: {
      noExternal: true,
      target: 'node',
      format: 'es',
    },
    emptyOutDir: false,
    lib: {
      entry: [resolve(__dirname, './src/builder/builder.js')],
      formats: ['es'],
      fileName: (format, entryName) => {
        const extension = format === 'es' ? 'js' : 'cjs';
        return `${entryName}.${extension}`;
      },
    },
  },
});
