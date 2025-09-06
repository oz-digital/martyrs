export function createAssetResolver(statsJson) {
  
  return {
    collect(usedModules = [], options = {}) {
      const initialFiles = new Set();
      const moduleFiles = new Set();
      
      // Add initial chunks from entrypoint (support both 'app' and 'main')
      const entrypointName = statsJson?.entrypoints?.app ? 'app' : 'main';
      
      // Collect initial chunks - these will be executed immediately
      if (statsJson?.entrypoints?.[entrypointName]?.assets) {
        for (const asset of statsJson.entrypoints[entrypointName].assets) {
          const filename = typeof asset === 'string' ? asset : asset.name;
          if (filename) initialFiles.add(filename);
        }
      }
      
      // Collect module chunks - these will be preloaded but not executed
      // Try to find chunks via assetsByChunkName first (Rspack/Webpack v5)
      if (usedModules.length > 0 && statsJson?.assetsByChunkName) {
        
        for (const moduleName of usedModules) {
          // Check with module- prefix (how modules are named in chunks)
          const chunkName = `module-${moduleName}`;
          
          if (statsJson.assetsByChunkName[chunkName]) {
            const assets = statsJson.assetsByChunkName[chunkName];
            
            // assetsByChunkName can be either string or array
            const assetList = Array.isArray(assets) ? assets : [assets];
            for (const asset of assetList) {
              moduleFiles.add(asset);
            }
          }
          
          // Also check without prefix (for other types of chunks)
          if (statsJson.assetsByChunkName[moduleName]) {
            const assets = statsJson.assetsByChunkName[moduleName];
            
            const assetList = Array.isArray(assets) ? assets : [assets];
            for (const asset of assetList) {
              moduleFiles.add(asset);
            }
          }
        }
      }
      // Fallback to old method for compatibility
      else if (usedModules.length > 0 && statsJson?.modules && statsJson?.chunks) {
        // Collect chunks for used modules
        const neededChunks = new Set();
        
        for (const module of statsJson.modules) {
          const moduleId = module.identifier || module.id || module.name;
          if (!moduleId) continue;
          
          // Check if module is used
          const isUsed = usedModules.some(used => 
            moduleId.includes(used) || used.includes(moduleId)
          );
          
          if (isUsed && module.chunks) {
            for (const chunkId of module.chunks) {
              neededChunks.add(chunkId);
            }
          }
        }
        
        // Add files from needed chunks
        for (const chunk of statsJson.chunks) {
          if (neededChunks.has(chunk.id)) {
            for (const file of chunk.files || []) {
              moduleFiles.add(file);
            }
          }
        }
      }
      
      // Split files into categories
      const initialJs = [];
      const moduleJs = [];
      const css = [];
      
      // Process initial files - these go to script tags
      for (const file of initialFiles) {
        if (file.endsWith('.js')) initialJs.push(file);
        if (file.endsWith('.css')) css.push(file);
      }
      
      // Sort initial JS files by priority: runtime -> vue -> vendor -> main -> others
      initialJs.sort((a, b) => {
        const getPriority = (file) => {
          if (file.includes('runtime')) return 1;
          if (file.includes('vue')) return 2;
          if (file.includes('vendor')) return 3;
          if (file.includes('main')) return 4;
          return 5;
        };
        return getPriority(a) - getPriority(b);
      });
      
      // Process module files - these go to modulepreload (excluding already loaded initial files)
      for (const file of moduleFiles) {
        if (file.endsWith('.js') && !initialFiles.has(file)) {
          moduleJs.push(file);
        }
        // CSS from modules should also be added if not already in initial
        if (file.endsWith('.css') && !initialFiles.has(file)) {
          css.push(file);
        }
      }
      
      const publicPath = '/';
      
      // Если включен режим критического CSS, все стили будут обработаны Beasties
      if (options.criticalCss) {
        const result = {
          head: [
            // Modulepreload для ВСЕХ initial chunks для параллельной загрузки
            ...initialJs.map(src => `<link rel="modulepreload" href="${publicPath}${src}">`),
            // Module chunks as modulepreload
            ...moduleJs.map(src => `<link rel="modulepreload" href="${publicPath}${src}">`),
            // CSS файлы будут обработаны Beasties, поэтому добавляем их как обычные link теги
            ...css.map(href => `<link rel="stylesheet" href="${publicPath}${href}">`)
          ].join('\n'),
          // Script tags в body для выполнения после загрузки
          body: initialJs.map(src => `<script type="module" src="${publicPath}${src}"></script>`).join('\n')
        };
        return result;
      }
      
      // Стандартное поведение без Beasties
      const result = {
        head: [
          // Modulepreload для ВСЕХ initial chunks для параллельной загрузки
          ...initialJs.map(src => `<link rel="modulepreload" href="${publicPath}${src}">`),
          // Module chunks as modulepreload
          ...moduleJs.map(src => `<link rel="modulepreload" href="${publicPath}${src}">`),
          ...css.map(href => `<link rel="stylesheet" href="${publicPath}${href}">`)
        ].join('\n'),
        // Script tags в body для выполнения после загрузки
        body: initialJs.map(src => `<script type="module" src="${publicPath}${src}"></script>`).join('\n')
      };
      
      return result;
    }
  };
}