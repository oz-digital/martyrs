const normalizeAssets = assets => {
  if (Array.isArray(assets)) return assets;
  if (typeof assets === 'object') return Object.values(assets);
  return [assets];
};

const extractAssets = (stats, publicPath) => {
  const jsAssets = [];
  const cssAssets = [];

  const assets = stats.assets || [];

  for (const asset of assets) {
    if (asset.name.endsWith(".js")) {
      jsAssets.push(`<script src="${publicPath}${asset.name}"></script>`);
    }
    if (asset.name.endsWith(".css")) {
      cssAssets.push(`<link rel="stylesheet" href="${publicPath}${asset.name}">`);
    }
  }

  return {
    head: cssAssets.join('\n'),
    body: jsAssets.join('\n'),
  };
};

const transformDevStats = (stats, outputFileSystem) => {
  const {
    assetsByChunkName: { main },
    outputPath,
    publicPath,
  } = stats;
  const head = `
      <style>
      ${normalizeAssets(main)
        .filter(path => path.endsWith('.css'))
        .map(path => outputFileSystem.readFileSync(path.join(outputPath, path)))
        .join('\n')}
      </style>
    `;
  const body = normalizeAssets(main)
    .filter(path => path.endsWith('.js'))
    .map(path => `<script src="${publicPath}${path}"></script>`)
    .join('\n');
  return { head, body };
};
const transformProdStats = ({ stats, publicPath }) => {
  const {
    assetsByChunkName: { main },
  } = stats;
  const head = normalizeAssets(main)
    .filter(path => path.endsWith('.css'))
    .map(path => `<link rel="stylesheet" href="${publicPath}${path}">`)
    .join('\n');
  const body = normalizeAssets(main)
    .filter(path => path.endsWith('.js'))
    .map(path => `<script src="${publicPath}${path}"></script>`)
    .join('\n');
  return { head, body };
};
export { extractAssets, transformDevStats, transformProdStats };
export default {
  transformDevStats,
  transformProdStats,
};
