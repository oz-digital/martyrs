import { promises as fs } from 'fs';
import path from 'path';
import ContextOptimizer from './contextOptimizer.js';
import DependencyAnalyzer from './dependencyAnalyzer.js';

/**
 * Генератор документации на основе батчей из графа зависимостей
 */
class BatchDocumentationGenerator {
  constructor(stateManager, memoryManager) {
    this.stateManager = stateManager;
    this.memoryManager = memoryManager;
    this.dependencyAnalyzer = new DependencyAnalyzer();
    this.contextOptimizer = new ContextOptimizer(memoryManager);
    this.generatedDocs = new Map(); // Кэш сгенерированной документации
  }

  /**
   * Главный метод генерации документации на основе зависимостей
   */
  async generateDocumentation(projectStructure, outputDir, logger) {
    logger.info('Запуск генерации документации на основе анализа зависимостей');

    // 1. Анализируем зависимости и строим граф
    const dependencyAnalysis = await this.dependencyAnalyzer.analyzeDependencies(projectStructure, logger);
    
    // 2. Создаем или загружаем батчи для генерации
    const batchCachePath = path.join(outputDir, '.batch-cache.json');
    let batches = await this.loadOrCreateBatches(batchCachePath, dependencyAnalysis, logger);
    logger.info(`Создано ${batches.length} батчей для генерации`);
    
    // Выводим список всех батчей
    logger.info('Запланированные батчи:');
    batches.forEach((batch, index) => {
      const fileNames = batch.files.map(f => f.name).join(', ');
      logger.info(`  Батч ${index + 1}: ${batch.files.length} файлов - ${fileNames}`);
      
      // Debug для EditVariants.vue и variants.store.js
      if (fileNames.includes('EditVariants.vue') && fileNames.includes('variants.store.js')) {
        logger.info(`  [DEBUG] EditVariants.vue и variants.store.js в одном батче!`);
      } else if (fileNames.includes('EditVariants.vue')) {
        logger.info(`  [DEBUG] EditVariants.vue без variants.store.js`);
      } else if (fileNames.includes('variants.store.js')) {
        logger.info(`  [DEBUG] variants.store.js без EditVariants.vue`);
      }
    });

    // 3. Генерируем документацию для каждого батча
    const batchResults = [];
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const fileNames = batch.files.map(f => f.name).join(', ');
      logger.info(`Обработка батча ${i + 1}/${batches.length}: ${batch.id} (${batch.files.length} файлов: ${fileNames})`);
      
      // Проверяем, есть ли уже результат для этого батча
      if (batch.completed) {
        logger.info(`Батч ${batch.id} уже обработан, пропускаем`);
        batchResults.push(batch.result);
        continue;
      }
      
      const result = await this.generateBatchDocumentation(batch, dependencyAnalysis, logger);
      batchResults.push(result);
      
      // Сохраняем прогресс
      batch.completed = true;
      batch.result = result;
      await this.saveBatchProgress(batchCachePath, batches, logger);
      
      // Короткая пауза между запросами к API
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // 4. Анализируем и объединяем результаты
    const finalDocumentation = await this.analyzeAndMergeResults(batchResults, dependencyAnalysis, logger);

    // 5. Сохраняем документацию
    await this.saveDocumentation(finalDocumentation, outputDir, logger);

    return finalDocumentation;
  }

