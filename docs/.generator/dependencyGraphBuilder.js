import madge from 'madge';
import { promises as fs } from 'fs';
import path from 'path';
import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';

/**
 * Построитель графа зависимостей с использованием madge
 */
class DependencyGraphBuilder {
  constructor() {
    this.graph = new Graph({ type: 'directed' });
    this.fileInfoMap = new Map();
  }

  /**
   * Строит граф зависимостей из уже проанализированных файлов
   */
  async buildGraphFromAnalysis(projectStructure) {
    const allFiles = this.getAllFiles(projectStructure);
    
    // Создаем узлы для всех файлов
    for (const file of allFiles) {
      const nodeId = this.getNodeId(file);
      if (!this.graph.hasNode(nodeId)) {
        this.graph.addNode(nodeId, { 
          file: file,
          path: file.relativePath || file.path,
          imports: file.analysis?.Dependencies || []
        });
      }
    }

    // Создаем рёбра для зависимостей
    for (const file of allFiles) {
      if (!file.analysis?.Dependencies) continue;
      
      const sourceNodeId = this.getNodeId(file);
      
      for (const dep of file.analysis.Dependencies) {
        // Пытаемся найти соответствующий файл
        const targetFile = this.findDependencyFile(dep, allFiles);
        if (targetFile) {
          const targetNodeId = this.getNodeId(targetFile);
          
          // Создаем узел для цели, если его ещё нет
          if (!this.graph.hasNode(targetNodeId)) {
            this.graph.addNode(targetNodeId, { 
              file: targetFile,
              path: targetFile.relativePath || targetFile.path,
              imports: targetFile.analysis?.Dependencies || []
            });
          }
          
          // Добавляем ребро
          if (!this.graph.hasEdge(sourceNodeId, targetNodeId)) {
            this.graph.addEdge(sourceNodeId, targetNodeId, { 
              weight: 1,
              type: dep.type || 'import'
            });
          } else {
            // Увеличиваем вес, если связь уже существует
            const currentWeight = this.graph.getEdgeAttribute(sourceNodeId, targetNodeId, 'weight');
            this.graph.setEdgeAttribute(sourceNodeId, targetNodeId, 'weight', currentWeight + 1);
          }
        }
      }
    }

    return this.graph;
  }

  /**
   * Получает уникальный ID для узла
   */
  getNodeId(file) {
    // Убеждаемся что возвращаем строку
    const id = file.relativePath || file.path || file.name;
    return typeof id === 'string' ? id : String(id);
  }

  /**
   * Ищет файл зависимости в списке файлов
   */
  findDependencyFile(dep, allFiles) {
    const depPath = dep.path || dep.name || dep;
    
    // Нормализуем путь зависимости
    const normalizedDepPath = this.normalizePath(depPath);
    
    return allFiles.find(file => {
      const filePath = file.relativePath || file.path;
      const normalizedFilePath = this.normalizePath(filePath);
      
      return normalizedFilePath === normalizedDepPath || 
             normalizedFilePath.endsWith(normalizedDepPath) ||
             normalizedFilePath.includes(normalizedDepPath);
    });
  }

  /**
   * Нормализует путь файла
   */
  normalizePath(filePath) {
    return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
  }

  /**
   * Выполняет кластеризацию графа используя алгоритм Louvain
   */
  clusterGraph(maxClusterSize = 15) {
    if (this.graph.order === 0) {
      return [];
    }
    
    // Применяем алгоритм Louvain для обнаружения сообществ
    const communities = louvain(this.graph);
    
    // Группируем файлы по сообществам
    const clusters = new Map();
    
    for (const [nodeId, community] of Object.entries(communities)) {
      if (!clusters.has(community)) {
        clusters.set(community, []);
      }
      
      // Получаем файл из узла
      const file = this.graph.getNodeAttribute(nodeId, 'file');
      clusters.get(community).push(file);
    }

    // Преобразуем в массив кластеров
    const clusterArray = [];
    for (const [communityId, files] of clusters) {
      // Если кластер слишком большой, разбиваем его
      if (files.length > maxClusterSize) {
        const subClusters = this.splitLargeClusterByFiles(files, maxClusterSize, communityId);
        clusterArray.push(...subClusters);
      } else {
        clusterArray.push({
          id: `cluster-${communityId}`,
          files: files,
          size: files.length,
          type: 'community'
        });
      }
    }

    return clusterArray;
  }

  /**
   * Разбивает большой кластер на меньшие части по файлам
   */
  splitLargeClusterByFiles(files, maxSize, communityId) {
    const subClusters = [];
    
    // Простое разбиение по размеру пока что
    for (let i = 0; i < files.length; i += maxSize) {
      const chunkFiles = files.slice(i, i + maxSize);
      subClusters.push({
        id: `cluster-${communityId}-${Math.floor(i / maxSize)}`,
        files: chunkFiles,
        size: chunkFiles.length,
        type: 'split'
      });
    }

    return subClusters;
  }

  /**
   * Дополняет информацию о файлах данными из анализа
   */
  async enrichWithFileInfo(projectStructure) {
    const allFiles = this.getAllFiles(projectStructure);
    
    for (const file of allFiles) {
      const key = this.normalizeFilePath(file.relativePath || file.path);
      this.fileInfoMap.set(key, file);
    }
  }

  /**
   * Нормализует путь файла для сопоставления
   */
  normalizeFilePath(filePath) {
    // Убираем расширение и нормализуем путь
    return filePath
      .replace(/\.(js|jsx|ts|tsx|vue)$/, '')
      .replace(/\\/g, '/')
      .replace(/^\.\//, '');
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
   * Создает батчи для документации на основе кластеров
   */
  createDocumentationBatches(clusters, maxTokens = 8000) {
    const batches = [];
    
    for (const cluster of clusters) {
      // Файлы уже являются объектами, не путями
      const enrichedFiles = cluster.files;

      batches.push({
        id: cluster.id,
        files: enrichedFiles,
        type: cluster.type,
        estimatedTokens: this.estimateTokens(enrichedFiles)
      });
    }

    return batches;
  }

  /**
   * Оценивает количество токенов для батча
   */
  estimateTokens(files) {
    let totalTokens = 0;
    for (const file of files) {
      const content = file.content || '';
      // Грубая оценка: ~4 символа на токен
      totalTokens += Math.ceil(content.length / 4);
    }
    return totalTokens;
  }
}

export default DependencyGraphBuilder;