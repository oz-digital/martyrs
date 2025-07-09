// webpack.config.server.js
import path from 'path';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';

export default projectRoot => {
  return {
    target: 'node',
    mode: 'development',
    entry: [path.resolve(projectRoot, 'src/server.js')],
    output: {
      filename: 'server.[fullhash].js',
      path: path.resolve(projectRoot, 'builds/web/server'),
      libraryTarget: 'module',
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
    externals: [nodeExternals({
      // Добавляем опцию importType для использования ESM импортов
      importType: 'module'
    })],
    plugins: [new webpack.HotModuleReplacementPlugin()],
  };
};