  /**
   * Генерирует документацию для одного батча
   */
  async generateBatchDocumentation(batch, dependencyAnalysis, logger) {
    try {
      // Получаем контекст батча
      const context = this.dependencyAnalyzer.getBatchContext(batch);
      
      // Подготавливаем данные для генерации
      const batchData = {
        files: batch.files,
        context: context,
        clusterId: batch.clusterId,
        type: batch.type
      };

      // Создаем промпт с учетом зависимостей
      const prompt = this.createBatchPrompt(batchData);
      
      // Генерируем документацию через ContextOptimizer
      const documentation = await this.contextOptimizer.generateDocumentationForBatch(
        batchData.files,
        prompt,
        logger
      );

      // Валидируем результат
      const validatedDoc = await this.validateBatchResult(documentation, batchData, logger);

      return {
        batchId: batch.id,
        clusterId: batch.clusterId,
        files: batch.files,
        documentation: validatedDoc,
        context: context,
        metadata: {
          filesCount: batch.files.length,
          estimatedTokens: batch.estimatedTokens,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error(`Ошибка при генерации документации для батча ${batch.id}: ${error.message}`);
      
      // Возвращаем fallback документацию на основе анализа файлов
      return {
        batchId: batch.id,
        clusterId: batch.clusterId,
        files: batch.files,
        documentation: this.createFallbackDocumentation(batch.files),
        context: this.dependencyAnalyzer.getBatchContext(batch),
        metadata: {
          filesCount: batch.files.length,
          estimatedTokens: batch.estimatedTokens,
          generatedAt: new Date().toISOString(),
          fallback: true,
          error: error.message
        }
      };
    }
  }

  /**
   * Создает промпт для батча с учетом контекста зависимостей
   */
  createBatchPrompt(batchData) {
    const { files, context } = batchData;
    
    let prompt = `Ты анализируешь группу взаимосвязанных файлов проекта. 

КОНТЕКСТ ЗАВИСИМОСТЕЙ:`;

    if (context.internalDependencies.length > 0) {
      prompt += `\nВнутренние связи в группе:`;
      context.internalDependencies.forEach(dep => {
        prompt += `\n- ${dep.from} → ${dep.to}`;
      });
    }

    if (context.externalDependencies.length > 0) {
      prompt += `\nВнешние зависимости:`;
      context.externalDependencies.slice(0, 10).forEach(dep => {
        prompt += `\n- ${dep.from} использует ${dep.to}`;
      });
    }

    if (context.dependents.length > 0) {
      prompt += `\nИспользуется в других файлах:`;
      context.dependents.slice(0, 10).forEach(dep => {
        prompt += `\n- ${dep.file} используется в ${dep.dependent}`;
      });
    }

    prompt += `

ФАЙЛЫ ДЛЯ АНАЛИЗА (${files.length} файлов):
${files.map(f => `- ${f.name}: ${f.analysis?.Summary || 'Файл требует анализа'}`).join('\n')}

ЗАДАЧА:
Создай документацию для этой группы файлов, учитывая их взаимосвязи. 

ТРЕБОВАНИЯ:
1. Используй ТОЛЬКО информацию из предоставленного анализа файлов
2. НЕ придумывай компоненты или функции, которых нет в анализе
3. Опиши архитектуру с учетом реальных зависимостей
4. Покажи, как файлы взаимодействуют друг с другом
5. Приведи примеры использования на основе реального кода

СТРУКТУРА ОТВЕТА:
## Обзор группы
## Архитектура и взаимодействие
## Ключевые компоненты
## Примеры использования
## Зависимости

Отвечай на русском языке.`;

    return prompt;
  }

  /**
   * Валидирует результат генерации батча
   */
  async validateBatchResult(documentation, batchData, logger) {
    try {
      // Проверяем на галлюцинации
      const validation = await this.contextOptimizer.validateGeneratedContent(
        documentation, 
        batchData.files, 
        logger
      );

      if (!validation.valid) {
        logger.warn(`Найдены проблемы в документации батча: ${validation.errors.concat(validation.warnings).join(', ')}`);
        
        // Создаем исправленную версию на основе анализа
        return this.createFallbackDocumentation(batchData.files);
      }

      return documentation;
    } catch (error) {
      logger.warn(`Ошибка валидации документации батча: ${error.message}`);
      // В случае ошибки валидации возвращаем оригинальную документацию
      return documentation;
    }
  }

  /**
   * Создает fallback документацию на основе анализа файлов
   */
  createFallbackDocumentation(files) {
    let content = `## Обзор группы\n\n`;
    content += `Группа содержит ${files.length} взаимосвязанных файлов:\n\n`;

    files.forEach(file => {
      const summary = file.analysis?.Summary || 'Анализ не завершен';
      content += `- **${file.name}**: ${summary}\n`;
    });

    content += `\n## Архитектура и взаимодействие\n\n`;

    files.forEach(file => {
      if (!file.analysis) return;

      content += `### ${file.name}\n\n`;
      
      if (file.analysis.Purpose) {
        content += `**Назначение**: ${file.analysis.Purpose}\n\n`;
      }

      if (file.analysis.Components && file.analysis.Components.length > 0) {
        content += `**Компоненты**:\n`;
        file.analysis.Components.forEach(comp => {
          content += `- ${comp.name}: ${comp.responsibility || comp.description || ''}\n`;
        });
        content += `\n`;
      }

      if (file.analysis.Functions && file.analysis.Functions.length > 0) {
        content += `**Функции**:\n`;
        file.analysis.Functions.forEach(func => {
          content += `- ${func.name}: ${func.purpose || func.description || ''}\n`;
        });
        content += `\n`;
      }
    });

    // Зависимости
    content += `\n## Зависимости\n\n`;
    const allDeps = new Set();
    
    files.forEach(file => {
      if (file.analysis?.Dependencies) {
        file.analysis.Dependencies.forEach(dep => allDeps.add(dep));
      }
    });

    if (allDeps.size > 0) {
      Array.from(allDeps).sort().forEach(dep => {
        content += `- ${dep}\n`;
      });
    } else {
      content += `Зависимости не найдены или не проанализированы.\n`;
    }

    return content;
  }

  /**
   * Анализирует и объединяет результаты всех батчей
   */
  async analyzeAndMergeResults(batchResults, dependencyAnalysis, logger) {
    logger.info('Анализ и объединение результатов батчей');

    // Группируем результаты по кластерам
    const clusterResults = new Map();
    
    batchResults.forEach(result => {
      if (!clusterResults.has(result.clusterId)) {
        clusterResults.set(result.clusterId, []);
      }
      clusterResults.get(result.clusterId).push(result);
    });

    // Создаем итоговую документацию
    const sections = [];

    // Добавляем обзор проекта
    sections.push({
      id: 'overview',
      title: 'Обзор проекта',
      content: this.generateProjectOverview(dependencyAnalysis, batchResults)
    });

    // Добавляем документацию по кластерам
    for (const [clusterId, results] of clusterResults) {
      const cluster = dependencyAnalysis.clusters.find(c => c.id === clusterId);
      if (!cluster) continue;

      const section = {
        id: clusterId,
        title: `Модуль: ${this.getClusterTitle(cluster)}`,
        content: this.mergeClusterResults(results),
        files: cluster.files
      };

      sections.push(section);
    }

    return {
      title: 'Документация проекта',
      sections: sections,
      metadata: {
        clustersCount: dependencyAnalysis.clusters.length,
        batchesCount: batchResults.length,
        totalFiles: batchResults.reduce((total, r) => total + r.files.length, 0),
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Генерирует обзор проекта
   */
  generateProjectOverview(dependencyAnalysis, batchResults) {
    const totalFiles = batchResults.reduce((total, r) => total + r.files.length, 0);
    
    let content = `## Архитектура проекта\n\n`;
    content += `Проект состоит из ${totalFiles} файлов, организованных в ${dependencyAnalysis.clusters.length} логических модулей.\n\n`;
    
    content += `### Модули проекта\n\n`;
    dependencyAnalysis.clusters.forEach((cluster, index) => {
      content += `${index + 1}. **${this.getClusterTitle(cluster)}** (${cluster.files.length} файлов)\n`;
    });

    content += `\n### Граф зависимостей\n\n`;
    content += `Проект имеет ${dependencyAnalysis.graph.size} файлов с зависимостями.\n`;
    
    return content;
  }

  /**
   * Получает название кластера на основе его файлов
   */
  getClusterTitle(cluster) {
    const paths = cluster.files.map(f => f.relativePath || f.path);
    
    // Определяем общий путь
    const commonPath = this.findCommonPath(paths);
    if (commonPath) {
      return commonPath.replace(/\//g, ' / ').replace(/([a-z])([A-Z])/g, '$1 $2');
    }
    
    // Определяем по типу файлов
    const extensions = new Set(cluster.files.map(f => path.extname(f.name)));
    if (extensions.has('.vue')) {
      return 'Vue компоненты';
    } else if (extensions.has('.js')) {
      return 'JavaScript модули';
    }
    
    return `Модуль ${cluster.id}`;
  }

  /**
   * Находит общий путь для группы файлов
   */
  findCommonPath(paths) {
    if (paths.length === 0) return '';
    
    const parts = paths[0].split('/');
    let commonParts = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const allHavePart = paths.every(p => p.split('/')[i] === part);
      
      if (allHavePart) {
        commonParts.push(part);
      } else {
        break;
      }
    }
    
    return commonParts.join('/');
  }

  /**
   * Объединяет результаты одного кластера
   */
  mergeClusterResults(results) {
    if (results.length === 1) {
      return results[0].documentation;
    }

    // Объединяем документацию из нескольких батчей одного кластера
    let content = `## Обзор модуля\n\n`;
    content += `Модуль состоит из ${results.reduce((total, r) => total + r.files.length, 0)} файлов, `;
    content += `разбитых на ${results.length} группы для анализа.\n\n`;

    results.forEach((result, index) => {
      content += `### Группа ${index + 1}\n\n`;
      content += result.documentation + '\n\n';
    });

    return content;
  }

  /**
   * Сохраняет сгенерированную документацию
   */
  async saveDocumentation(documentation, outputDir, logger) {
    logger.info('Сохранение сгенерированной документации');

    // Создаем директории
    await fs.mkdir(outputDir, { recursive: true });
    const sectionsDir = path.join(outputDir, 'sections');
    await fs.mkdir(sectionsDir, { recursive: true });

    // Сохраняем каждую секцию в отдельный файл
    const sectionLinks = [];
    
    for (const section of documentation.sections) {
      const sectionFile = `${section.id}.md`;
      const sectionPath = path.join(sectionsDir, sectionFile);
      
      const sectionContent = `# ${section.title}\n\n${section.content}`;
      await fs.writeFile(sectionPath, sectionContent, 'utf8');
      
      sectionLinks.push(`- [${section.title}](./sections/${sectionFile})`);
      
      logger.info(`Сохранена секция: ${section.title}`);
    }

    // Создаем основной файл документации
    let mainContent = `# ${documentation.title}\n\n`;
    mainContent += `## Оглавление\n\n`;
    mainContent += sectionLinks.join('\n') + '\n\n';
    
    // Добавляем краткие обзоры секций
    for (const section of documentation.sections) {
      mainContent += `## ${section.title}\n\n`;
      mainContent += `> [Подробная документация](./sections/${section.id}.md)\n\n`;
      
      // Добавляем краткий обзор (первые 300 символов)
      const preview = section.content.substring(0, 300);
      mainContent += preview + (section.content.length > 300 ? '...\n\n' : '\n\n');
    }

    // Сохраняем основной файл
    const mainPath = path.join(outputDir, 'documentation.md');
    await fs.writeFile(mainPath, mainContent, 'utf8');

    // Сохраняем метаданные
    const metadataPath = path.join(outputDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(documentation.metadata, null, 2), 'utf8');

    logger.info('Документация успешно сохранена');
  }

  /**
   * Загружает существующие батчи или создает новые
   */
  async loadOrCreateBatches(batchCachePath, dependencyAnalysis, logger) {
    try {
      // Пытаемся загрузить существующий кэш
      if (await this.fileExists(batchCachePath)) {
        const cachedData = JSON.parse(await fs.readFile(batchCachePath, 'utf8'));
        logger.info(`Загружено ${cachedData.batches.length} батчей из кэша`);
        
        // Восстанавливаем объекты файлов из кэша
        const allFiles = [];
        dependencyAnalysis.clusters.forEach(cluster => {
          allFiles.push(...cluster.files);
        });
        
        cachedData.batches.forEach(batch => {
          batch.files = batch.fileIds.map(fileId => 
            allFiles.find(f => (f.relativePath || f.path) === fileId)
          ).filter(f => f);
        });
        
        return cachedData.batches;
      }
    } catch (error) {
      logger.warn(`Ошибка загрузки кэша батчей: ${error.message}`);
    }

    // Создаем новые батчи
    const batches = this.dependencyAnalyzer.createDocumentationBatches();
    
    // Добавляем метаданные для кэширования
    batches.forEach(batch => {
      batch.completed = false;
      batch.result = null;
      batch.fileIds = batch.files.map(f => f.relativePath || f.path);
    });

    await this.saveBatchProgress(batchCachePath, batches, logger);
    return batches;
  }

  /**
   * Сохраняет прогресс обработки батчей
   */
  async saveBatchProgress(batchCachePath, batches, logger) {
    try {
      const cacheData = {
        timestamp: new Date().toISOString(),
        batches: batches.map(batch => ({
          id: batch.id,
          clusterId: batch.clusterId,
          type: batch.type,
          fileIds: batch.fileIds,
          completed: batch.completed,
          result: batch.result,
          estimatedTokens: batch.estimatedTokens
        }))
      };
      
      await fs.writeFile(batchCachePath, JSON.stringify(cacheData, null, 2), 'utf8');
    } catch (error) {
      logger.warn(`Ошибка сохранения прогресса батчей: ${error.message}`);
    }
  }

  /**
   * Проверяет существование файла
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

export default BatchDocumentationGenerator;