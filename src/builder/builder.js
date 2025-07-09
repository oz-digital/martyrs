import createSpaDevServer from './modes/spa.dev.js';
import createSpaProdServer from './modes/spa.prod.js';
import createSsrDevServer from './modes/ssr.dev.js';
import createSsrProdServer from './modes/ssr.prod.js';
import createSsrRspackDevServer from './modes/ssr.rspack.dev.js';
import createSsrViteDevServer from './modes/ssr.vite.dev.js';
import rspackConfigs from './rspack/index.js';
import webpackConfigs from './webpack/index.js';
import viteConfigs from './vite/index.js';

export {
  rspackConfigs,
  createSsrRspackDevServer,
  webpackConfigs,
  viteConfigs,
  createSsrDevServer,
  createSsrViteDevServer,
  createSsrProdServer,
  createSpaDevServer,
  createSpaProdServer,
};

export default {
  rspackConfigs,
  createSsrRspackDevServer,
  webpackConfigs,
  viteConfigs,
  createSsrDevServer,
  createSsrViteDevServer,
  createSsrProdServer,
  createSpaDevServer,
  createSpaProdServer,
};

