import crypto from 'crypto';
import { promises } from 'fs';
import path from 'path';
// doc-generator/stateManager.js
const fs = { promises }.promises;

/**
 * Класс для управления состоянием документации и аналитики файлов
 */
class DocumentationStateManager {
  constructor(baseDir = '.doc-state') {
    this.baseDir = path.join(process.cwd(), baseDir);
    this.stateFile = path.join(this.baseDir, 'state.json');
    this.analysisDir = path.join(this.baseDir, 'analysis');
    this.structureFile = path.join(this.baseDir, 'structure.json');
    this.tocFile = path.join(this.baseDir, 'toc.json'); // Файл для хранения TOC
    this.documentationState = null;
  }

  /**
   * Инициализирует менеджер состояния, создавая необходимые директории
   */
  async initialize(logger) {
    logger.info('Инициализация менеджера состояния документации');
    try {
      // Создаем базовые директории
      await fs.mkdir(this.baseDir, { recursive: true });
      await fs.mkdir(this.analysisDir, { recursive: true });
      
      // Проверяем существование основного файла состояния
      try {
        const stateContent = await fs.readFile(this.stateFile, 'utf8');
        this.documentationState = JSON.parse(stateContent);
        logger.info('Загружено существующее состояние документации');
      } catch (err) {
        // Создаем начальное состояние
        this.documentationState = {
          version: 1,
          lastUpdated: new Date().toISOString(),
          filesAnalyzed: 0,
          totalFiles: 0,
          projectStructure: null,
          tocGenerated: false,
          tocHash: null, // Хеш для проверки изменений
          filesHashOnTocGeneration: null, // Хеш всех файлов при генерации TOC
          coverage: {
            framework: 0,
            source: 0,
            total: 0,
          },
          analyzedFiles: {},
          sections: {},
          tocGenerationProgress: null, // Прогресс генерации TOC
        };
        await this.saveState();
        logger.info('Создано новое состояние документации');
      }
      return this;
    } catch (err) {
      logger.error(`Ошибка при инициализации менеджера состояния: ${err.message}`);
      throw err;
    }
  }

  /**
   * Сохраняет текущее состояние
   */
  async saveState() {
    this.documentationState.lastUpdated = new Date().toISOString();
    await fs.writeFile(this.stateFile, JSON.stringify(this.documentationState, null, 2), 'utf8');
    return true;
  }

  /**
   * Проверяет, нужно ли анализировать файл, или можно использовать кэш
   */
  async shouldAnalyzeFile(file, logger) {
    // Вычисляем хеш содержимого файла
    const fileHash = crypto.createHash('md5').update(file.content).digest('hex');
    const fileId = this.getFileId(file);
    
    // Проверяем, есть ли файл в кэше и совпадает ли хеш
    if (this.documentationState.analyzedFiles[fileId]) {
      const cachedInfo = this.documentationState.analyzedFiles[fileId];
      if (cachedInfo.hash === fileHash) {
        logger.info(`Используем кэшированный анализ для ${file.relativePath}`);
        return {
          shouldAnalyze: false,
          cachedAnalysis: await this.getAnalysisFromCache(fileId),
        };
      }
    }
    
    // Файл новый или изменился - его надо анализировать
    return {
      shouldAnalyze: true,
      cachedAnalysis: null,
    };
  }

  /**
   * Сохраняет результат анализа файла
   */
  async saveFileAnalysis(file, analysis) {
    const fileHash = crypto.createHash('md5').update(file.content).digest('hex');
    const fileId = this.getFileId(file);
    
    // Записываем в кэш
    const analysisFilePath = path.join(this.analysisDir, `${fileId}.json`);
    await fs.writeFile(analysisFilePath, JSON.stringify(analysis, null, 2), 'utf8');
    
    // Обновляем состояние
    this.documentationState.analyzedFiles[fileId] = {
      path: file.relativePath,
      type: file.type,
      hash: fileHash,
      lastAnalyzed: new Date().toISOString(),
      hasAnalysis: true,
    };
    
    await this.saveState();
    return true;
  }

  /**
   * Получает результат анализа из кэша
   */
  async getAnalysisFromCache(fileId) {
    const analysisFilePath = path.join(this.analysisDir, `${fileId}.json`);
    try {
      const analysisContent = await fs.readFile(analysisFilePath, 'utf8');
      return JSON.parse(analysisContent);
    } catch (err) {
      throw new Error(`Не удалось загрузить кэшированный анализ для ${fileId}: ${err.message}`);
    }
  }

