import fs from 'fs';
import lodash from 'lodash';
import path from 'path';
import getBaseConfig from './vite.config.base.js';
const { merge } = lodash;

export default projectRoot => {
  const isProd = process.env.NODE_ENV === 'production';
  
  const ssrConfig = {
    build: {
      ssr: true,
      outDir: path.resolve(projectRoot, 'builds/web/server'),
      rollupOptions: {
        input: path.resolve(projectRoot, 'src/client.js'),
        output: {
          format: 'esm',
          entryFileNames: 'main.[hash].js',
        },
      },
      minify: false,
      emptyOutDir: true,
    },
    ssr: {
      noExternal: ['vue', 'vue-router', 'vuex', 'vue-meta']
    },
    optimizeDeps: {
      disabled: true,
    },
    plugins: [
      {
        name: 'limit-chunks',
        apply: 'build',
        config(config) {
          if (!config.build) config.build = {};
          if (!config.build.rollupOptions) config.build.rollupOptions = {};
          if (!config.build.rollupOptions.output) config.build.rollupOptions.output = {};
          config.build.rollupOptions.output.manualChunks = () => 'main';
        },
      },
      ...(isProd
        ? [
            {
              name: 'manifest-plugin',
              apply: 'build',
              closeBundle() {
                const outDir = path.resolve(projectRoot, 'builds/web/server');
                const files = fs.readdirSync(outDir).filter(file => file.endsWith('.js'));
                const manifest = {};
                files.forEach(file => {
                  const name = file.split('.')[0];
                  manifest[`${name}.js`] = file;
                });
                fs.writeFileSync(path.resolve(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
              },
            },
          ]
        : []),
      {
        name: 'ignore-css-for-ssr',
        transform(code, id) {
          if (/\.(css|less|sass|scss)$/.test(id)) {
            return {
              code: 'export default {}',
              map: null,
            };
          }
        },
      },
    ],
  };
  
  return merge(getBaseConfig(projectRoot), ssrConfig);
};