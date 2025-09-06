import createSpaRspackDevServer from './modes/spa.rspack.dev.js';
import createSpaProdServer from './modes/spa.prod.js';

import createSsrRspackDevServer from './modes/ssr.rspack.dev.js';
import createSsrViteDevServer from './modes/ssr.vite.dev.js';
import createSsrProdServer from './modes/ssr.prod.js';

import rspackConfigs from './rspack/index.js';
import viteConfigs from './vite/index.js';

export {
  rspackConfigs,
  viteConfigs,
  createSsrRspackDevServer,
  createSsrViteDevServer,
  createSsrProdServer,
  createSpaRspackDevServer,
  createSpaProdServer,
};

export default {
  rspackConfigs,
  viteConfigs,
  createSsrRspackDevServer,
  createSsrViteDevServer,
  createSsrProdServer,
  createSpaRspackDevServer,
  createSpaProdServer,
};

