import { promises } from 'fs';
import path from 'path';
import config from './config.js';
import ContextOptimizer from './contextOptimizer.js';
import DocumentMemoryManager from './documentMemoryManager.js';
import tocGenerator from './tocGenerator.js';
import BatchDocumentationGenerator from './batchDocumentationGenerator.js';
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
   * Строит документацию на основе анализа зависимостей (новый подход)
   */
  async buildDocumentationFromDependencies(projectStructure, logger) {
    logger.info('Запуск генерации документации на основе анализа зависимостей');
    
    // Инициализируем менеджер памяти документации
    await this.initialize(logger);
    
    // Создаем генератор на основе батчей
    const batchGenerator = new BatchDocumentationGenerator(this.stateManager, this.memoryManager);
    
    // Генерируем документацию
    const outputDir = path.dirname(config.outputPath);
    const documentation = await batchGenerator.generateDocumentation(projectStructure, outputDir, logger);
    
    // Возвращаем основное содержимое для совместимости
    return this.createMainDocumentationContent(documentation);
  }

  /**
   * Создает основное содержимое документации для совместимости
   */
  createMainDocumentationContent(documentation) {
    let content = `# ${documentation.title}\n\n`;
    
    content += `## Оглавление\n\n`;
    documentation.sections.forEach(section => {
      content += `- [${section.title}](./sections/${section.id}.md)\n`;
    });
    content += `\n`;
    
    // Добавляем обзоры секций
    documentation.sections.forEach(section => {
      content += `## ${section.title}\n\n`;
      content += `> [Подробная документация](./sections/${section.id}.md)\n\n`;
      
      // Краткий обзор
      const preview = section.content.substring(0, 300);
      content += preview + (section.content.length > 300 ? '...\n\n' : '\n\n');
    });
    
    return content;
  }

  /**
   * Строит документацию на основе оглавления и анализа файлов (старый подход)
   */
  async buildDocumentation(tocStructure, projectStructure, logger) {
    logger.info('Начало построения документации с использованием контекстной памяти');
    // Инициализируем менеджер памяти документации
    await this.initialize(logger);
    
    // Создаем директорию для документации
    const docsOutputDir = path.join(path.dirname(config.outputPath), 'sections');
    await fs.mkdir(docsOutputDir, { recursive: true });
    
    let mainDocumentation = '';
    // Добавляем заголовок документации
    mainDocumentation += `# ${tocStructure.title}\n\n`;
    const tocInstance = new tocGenerator(this.stateManager);
    mainDocumentation += tocInstance.generateMarkdownToc(tocStructure);
    
    // Проходим по всем основным разделам и генерируем их содержимое
    for (const section of tocStructure.sections) {
      logger.info(`Генерация раздела: ${section.title}`);
      
      // Собираем контекст для раздела
      const sectionFileAnalysis = await this.collectRelevantFiles(section, projectStructure);
      
      // Генерируем контент раздела с использованием реального анализа
      const sectionContent = await this.generateSectionFromAnalysis(section, sectionFileAnalysis, tocStructure, logger);
      
      // Сохраняем раздел в отдельный файл
      const sectionFileName = `${section.id}.md`;
      const sectionFilePath = path.join(docsOutputDir, sectionFileName);
      
      const fullSectionContent = `# ${section.title}\n\n${sectionContent}`;
      await fs.writeFile(sectionFilePath, fullSectionContent, 'utf8');
      logger.info(`Раздел ${section.title} сохранен в ${sectionFileName}`);
      
      // Сохраняем сгенерированный контент в память
      await this.memoryManager.saveDocumentContent(section.id, sectionContent, {
        title: section.title,
        description: section.description,
        generated: true,
        fileAnalysis: sectionFileAnalysis,
        filePath: sectionFilePath
      });
      
      // Добавляем ссылку на раздел в основную документацию
      mainDocumentation += `\n\n## ${section.title}\n\n`;
      mainDocumentation += `> [Подробная документация: ${section.title}](./sections/${sectionFileName})\n\n`;
      mainDocumentation += sectionContent.substring(0, 500) + (sectionContent.length > 500 ? '...\n\n[Читать полностью](./sections/' + sectionFileName + ')' : '');
      
      // Обновляем статус раздела в состоянии
      await this.stateManager.saveSection(section.id, {
        title: section.title,
        content: sectionContent,
        filePath: sectionFilePath,
        lastUpdated: new Date().toISOString(),
      });
      
      // Генерируем содержимое подразделов
      if (section.subsections && section.subsections.length > 0) {
        const subsectionsContent = await this.generateSubsections(section.subsections, 3, projectStructure, tocStructure, logger, docsOutputDir, section.id);
        
        // Добавляем подразделы в основную документацию
        mainDocumentation += `\n\n### Подразделы:\n\n${subsectionsContent.summary}`;
      }
      
      // Обновляем статус раздела
      section.metadata.status = 'completed';
      section.metadata.lastUpdated = new Date().toISOString();
    }
    
    // Обновляем покрытие документацией
    this.stateManager.updateCoverageMetrics();
    return mainDocumentation;
  }
  
  /**
   * Генерирует раздел документации на основе реального анализа файлов
   */
  async generateSectionFromAnalysis(section, fileAnalysis, tocStructure, logger) {
    if (!fileAnalysis || fileAnalysis.length === 0) {
      return `## Обзор\n\nФайлы для данного раздела не найдены или еще не проанализированы.\n\n## Архитектура\n\nИнформация будет доступна после анализа файлов.\n\n## Примеры использования\n\nПримеры будут добавлены после анализа кода.\n\n## Зависимости\n\nГраф зависимостей будет построен после анализа файлов.`;
    }

    let content = '';
    
    // Обзор раздела - используем только реальные данные из анализа
    content += `## Обзор\n\n`;
    content += `Раздел содержит ${fileAnalysis.length} файл(ов):\n\n`;
    
    fileAnalysis.forEach(file => {
      const summary = file.analysis?.Summary || file.summary || 'Анализ файла не завершен';
      content += `- **${file.name}**: ${summary}\n`;
    });
    
    content += `\n`;
    
    // Архитектура - на основе реального анализа
    content += `## Архитектура\n\n`;
    
    fileAnalysis.forEach(file => {
      const analysis = file.analysis;
      if (!analysis) return;
      
      content += `### ${file.name}\n\n`;
      
      if (analysis.Purpose) {
        content += `**Назначение**: ${analysis.Purpose}\n\n`;
      }
      
      if (analysis.Components && analysis.Components.length > 0) {
        content += `**Компоненты**:\n`;
        analysis.Components.forEach(comp => {
          const name = comp.name || 'Неизвестный компонент';
          const responsibility = comp.responsibility || comp.description || 'Описание отсутствует';
          content += `- **${name}**: ${responsibility}\n`;
        });
        content += `\n`;
      }
      
      if (analysis.Functions && analysis.Functions.length > 0) {
        content += `**Функции**:\n`;
        analysis.Functions.forEach(func => {
          const name = func.name || 'Неизвестная функция';
          const purpose = func.purpose || func.description || 'Описание отсутствует';
          content += `- **${name}**: ${purpose}\n`;
          if (func.parameters && func.parameters.length > 0) {
            const params = func.parameters.map(p => p.name || p).join(', ');
            content += `  - Параметры: ${params}\n`;
          }
        });
        content += `\n`;
      }
    });
    
    // Примеры использования - на основе реального анализа
    content += `## Примеры использования\n\n`;
    
    const usageExamples = [];
    fileAnalysis.forEach(file => {
      if (file.analysis?.Usage) {
        usageExamples.push({
          file: file.name,
          usage: file.analysis.Usage
        });
      }
    });
    
    if (usageExamples.length > 0) {
      usageExamples.forEach(example => {
        content += `### ${example.file}\n\n`;
        content += `${example.usage}\n\n`;
      });
    } else {
      content += `Примеры использования будут добавлены после более детального анализа файлов.\n\n`;
    }
    
    // Зависимости - только реальные зависимости из анализа
    content += `## Зависимости\n\n`;
    
    const allDependencies = new Set();
    fileAnalysis.forEach(file => {
      if (file.analysis?.Dependencies && Array.isArray(file.analysis.Dependencies)) {
        file.analysis.Dependencies.forEach(dep => allDependencies.add(dep));
      }
      if (file.dependencies && Array.isArray(file.dependencies)) {
        file.dependencies.forEach(dep => allDependencies.add(dep));
      }
    });
    
    if (allDependencies.size > 0) {
      const sortedDeps = Array.from(allDependencies).sort();
      
      // Группируем зависимости
      const vueDeps = sortedDeps.filter(d => d.includes('vue') && !d.includes('@martyrs'));
      const internalDeps = sortedDeps.filter(d => d.includes('@martyrs') || d.startsWith('./') || d.startsWith('../'));
      const externalDeps = sortedDeps.filter(d => !vueDeps.includes(d) && !internalDeps.includes(d) && !d.startsWith('.'));
      
      if (vueDeps.length > 0) {
        content += `### Vue экосистема\n`;
        vueDeps.forEach(dep => content += `- ${dep}\n`);
        content += `\n`;
      }
      
      if (internalDeps.length > 0) {
        content += `### Внутренние зависимости\n`;
        internalDeps.forEach(dep => content += `- ${dep}\n`);
        content += `\n`;
      }
      
      if (externalDeps.length > 0) {
        content += `### Внешние библиотеки\n`;
        externalDeps.forEach(dep => content += `- ${dep}\n`);
        content += `\n`;
      }
    } else {
      content += `Зависимости еще не проанализированы или отсутствуют.\n\n`;
    }
    
    return content;
  }
  
  /**
   * Рекурсивно генерирует содержимое подразделов с валидацией
   */
  async generateSubsections(subsections, level, projectStructure, tocStructure, logger, docsOutputDir, parentSectionId) {
    if (!subsections || subsections.length === 0) {
      return { content: '', summary: '' };
    }
    
    let content = '';
    let summary = '';
    const headingMarker = '#'.repeat(level);
    
    for (const subsection of subsections) {
      logger.info(`Генерация подраздела уровня ${level}: ${subsection.title}`);
      
      // Собираем контекст для подраздела
      const subsectionFileAnalysis = await this.collectRelevantFiles(subsection, projectStructure);
      
      // Генерируем контент подраздела на основе реального анализа
      const subsectionContent = await this.generateSectionFromAnalysis(subsection, subsectionFileAnalysis, tocStructure, logger);
      
      // Сохраняем подраздел в отдельный файл
      const subsectionFileName = `${parentSectionId}-${subsection.id}.md`;
      const subsectionFilePath = path.join(docsOutputDir, subsectionFileName);
      
      const fullSubsectionContent = `# ${subsection.title}\n\n${subsectionContent}`;
      await fs.writeFile(subsectionFilePath, fullSubsectionContent, 'utf8');
      logger.info(`Подраздел ${subsection.title} сохранен в ${subsectionFileName}`);
      
      // Сохраняем сгенерированный контент в память
      await this.memoryManager.saveDocumentContent(subsection.id, subsectionContent, {
        title: subsection.title,
        description: subsection.description,
        level,
        generated: true,
        fileAnalysis: subsectionFileAnalysis,
        filePath: subsectionFilePath
      });
      
      // Добавляем ссылку в summary
      summary += `- [${subsection.title}](./sections/${subsectionFileName})\n`;
      
      // Добавляем подраздел в полный контент
      content += `\n\n${headingMarker} ${subsection.title}\n\n${subsectionContent}`;
      
      // Обновляем статус подраздела в состоянии
      await this.stateManager.saveSection(subsection.id, {
        title: subsection.title,
        content: subsectionContent,
        filePath: subsectionFilePath,
        lastUpdated: new Date().toISOString(),
      });
      
      // Рекурсивно обрабатываем более глубокие подразделы
      if (subsection.subsections && subsection.subsections.length > 0) {
        const nestedSubsections = await this.generateSubsections(
          subsection.subsections, 
          level + 1, 
          projectStructure, 
          tocStructure, 
          logger,
          docsOutputDir,
          subsection.id
        );
        content += nestedSubsections.content;
        summary += nestedSubsections.summary;
      }
      
      // Обновляем статус подраздела
      subsection.metadata.status = 'completed';
      subsection.metadata.lastUpdated = new Date().toISOString();
    }
    
    return { content, summary };
  }
  /**
   * Собирает релевантные файлы для раздела на основе анализа и зависимостей
   */
  async collectRelevantFiles(section, projectStructure) {
    const relevantFiles = [];
    
    // Получаем файлы для раздела на основе его метаданных
    if (section.files && section.files.length > 0) {
      // Если в разделе явно указаны файлы, используем их
      for (const filePath of section.files) {
        const file = this.findFileInStructure(projectStructure, filePath);
        if (file) {
          relevantFiles.push(file);
        }
      }
    } else {
      // Иначе ищем файлы по пути раздела в структуре проекта
      const sectionPath = this.getSectionPath(section.id);
      const files = this.findFilesByPath(projectStructure, sectionPath);
      relevantFiles.push(...files);
    }
    
    // Загружаем контент файлов, если он отсутствует
    const filesWithContent = [];
    for (const file of relevantFiles) {
      let fileContent = file.content;
      
      // Если контент отсутствует, загружаем его из файловой системы
      if (!fileContent && file.path) {
        try {
          fileContent = await fs.readFile(file.path, 'utf8');
        } catch (err) {
          console.warn(`Не удалось загрузить контент файла ${file.path}: ${err.message}`);
          fileContent = '';
        }
      }
      
      filesWithContent.push({
        name: file.name,
        path: file.relativePath,
        content: fileContent, // Теперь гарантированно есть контент
        summary: file.analysis?.summary || '',
        purpose: file.analysis?.purpose || '',
        importance: file.analysis?.importance || 3,
        components: file.analysis?.components || [],
        functions: file.analysis?.functions || [],
        dependencies: file.analysis?.dependencies || [],
        usage: file.analysis?.usage || '',
      });
    }
    
    return filesWithContent;
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
   * Собирает важные файлы из структуры проекта
   */
  collectAllImportantFiles(structure, files, minImportance = 4) {
    // Добавляем важные файлы на текущем уровне
    if (structure._files) {
      const importantFiles = structure._files.filter(file => 
        file.analysis && file.analysis.Importance >= minImportance
      );
      files.push(...importantFiles);
    }
    // Рекурсивно обходим поддиректории
    for (const key in structure) {
      if (key !== '_files' && typeof structure[key] === 'object') {
        this.collectAllImportantFiles(structure[key], files, minImportance);
      }
    }
  }
  
  /**
   * Получает путь раздела из его ID
   */
  getSectionPath(sectionId) {
    // Убираем префиксы и разбиваем по дефисам
    const cleanId = sectionId.replace(/^(source-|framework-)/, '');
    return cleanId.split('-');
  }
  
  /**
   * Находит файл в структуре проекта по пути
   */
  findFileInStructure(projectStructure, filePath) {
    const searchInStructure = (structure) => {
      if (structure._files) {
        const file = structure._files.find(f => 
          f.path === filePath || f.relativePath === filePath || f.name === filePath
        );
        if (file) return file;
      }
      
      for (const key in structure) {
        if (key !== '_files' && typeof structure[key] === 'object') {
          const result = searchInStructure(structure[key]);
          if (result) return result;
        }
      }
      return null;
    };
    
    return searchInStructure(projectStructure.source) || searchInStructure(projectStructure.framework);
  }
  
  /**
   * Находит файлы по пути в структуре проекта
   */
  findFilesByPath(projectStructure, pathParts) {
    let currentLevel = projectStructure.source;
    
    // Навигируем по структуре согласно пути
    for (const part of pathParts) {
      if (currentLevel[part]) {
        currentLevel = currentLevel[part];
      } else {
        // Если точного совпадения нет, ищем частичное
        let found = false;
        for (const key in currentLevel) {
          if (key !== '_files' && typeof currentLevel[key] === 'object' && 
              key.toLowerCase().includes(part.toLowerCase())) {
            currentLevel = currentLevel[key];
            found = true;
            break;
          }
        }
        if (!found) {
          return []; // Путь не найден
        }
      }
    }
    
    // Собираем все файлы из найденной структуры
    const files = [];
    this.collectFilesFromStructure(currentLevel, files);
    return files;
  }
  /**
   * Сохраняет документацию в файл
   */
  async saveDocumentation(documentation, outputPath, logger) {
    logger.info(`Сохранение документации в ${outputPath}`);
    console.log(`[DEBUG] Пытаюсь сохранить документацию в: ${outputPath}`);
    try {
      // Создаем директорию для документации, если ее нет
      const outputDir = path.dirname(outputPath);
      console.log(`[DEBUG] Создаю директорию: ${outputDir}`);
      await fs.mkdir(outputDir, { recursive: true });
      // Записываем документацию в файл
      await fs.writeFile(outputPath, documentation, 'utf8');
      console.log(`[DEBUG] Файл документации успешно записан.`);
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
      console.error(`[DEBUG] Ошибка при сохранении документации: ${err.message}`);
      throw err;
    }
  }
}
export default DocumentationBuilder;