  /**
   * Сохраняет структуру проекта
   */
  async saveProjectStructure(structure) {
    await fs.writeFile(this.structureFile, JSON.stringify(structure, null, 2), 'utf8');
    this.documentationState.projectStructure = structure;
    this.documentationState.totalFiles = this.countFilesInStructure(structure);
    await this.saveState();
    return true;
  }

  /**
   * Проверяет, изменились ли файлы с момента последней генерации TOC
   */
  async hasFilesChangedSinceTocGeneration() {
    if (!this.documentationState.filesHashOnTocGeneration) {
      return true; // TOC еще не генерировался
    }
    
    // Вычисляем текущий хеш всех файлов
    const currentFilesHash = this.calculateAllFilesHash();
    
    // Сравниваем с хешем при последней генерации TOC
    return currentFilesHash !== this.documentationState.filesHashOnTocGeneration;
  }

  /**
   * Вычисляет общий хеш всех проанализированных файлов
   */
  calculateAllFilesHash() {
    const fileHashes = Object.entries(this.documentationState.analyzedFiles)
      .sort(([a], [b]) => a.localeCompare(b)) // Сортируем для стабильности
      .map(([_, info]) => info.hash)
      .join('');
    
    return crypto.createHash('md5').update(fileHashes).digest('hex');
  }

  /**
   * Сохраняет сгенерированный TOC
   */
  async saveToc(tocStructure, logger) {
    logger.info('Сохранение TOC в кеш');
    
    // Сохраняем TOC в отдельный файл
    await fs.writeFile(this.tocFile, JSON.stringify(tocStructure, null, 2), 'utf8');
    
    // Вычисляем хеш TOC
    const tocHash = crypto.createHash('md5').update(JSON.stringify(tocStructure)).digest('hex');
    
    // Обновляем состояние
    this.documentationState.tocGenerated = true;
    this.documentationState.tocHash = tocHash;
    this.documentationState.filesHashOnTocGeneration = this.calculateAllFilesHash();
    this.documentationState.tocGenerationProgress = null; // Очищаем прогресс после завершения
    
    // Сохраняем в sections для совместимости
    await this.saveSection('toc', {
      structure: tocStructure,
      generated: true,
      hash: tocHash,
    });
    
    await this.saveState();
    logger.info('TOC успешно сохранен в кеш');
    return true;
  }

  /**
   * Загружает сохраненный TOC из кеша
   */
  async loadCachedToc(logger) {
    try {
      // Проверяем, есть ли сохраненный TOC
      if (!this.documentationState.tocGenerated || !this.documentationState.tocHash) {
        logger.info('Сохраненный TOC не найден');
        return null;
      }
      
      // Проверяем, изменились ли файлы
      if (await this.hasFilesChangedSinceTocGeneration()) {
        logger.info('Файлы изменились с момента последней генерации TOC');
        return null;
      }
      
      // Загружаем TOC из файла
      const tocContent = await fs.readFile(this.tocFile, 'utf8');
      const tocStructure = JSON.parse(tocContent);
      
      // Проверяем хеш
      const loadedTocHash = crypto.createHash('md5').update(JSON.stringify(tocStructure)).digest('hex');
      if (loadedTocHash !== this.documentationState.tocHash) {
        logger.warn('Хеш загруженного TOC не совпадает с сохраненным');
        return null;
      }
      
      logger.info('TOC успешно загружен из кеша');
      return tocStructure;
      
    } catch (err) {
      logger.error(`Ошибка при загрузке TOC из кеша: ${err.message}`);
      return null;
    }
  }

  /**
   * Сохраняет прогресс генерации TOC
   */
  async saveTocGenerationProgress(progress) {
    this.documentationState.tocGenerationProgress = {
      ...progress,
      lastUpdated: new Date().toISOString(),
    };
    await this.saveState();
  }

  /**
   * Получает прогресс генерации TOC
   */
  getTocGenerationProgress() {
    return this.documentationState.tocGenerationProgress;
  }

