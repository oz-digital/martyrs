import baseConfig from './rspack.config.base.js';

import clientConfig from './rspack.config.ssr.client.js';
import ssrConfig from './rspack.config.ssr.server.js';
import spaConfig from './rspack.config.spa.client.js';

import apiConfig from './rspack.config.api.js';

export default {
  baseConfig,
  clientConfig,
  apiConfig,
  spaConfig,
  ssrConfig,
};
