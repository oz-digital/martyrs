import fs from 'fs';
import lodash from 'lodash';
import path from 'path';
import getBaseConfig from './vite.config.base.js';
const { merge } = lodash;
export default projectRoot => {
  const isProd = process.env.NODE_ENV === 'production';
  // SSR specific configuration
  const ssrConfig = {
    // Build for SSR
    build: {
      ssr: true,
      // Output location
      outDir: path.resolve(projectRoot, 'builds/web/server'),
      // Entry point
      rollupOptions: {
        input: path.resolve(projectRoot, 'src/client.js'),
        output: {
          // Format for Node.js compatibility (equivalent to libraryTarget: "commonjs2")
          format: 'cjs',
          // Generate filename with hash
          entryFileNames: 'main.[hash].js',
        },
        // External packages that shouldn't be bundled (equivalent to nodeExternals)
        external: [
          'vue',
          'vue-router',
          'vuex',
          // Add other Node.js built-ins and dependencies that should be external
          ...Object.keys(require(path.resolve(projectRoot, 'package.json')).dependencies || {}).filter(dep => !dep.startsWith('vue-meta') && !/\.(css|sass|scss|vue|html)$/.test(dep)),
        ],
        preserveEntrySignatures: 'strict',
      },
      // Don't minify for SSR build
      minify: false,
      // Clean output directory before build
      emptyOutDir: true,
    },
    // Additional plugins for SSR
    plugins: [
      // Limit chunks plugin (equivalent to LimitChunkCountPlugin)
      {
        name: 'limit-chunks',
        apply: 'build',
        config(config) {
          if (!config.build) config.build = {};
          if (!config.build.rollupOptions) config.build.rollupOptions = {};
          if (!config.build.rollupOptions.output) config.build.rollupOptions.output = {};
          // Force single chunk
          config.build.rollupOptions.output.manualChunks = () => 'main';
        },
      },
      // Manifest plugin (equivalent to WebpackManifestPlugin)
      ...(isProd
        ? [
            {
              name: 'manifest-plugin',
              apply: 'build',
              closeBundle() {
                // Create a simple manifest of the build assets
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
      // Handle CSS for SSR (equivalent to null-loader for CSS)
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
    // Specify that this is for SSR
    ssr: {
      // Target is Node.js
      target: 'node',
      // Force CommonJS format
      format: 'cjs',
      // Don't optimize dependencies
      optimizeDeps: {
        disabled: true,
      },
    },
    // Don't process CSS for SSR
    css: {
      devSourcemap: false,
      // Empty CSS during SSR
      postcss: {
        plugins: [
          {
            postcssPlugin: 'postcss-empty-for-ssr',
            Once() {
              return {};
            },
          },
        ],
      },
    },
    // Server specific optimizations
    optimizeDeps: {
      // Disable optimization for server build
      disabled: true,
    },
  };
  // Merge base config with SSR config
  return merge(getBaseConfig(projectRoot), ssrConfig);
};
