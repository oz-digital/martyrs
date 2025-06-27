import { promises as fs } from 'fs';
import path from 'path';

/**
 * Анализатор зависимостей для построения графа связей между файлами
 */
class DependencyAnalyzer {
  constructor() {
    this.dependencyGraph = new Map(); // Граф зависимостей
    this.reverseDependencyGraph = new Map(); // Обратный граф (кто зависит от файла)
    this.clusters = []; // Кластеры связанных файлов
  }

  /**
   * Анализирует зависимости файлов на основе их анализа
   */
  async analyzeDependencies(projectStructure, logger) {
    logger.info('Начало анализа зависимостей файлов');
    
    const allFiles = this.getAllFiles(projectStructure);
    
    // Строим граф зависимостей
    for (const file of allFiles) {
      await this.analyzeFileDependencies(file, allFiles);
    }
    
    // Находим связные компоненты (кластеры)
    this.clusters = this.findConnectedComponents(allFiles);
    
    logger.info(`Анализ зависимостей завершен. Найдено ${this.clusters.length} кластеров`);
    
    return {
      graph: this.dependencyGraph,
      reverseGraph: this.reverseDependencyGraph,
      clusters: this.clusters
    };
  }

  /**
   * Собирает все файлы из структуры проекта
   */
  getAllFiles(projectStructure) {
    const files = [];
    
    const collectFiles = (structure) => {
      if (structure._files) {
        files.push(...structure._files);
      }
      
      for (const key in structure) {
        if (key !== '_files' && typeof structure[key] === 'object') {
          collectFiles(structure[key]);
        }
      }
    };
    
    collectFiles(projectStructure.source);
    if (projectStructure.framework) {
      collectFiles(projectStructure.framework);
    }
    
    return files;
  }

  /**
   * Анализирует зависимости конкретного файла
   */
  async analyzeFileDependencies(file, allFiles) {
    if (!file.analysis || !file.analysis.Dependencies) {
      return;
    }

    const filePath = file.relativePath || file.path;
    const dependencies = [];

    // Анализируем каждую зависимость
    for (const dep of file.analysis.Dependencies) {
      const resolvedFile = this.resolveDependency(dep, file, allFiles);
      if (resolvedFile) {
        const resolvedPath = resolvedFile.relativePath || resolvedFile.path;
        dependencies.push(resolvedPath);
        
        // Debug отключен
      }
    }

    // Сохраняем в граф
    this.dependencyGraph.set(filePath, dependencies);

    // Обновляем обратный граф
    for (const dep of dependencies) {
      if (!this.reverseDependencyGraph.has(dep)) {
        this.reverseDependencyGraph.set(dep, []);
      }
      this.reverseDependencyGraph.get(dep).push(filePath);
    }
  }