  /**
   * Подсчитывает количество файлов в структуре
   */
  countFilesInStructure(structure) {
    let count = 0;
    // Считаем файлы во фреймворке
    if (structure.framework) {
      count += this.countFilesInSection(structure.framework);
    }
    // Считаем файлы в проекте
    if (structure.source) {
      count += this.countFilesInSection(structure.source);
    }
    return count;
  }

  /**
   * Подсчитывает количество файлов в секции
   */
  countFilesInSection(section) {
    let count = 0;
    if (section._files) {
      count += section._files.length;
    }
    // Рекурсивно обходим все поддиректории
    for (const key in section) {
      if (key !== '_files' && typeof section[key] === 'object') {
        count += this.countFilesInSection(section[key]);
      }
    }
    return count;
  }

  /**
   * Отмечает файл как обработанный и обновляет метрики покрытия
   */
  async markFileAsDocumented(fileId, sectionType) {
    if (this.documentationState.analyzedFiles[fileId]) {
      this.documentationState.analyzedFiles[fileId].documented = true;
      this.documentationState.filesAnalyzed++;
      // Обновляем метрики покрытия
      this.updateCoverageMetrics();
      await this.saveState();
      return true;
    }
    return false;
  }

  /**
   * Обновляет метрики покрытия документацией
   */
  updateCoverageMetrics() {
    let frameworkTotal = 0;
    let frameworkDocumented = 0;
    let sourceTotal = 0;
    let sourceDocumented = 0;
    
    for (const fileId in this.documentationState.analyzedFiles) {
      const file = this.documentationState.analyzedFiles[fileId];
      if (file.type === 'framework') {
        frameworkTotal++;
        if (file.documented) frameworkDocumented++;
      } else if (file.type === 'source') {
        sourceTotal++;
        if (file.documented) sourceDocumented++;
      }
    }
    
    this.documentationState.coverage = {
      framework: frameworkTotal > 0 ? Math.round((frameworkDocumented / frameworkTotal) * 100) : 0,
      source: sourceTotal > 0 ? Math.round((sourceDocumented / sourceTotal) * 100) : 0,
      total: frameworkTotal + sourceTotal > 0 ? Math.round(((frameworkDocumented + sourceDocumented) / (frameworkTotal + sourceTotal)) * 100) : 0,
    };
  }

  /**
   * Отмечает, что оглавление сгенерировано
   */
  async markTocAsGenerated() {
    this.documentationState.tocGenerated = true;
    await this.saveState();
    return true;
  }

  /**
   * Сохраняет информацию о разделе документации
   */
  async saveSection(sectionId, sectionInfo) {
    this.documentationState.sections[sectionId] = {
      ...sectionInfo,
      lastUpdated: new Date().toISOString(),
    };
    await this.saveState();
    return true;
  }

  /**
   * Сбрасывает всё состояние документации для перезапуска с нуля
   */
  async resetState(logger) {
    logger.info('Сброс состояния документации');
    try {
      // Удаляем все файлы анализа
      const files = await fs.readdir(this.analysisDir);
      for (const file of files) {
        await fs.unlink(path.join(this.analysisDir, file));
      }
      
      // Удаляем файл TOC
      try {
        await fs.unlink(this.tocFile);
      } catch (err) {
        // Файл может не существовать
      }
      
      // Сбрасываем состояние
      this.documentationState = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        filesAnalyzed: 0,
        totalFiles: 0,
        projectStructure: null,
        tocGenerated: false,
        tocHash: null,
        filesHashOnTocGeneration: null,
        coverage: {
          framework: 0,
          source: 0,
          total: 0,
        },
        analyzedFiles: {},
        sections: {},
        tocGenerationProgress: null,
      };
      await this.saveState();
      logger.info('Состояние документации сброшено');
      return true;
    } catch (err) {
      logger.error(`Ошибка при сбросе состояния: ${err.message}`);
      throw err;
    }
  }

  /**
   * Возвращает статистику о текущем состоянии документации
   */
  getDocumentationStats() {
    return {
      lastUpdated: this.documentationState.lastUpdated,
      totalFiles: this.documentationState.totalFiles,
      filesAnalyzed: this.documentationState.filesAnalyzed,
      tocGenerated: this.documentationState.tocGenerated,
      coverage: this.documentationState.coverage,
    };
  }

  /**
   * Получает уникальный ID файла для хранения в кэше
   */
  getFileId(file) {
    return file.relativePath.replace(/[\/\\:]/g, '_');
  }
}

export default DocumentationStateManager;