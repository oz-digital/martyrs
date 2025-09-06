import path from "path";
import { rspack } from '@rspack/core';
import nodeExternals from 'webpack-node-externals';
import { merge } from "webpack-merge";
import { RspackManifestPlugin } from 'rspack-manifest-plugin';

import getBaseConfig from "./rspack.config.base.js";

export default (projectRoot) => {
  const isProd = process.env.NODE_ENV === "production";

  const ssrConfig = {
    target: "node", // Для совместимости с VueSsrAssetsServerPlugin
    mode: !isProd ? "development" : "production",
    entry: {
      main: path.resolve(projectRoot, "src/client.js"),
    },
    output: {
      filename: "main.js",
      path: path.resolve(projectRoot, "builds/web/server"),
      // Явно указываем формат чанков
      chunkFormat: "module",
      library: {
        type: "module"
      },
      clean: true,
      module: true,
      environment: {
        module: true
      }
    },
    experiments: {
      outputModule: true
    },
    module: {
      rules: [
        // CSS обрабатывается base конфигом, не нужен null-loader
      ],
    },
    optimization: {
      minimize: false,
    },
    externals: [
      nodeExternals({
        allowlist: [
          /^@ozdao*/,
          /\.(css|sass|scss)$/,
          /\.(vue)$/,
          /\.(html)$/,
        ],
        importType: 'module'
      })
    ],
    plugins: [
      new rspack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      ...(isProd ? [new RspackManifestPlugin({
         fileName: 'manifest.json'
      })] : []),
    ],
  };

  return merge(getBaseConfig(projectRoot), ssrConfig);
};