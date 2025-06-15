// webpack.config.ssr.js
import path from 'path';
import webpack from 'webpack';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import { merge } from 'webpack-merge';
import nodeExternals from 'webpack-node-externals';
import getBaseConfig from './webpack.config.base.js';

export default projectRoot => {
  const isProd = process.env.NODE_ENV === 'production';
  const ssrConfig = {
    target: 'node',
    mode: !isProd ? 'development' : 'production',
    entry: {
      main: path.resolve(projectRoot, 'src/client.js'),
    },
    output: {
      filename: 'main.[fullhash].js',
      path: path.resolve(projectRoot, 'builds/web/server'),
      libraryTarget: 'module',    
      module: true,
      clean: true,
    },
    experiments: {
      outputModule: true,
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: 'null-loader',
        },
      ],
    },
    optimization: {
      minimize: false,
    },
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      ...(isProd
        ? [
            new WebpackManifestPlugin({
              fileName: 'manifest.json',
            }),
          ]
        : []),
    ],
    externals: [
      nodeExternals({
        allowlist: [/^vue-meta*/, /\.(css|sass|scss)$/, /\.(vue)$/, /\.(html)$/],
        // Добавляем опцию importType для использования ESM импортов
        importType: 'module'
      }),
    ],
  };
  return merge(getBaseConfig(projectRoot), ssrConfig);
};