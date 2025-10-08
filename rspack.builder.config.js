import path from 'path';
import { fileURLToPath } from 'url';
import nodeExternals from 'webpack-node-externals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Получаем формат из переменной среды, по умолчанию cjs
const format = process.env.FORMAT || 'cjs';
const isESM = format === 'esm';
export const devtool = false;
export const entry = {
  'builder/index': './src/builder/builder.js',
};
export const target = 'node';
export const externals = [nodeExternals(), 'rspack'];
export const output = {
  path: path.resolve(__dirname, 'dist'),
  filename: '[name]' + (isESM ? '.js' : '.cjs'),
  library: {
    type: isESM ? 'module' : 'commonjs',
  },
  chunkFormat: isESM ? 'module' : 'commonjs',
  chunkLoading: isESM ? 'import' : 'require',
  clean: false,
};
export const experiments = {
  outputModule: isESM,
};
// export { __dirname as context };

export default {
  context: __dirname,
  devtool,
  entry,
  target,
  externals,
  output,
  experiments,
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'ecmascript',
                jsx: false,
              },
              target: 'es2020',
            },
          },
        },
      },
    ],
  },
};
