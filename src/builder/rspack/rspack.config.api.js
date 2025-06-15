import core from '@rspack/core';
import path from 'path';
import nodeExternals from 'webpack-node-externals';
const { rspack } = core;

export default projectRoot => {
  return {
    target: 'node',
    mode: 'development',
    entry: [path.resolve(projectRoot, 'src/server.js')],
    output: {
      filename: 'server.js',
      path: path.resolve(projectRoot, 'builds/web/server'),
      libraryTarget: 'module',
      chunkFormat: 'module', 
      module: true,
      clean: true,
    },
    experiments: {
      outputModule: true,
    },
    resolve: {
      alias: {
        '@martyrs': path.resolve(projectRoot, 'martyrs'),
      },
      fallback: {
        path: false,
      },
    },
    // Добавляем externalsType для ES modules
    externalsType: 'module',
    externals: [
      nodeExternals({
        allowlist: [],
        // Важно! Указываем importType для ES modules
        importType: 'module'
      }),
      // Для .node файлов тоже используем module
      function({ context, request }, callback) {
        if (/\.node$/.test(request)) {
          return callback(null, `module ${request}`);
        }
        callback();
      }
    ],
    plugins: [],
    module: {
      rules: [
        {
          test: /\.node$/,
          loader: 'node-loader',
        }
      ]
    }
  };
};