  /**
   * Разрешает зависимость в конкретный файл
   */
  resolveDependency(dependency, currentFile, allFiles) {
    // Пропускаем внешние зависимости (npm пакеты)
    if (!dependency.includes('@martyrs') && !dependency.startsWith('./') && !dependency.startsWith('../')) {
      return null;
    }

    // Обрабатываем внутренние зависимости @martyrs
    if (dependency.includes('@martyrs')) {
      const cleanPath = dependency.replace('@martyrs/src/', '');
      const segments = cleanPath.split('/');
      
      // Точное совпадение по пути
      let found = allFiles.find(f => {
        const relPath = f.relativePath || f.path.replace(/.*\/src\//, '');
        return relPath === cleanPath || 
               relPath === cleanPath + '.vue' || 
               relPath === cleanPath + '.js';
      });
      
      if (found) return found;
      
      // Поиск по сокращенному пути (убираем modules/products)
      if (segments.includes('modules')) {
        const moduleIndex = segments.indexOf('modules');
        const shortPath = segments.slice(moduleIndex + 2).join('/'); // пропускаем modules/products
        
        found = allFiles.find(f => {
          const relPath = f.relativePath || f.path.replace(/.*\/src\//, '');
          return relPath === shortPath || 
                 relPath === shortPath + '.vue' || 
                 relPath === shortPath + '.js';
        });
        
        if (found) return found;
      }
      
      // Поиск по имени файла
      const fileName = path.basename(cleanPath);
      found = allFiles.find(f => f.name === fileName || f.name === fileName + '.vue' || f.name === fileName + '.js');
      
      return found;
    }

    // Обрабатываем относительные пути
    if (dependency.startsWith('./') || dependency.startsWith('../')) {
      const currentDir = path.dirname(currentFile.path);
      const resolvedPath = path.resolve(currentDir, dependency);
      
      return allFiles.find(f => 
        f.path === resolvedPath || 
        f.path === resolvedPath + '.js' || 
        f.path === resolvedPath + '.vue' ||
        f.path.startsWith(resolvedPath)
      );
    }

    return null;
  }

  /**
   * Находит связные компоненты в графе зависимостей  
   */
  findConnectedComponents(allFiles) {
    const visited = new Set();
    const clusters = [];

    // Debug отключен для production

    for (const file of allFiles) {
      const filePath = file.relativePath || file.path;
      
      if (visited.has(filePath)) continue;

      // Используем DFS для поиска всех связанных файлов
      const cluster = [];
      this.dfsVisit(filePath, visited, cluster);

      // Создаем кластер из найденных файлов
      const clusterFiles = cluster.map(path => 
        allFiles.find(f => (f.relativePath || f.path) === path)
      ).filter(f => f !== undefined);

      if (clusterFiles.length > 0) {
        const clusterInfo = {
          id: `cluster-${clusters.length}`,
          files: clusterFiles,
          size: clusterFiles.length,
          importance: Math.max(...clusterFiles.map(f => f.analysis?.Importance || 1))
        };
        
        // Debug отключен для production
        
        clusters.push(clusterInfo);
      }
    }

    // Сортируем по важности и размеру
    clusters.sort((a, b) => {
      if (a.importance !== b.importance) {
        return b.importance - a.importance;
      }
      return b.size - a.size;
    });

    return clusters;
  }

  /**
   * Обход в глубину для поиска связных компонентов
   */
  dfsVisit(filePath, visited, cluster) {
    if (visited.has(filePath)) {
      return;
    }

    visited.add(filePath);
    cluster.push(filePath);

    // Посещаем все зависимости
    const dependencies = this.dependencyGraph.get(filePath) || [];
    for (const dep of dependencies) {
      this.dfsVisit(dep, visited, cluster);
    }

    // Посещаем все файлы, которые зависят от текущего
    const dependents = this.reverseDependencyGraph.get(filePath) || [];
    for (const dependent of dependents) {
      this.dfsVisit(dependent, visited, cluster);
    }
  }

  /**
   * Создает батчи для генерации документации
   */
  createDocumentationBatches(maxBatchSize = 12, maxTokens = 8000) {
    const batches = [];
    
    // Сначала создаем батчи из кластеров
    for (const cluster of this.clusters) {
      if (cluster.files.length <= maxBatchSize) {
        // Кластер помещается в один батч
        batches.push({
          id: `batch-${batches.length}`,
          files: cluster.files,
          clusterId: cluster.id,
          type: 'cluster',
          estimatedTokens: this.estimateTokens(cluster.files)
        });
      } else {
        // Разбиваем большой кластер на подбатчи, сохраняя связи
        const subBatches = this.splitClusterIntoBatches(
          cluster, 
          maxBatchSize, 
          maxTokens
        );
        batches.push(...subBatches);
      }
    }

    // Объединяем маленькие батчи (размером 1-2) если они не связаны
    const finalBatches = this.mergeSmallBatches(batches, maxBatchSize);

    return finalBatches;
  }

  /**
   * Объединяет маленькие кластеры в более крупные батчи
   */
  mergeSmallerClusters(clusters, maxBatchSize) {
    const merged = [];
    const small = clusters.filter(c => c.files.length <= 4); // Увеличили порог
    const medium = clusters.filter(c => c.files.length > 4 && c.files.length <= 8);
    const large = clusters.filter(c => c.files.length > 8);

    // Добавляем большие кластеры как есть
    merged.push(...large);

    // Пытаемся объединить средние кластеры с маленькими
    for (const mediumCluster of medium) {
      let combined = false;
      for (const smallCluster of small) {
        if (mediumCluster.files.length + smallCluster.files.length <= maxBatchSize) {
          // Объединяем средний с маленьким
          merged.push({
            id: `merged-${merged.length}`,
            files: [...mediumCluster.files, ...smallCluster.files],
            size: mediumCluster.files.length + smallCluster.files.length,
            importance: Math.max(mediumCluster.importance, smallCluster.importance)
          });
          
          // Удаляем использованный маленький кластер
          const index = small.indexOf(smallCluster);
          if (index > -1) small.splice(index, 1);
          combined = true;
          break;
        }
      }
      
      if (!combined) {
        merged.push(mediumCluster);
      }
    }

    // Объединяем оставшиеся маленькие кластеры
    let currentBatch = { id: 'merged-small', files: [], size: 0 };
    
    for (const cluster of small) {
      if (currentBatch.size + cluster.files.length <= maxBatchSize) {
        currentBatch.files.push(...cluster.files);
        currentBatch.size += cluster.files.length;
      } else {
        if (currentBatch.files.length > 0) {
          merged.push(currentBatch);
        }
        currentBatch = { 
          id: `merged-small-${merged.length}`, 
          files: [...cluster.files], 
          size: cluster.files.length 
        };
      }
    }

    if (currentBatch.files.length > 0) {
      merged.push(currentBatch);
    }

    return merged;
  }

  /**
   * Разбивает большой кластер на подбатчи, сохраняя связи между файлами
   */
  splitClusterIntoBatches(cluster, maxBatchSize, maxTokens) {
    const batches = [];
    const files = [...cluster.files];
    const visited = new Set();
    
    // Группируем файлы по подграфам связей для сохранения логических связей
    for (const file of files) {
      const filePath = file.relativePath || file.path;
      if (visited.has(filePath)) continue;
      
      // Собираем связанные файлы в один батч
      const batchFiles = [];
      const queue = [file];
      
      while (queue.length > 0 && batchFiles.length < maxBatchSize) {
        const currentFile = queue.shift();
        const currentPath = currentFile.relativePath || currentFile.path;
        
        if (visited.has(currentPath)) continue;
        
        visited.add(currentPath);
        batchFiles.push(currentFile);
        
        // Добавляем прямые зависимости в батч
        const deps = this.dependencyGraph.get(currentPath) || [];
        for (const dep of deps) {
          const depFile = files.find(f => (f.relativePath || f.path) === dep);
          if (depFile && !visited.has(dep) && batchFiles.length < maxBatchSize) {
            queue.push(depFile);
          }
        }
        
        // Добавляем файлы, которые зависят от текущего
        const dependents = this.reverseDependencyGraph.get(currentPath) || [];
        for (const dependent of dependents) {
          const depFile = files.find(f => (f.relativePath || f.path) === dependent);
          if (depFile && !visited.has(dependent) && batchFiles.length < maxBatchSize) {
            queue.push(depFile);
          }
        }
      }
      
      if (batchFiles.length > 0) {
        batches.push({
          id: `batch-${batches.length}`,
          files: batchFiles,
          clusterId: cluster.id,
          type: 'sub-cluster',
          estimatedTokens: this.estimateTokens(batchFiles)
        });
      }
    }

    return batches;
  }

  /**
   * Объединяет маленькие батчи в более крупные
   */
  mergeSmallBatches(batches, maxBatchSize) {
    const largeBatches = batches.filter(b => b.files.length > 2);
    const smallBatches = batches.filter(b => b.files.length <= 2);
    
    const merged = [...largeBatches];
    
    // Объединяем маленькие батчи
    let currentMerged = null;
    
    for (const batch of smallBatches) {
      if (!currentMerged) {
        currentMerged = {
          id: `merged-${merged.length}`,
          files: [...batch.files],
          clusterId: 'merged',
          type: 'merged',
          estimatedTokens: batch.estimatedTokens
        };
      } else if (currentMerged.files.length + batch.files.length <= maxBatchSize) {
        // Можем добавить в текущий объединенный батч
        currentMerged.files.push(...batch.files);
        currentMerged.estimatedTokens += batch.estimatedTokens;
      } else {
        // Текущий батч заполнен, создаем новый
        merged.push(currentMerged);
        currentMerged = {
          id: `merged-${merged.length}`,
          files: [...batch.files],
          clusterId: 'merged',
          type: 'merged',
          estimatedTokens: batch.estimatedTokens
        };
      }
    }
    
    // Добавляем последний объединенный батч
    if (currentMerged) {
      merged.push(currentMerged);
    }
    
    return merged;
  }

  /**
   * Оценивает количество токенов для файлов
   */
  estimateTokens(files) {
    return files.reduce((total, file) => total + this.estimateFileTokens(file), 0);
  }

  /**
   * Оценивает количество токенов для одного файла
   */
  estimateFileTokens(file) {
    const contentLength = (file.content || '').length;
    const analysisLength = JSON.stringify(file.analysis || {}).length;
    
    // Примерная оценка: 1 токен = 4 символа
    return Math.ceil((contentLength + analysisLength) / 4);
  }

  /**
   * Возвращает контекст для батча (связи с другими файлами)
   */
  getBatchContext(batch) {
    const context = {
      internalDependencies: [],
      externalDependencies: [],
      dependents: []
    };

    const batchPaths = new Set(batch.files.map(f => f.relativePath || f.path));

    for (const file of batch.files) {
      const filePath = file.relativePath || file.path;
      
      // Внутренние зависимости (в рамках батча)
      const deps = this.dependencyGraph.get(filePath) || [];
      for (const dep of deps) {
        if (batchPaths.has(dep)) {
          context.internalDependencies.push({ from: filePath, to: dep });
        } else {
          context.externalDependencies.push({ from: filePath, to: dep });
        }
      }

      // Зависимые файлы
      const dependents = this.reverseDependencyGraph.get(filePath) || [];
      for (const dependent of dependents) {
        if (!batchPaths.has(dependent)) {
          context.dependents.push({ file: filePath, dependent });
        }
      }
    }

    return context;
  }
}

export default DependencyAnalyzer;