import createSpaRspackDevServer from './modes/spa.rspack.dev.js';
import createSpaProdServer from './modes/spa.prod.js';

import createSsrRspackDevServer from './modes/ssr.rspack.dev.js';
import createSsrProdServer from './modes/ssr.prod.js';

import rspackConfigs from './rspack/index.js';

export {
  rspackConfigs,
  createSsrRspackDevServer,
  createSsrProdServer,
  createSpaRspackDevServer,
  createSpaProdServer,
};

export default {
  rspackConfigs,
  createSsrRspackDevServer,
  createSsrProdServer,
  createSpaRspackDevServer,
  createSpaProdServer,
};

