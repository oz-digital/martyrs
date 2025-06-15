import crypto from 'crypto';
import Module from 'module';
import path from 'path';
/**
 * Normalizes assets from webpack stats
 * @param {Array|string} assets - Assets to normalize
 * @returns {Array} - Normalized array of assets
 */
function normalizeAssets(assets) {
  if (typeof assets === 'string') {
    return [assets];
  }
  if (Array.isArray(assets)) {
    return assets;
  }
  const object = assets;
  return Object.keys(object).reduce((result, key) => {
    return result.concat(object[key]);
  }, []);
}
/**
 * Creates a hash from a string
 * @param {string} str - String to hash
 * @returns {string} - Resulting hash
 */
function hash(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}
/**
 * Requires a module from a string
 * @param {string} src - Module source code
 * @param {string} filename - Module filename
 * @returns {any} - Exported module
 */
function requireFromString(src, filename = '') {
  const m = new Module(filename);
  m.filename = filename;
  m.paths = Module._nodeModulePaths(path.dirname(filename));
  m._compile(src, filename);
  return m.exports;
}
export { hash, normalizeAssets, requireFromString };
export default {
  normalizeAssets,
  requireFromString,
  hash,
};
