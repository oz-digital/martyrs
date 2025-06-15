import { promises } from 'fs';
import path from 'path';
import config from './config.js';
import ContextOptimizer from './contextOptimizer.js';
import DocumentMemoryManager from './documentMemoryManager.js';
import tocGenerator from './tocGenerator.js';
const fs = { promises }.promises;
/**
 * Класс для построения документации на основе оглавления и аналитики файлов
 * с использованием контекстного обучения и памяти
 */
class DocumentationBuilder {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.memoryManager = new DocumentMemoryManager(stateManager);
    this.contextOptimizer = null; // Инициализируем после memoryManager
  }
  /**
   * Инициализирует построитель документации
   */
  async initialize(logger) {
    await this.memoryManager.initialize(logger);
    this.contextOptimizer = new ContextOptimizer(this.memoryManager);
    // Если указан путь к существующим файлам документации, импортируем их
    if (config.existingDocsPath) {
      await this.importExistingDocumentation(config.existingDocsPath, logger);
    }
    return true;
  }
  /**
   * Импортирует существующие файлы документации
   */
  async importExistingDocumentation(docsPath, logger) {
    logger.info(`Импорт существующей документации из ${docsPath}`);
    return await this.memoryManager.importExistingDocumentation(docsPath, logger);
  }
  /**
   * Строит документацию на основе оглавления и анализа файлов
   */
  async buildDocumentation(tocStructure, projectStructure, logger) {
    logger.info('Начало построения документации с использованием контекстной памяти');
    // Инициализируем менеджер памяти документации
    await this.initialize(logger);
    let documentation = '';
    // Добавляем заголовок документации
    documentation += `# ${tocStructure.title}\n\n`;
    const tocInstance = new tocGenerator(this.stateManager);
    documentation += tocInstance.generateMarkdownToc(tocStructure);
    // Проходим по всем основным разделам и генерируем их содержимое
    for (const section of tocStructure.sections) {
      logger.info(`Генерация раздела: ${section.title}`);
      // Проверяем, есть ли уже раздел в памяти
      const existingContent = await this.memoryManager.getDocumentContent(section.id);
      // Собираем контекст для раздела
      const sectionFileAnalysis = this.collectRelevantFiles(section, projectStructure);
      // Генерируем контент раздела с использованием контекстного оптимизатора
      const sectionContent = await this.contextOptimizer.optimizeSectionGeneration(section, existingContent, sectionFileAnalysis, tocStructure, logger);
      // Сохраняем сгенерированный контент в память
      await this.memoryManager.saveDocumentContent(section.id, sectionContent, {
        title: section.title,
        description: section.description,
        generated: true,
        fileAnalysis: sectionFileAnalysis // Добавляем анализ файлов
      });
      // Добавляем раздел в документацию
      documentation += `\n\n## ${section.title}\n\n${sectionContent}`;
      // Обновляем статус раздела в состоянии
      await this.stateManager.saveSection(section.id, {
        title: section.title,
        content: sectionContent,
        lastUpdated: new Date().toISOString(),
      });
      // Генерируем содержимое подразделов
      if (section.subsections && section.subsections.length > 0) {
        documentation += await this.generateSubsections(section.subsections, 3, projectStructure, tocStructure, logger);
      }
      // Обновляем статус раздела
      section.metadata.status = 'completed';
      section.metadata.lastUpdated = new Date().toISOString();
    }
    // Обновляем покрытие документацией
    this.stateManager.updateCoverageMetrics();
    return documentation;
  }
  /**
   * Рекурсивно генерирует содержимое подразделов с валидацией
   */
  async generateSubsections(subsections, level, projectStructure, tocStructure, logger) {
    if (!subsections || subsections.length === 0) {
      return '';
    }
    
    let content = '';
    const headingMarker = '#'.repeat(level);
    
    for (const subsection of subsections) {
      logger.info(`Генерация подраздела уровня ${level}: ${subsection.title}`);
      
      // Проверяем, есть ли уже раздел в памяти
      const existingContent = await this.memoryManager.getDocumentContent(subsection.id);
      
      // Собираем контекст для подраздела
      const subsectionFileAnalysis = this.collectRelevantFiles(subsection, projectStructure);
      
      let subsectionContent;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        // Генерируем контент подраздела с использованием контекстного оптимизатора
        subsectionContent = await this.contextOptimizer.optimizeSectionGeneration(
          subsection, 
          existingContent, 
          subsectionFileAnalysis, 
          tocStructure, 
          logger
        );
        
        // Валидируем сгенерированный контент
        const validationResult = await this.contextOptimizer.validateGeneratedContent(
          subsectionContent,
          subsectionFileAnalysis,
          logger
        );
        
        if (validationResult.valid && validationResult.warnings.length === 0) {
          logger.info(`Контент для ${subsection.title} прошел валидацию`);
          break;
        } else if (validationResult.valid && validationResult.warnings.length > 0) {
          logger.warn(`Контент для ${subsection.title} сгенерирован с предупреждениями`);
          break;
        } else if (retryCount < maxRetries) {
          logger.warn(`Контент для ${subsection.title} не прошел валидацию, повторная генерация...`);
          
          // Добавляем информацию об ошибках в контекст для повторной генерации
          const errorContext = `
  ВНИМАНИЕ: Предыдущая попытка генерации не прошла валидацию.
  Ошибки: ${validationResult.errors.join('; ')}
  Предупреждения: ${validationResult.warnings.join('; ')}

  Пожалуйста, исправьте эти проблемы и сгенерируйте контент строго на основе анализа файлов.
  `;
          
          // Обновляем существующий контент с информацией об ошибках
          existingContent = errorContext + '\n\n' + subsectionContent;
          retryCount++;
        } else {
          logger.error(`Не удалось сгенерировать валидный контент для ${subsection.title} после ${maxRetries} попыток`);
          // Добавляем предупреждение в начало контента
          subsectionContent = `> ⚠️ Внимание: Этот раздел может содержать неточности. Требуется ручная проверка.\n\n${subsectionContent}`;
          break;
        }
      }
      
      // Сохраняем сгенерированный контент в память
      await this.memoryManager.saveDocumentContent(subsection.id, subsectionContent, {
        title: subsection.title,
        description: subsection.description,
        level,
        generated: true,
        validationPassed: retryCount === 0,
        fileAnalysisUsed: subsectionFileAnalysis.length,
        fileAnalysis: subsectionFileAnalysis // Добавляем анализ файлов
      });
      
      // Добавляем подраздел в документацию
      content += `\n\n${headingMarker} ${subsection.title}\n\n${subsectionContent}`;
      
      // Обновляем статус подраздела в состоянии
      await this.stateManager.saveSection(subsection.id, {
        title: subsection.title,
        content: subsectionContent,
        lastUpdated: new Date().toISOString(),
        validationStatus: retryCount === 0 ? 'passed' : retryCount <= maxRetries ? 'passed_with_warnings' : 'failed'
      });
      
      // Рекурсивно обрабатываем более глубокие подразделы
      if (subsection.subsections && subsection.subsections.length > 0) {
        content += await this.generateSubsections(
          subsection.subsections, 
          level + 1, 
          projectStructure, 
          tocStructure, 
          logger
        );
      }
      
      // Обновляем статус подраздела
      subsection.metadata.status = 'completed';
      subsection.metadata.lastUpdated = new Date().toISOString();
    }
    
    return content;
  }
  /**
   * Собирает релевантные файлы для раздела
   */
  collectRelevantFiles(section, projectStructure) {
    const relevantFiles = [];
    // Определяем, к какой части проекта относится раздел
    const isFramework = section.id.startsWith('framework-');
    const projectPart = isFramework ? projectStructure.framework : projectStructure.source;
    // Если раздел относится к конкретному компоненту или директории,
    // ищем соответствующие файлы
    const sectionPath = isFramework ? section.id.replace('framework-', '').split('-') : section.id.replace('project-', '').split('-');
    if (sectionPath[0]) {
      // Ищем соответствующую часть структуры проекта
      let currentLevel = projectPart;
      let found = true;
      for (const part of sectionPath) {
        if (part && currentLevel[part]) {
          currentLevel = currentLevel[part];
        } else {
          // Пробуем найти частичное соответствие
          found = false;
          for (const key in currentLevel) {
            if (key !== '_files' && typeof currentLevel[key] === 'object' && key.toLowerCase().includes(part.toLowerCase())) {
              currentLevel = currentLevel[key];
              found = true;
              break;
            }
          }
          if (!found) break;
        }
      }
      // Если нашли соответствующую часть структуры, добавляем файлы
      if (found) {
        this.collectFilesFromStructure(currentLevel, relevantFiles);
      }
    } else {
      // Если раздел общий, добавляем наиболее важные файлы верхнего уровня
      if (projectPart._files) {
        relevantFiles.push(...projectPart._files.filter(file => file.analysis && file.analysis.importance >= 4));
      }
      // Добавляем файлы из основных директорий
      for (const key in projectPart) {
        if (key !== '_files' && typeof projectPart[key] === 'object') {
          if (projectPart[key]._files) {
            relevantFiles.push(...projectPart[key]._files.filter(file => file.analysis && file.analysis.importance >= 4));
          }
        }
      }
    }
    // Преобразуем информацию о файлах в формат для API
    return relevantFiles.map(file => {
      return {
        name: file.name,
        path: file.relativePath,
        summary: file.analysis.summary || '',
        purpose: file.analysis.purpose || '',
        importance: file.analysis.importance || '3',
        components: file.analysis.components || [],
        functions: file.analysis.functions || [],
        dependencies: file.analysis.dependencies || [],
        usage: file.analysis.usage || '',
      };
    });
  }
  /**
   * Рекурсивно собирает файлы из структуры проекта
   */
  collectFilesFromStructure(structure, files) {
    // Добавляем файлы на текущем уровне
    if (structure._files) {
      files.push(...structure._files);
    }
    // Рекурсивно обходим поддиректории
    for (const key in structure) {
      if (key !== '_files' && typeof structure[key] === 'object') {
        this.collectFilesFromStructure(structure[key], files);
      }
    }
  }
  /**
   * Сохраняет документацию в файл
   */
  async saveDocumentation(documentation, outputPath, logger) {
    logger.info(`Сохранение документации в ${outputPath}`);
    try {
      // Создаем директорию для документации, если ее нет
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });
      // Записываем документацию в файл
      await fs.writeFile(outputPath, documentation, 'utf8');
      // Сохраняем метаданные о документации
      const stats = await fs.stat(outputPath);
      const metadata = {
        path: outputPath,
        size: stats.size,
        lastModified: stats.mtime,
        memoryStats: this.memoryManager.getMemoryStats(),
      };
      const metadataPath = path.join(path.dirname(outputPath), 'documentation-meta.json');
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
      logger.info('Документация успешно сохранена');
      return true;
    } catch (err) {
      logger.error(`Ошибка при сохранении документации: ${err.message}`);
      throw err;
    }
  }
}
export default DocumentationBuilder;
