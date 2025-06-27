import { promises as fs } from 'fs';
import path from 'path';
import EnhancedBatchGenerator from './enhancedBatchGenerator.js';
import DependencyGraphBuilder from './dependencyGraphBuilder.js';
import ASTSplitter from './astSplitter.js';

/**
 * Улучшенный генератор документации на основе графа зависимостей и AST
 */
class ImprovedBatchDocumentationGenerator {
  constructor(stateManager, memoryManager, config, logger) {
    this.stateManager = stateManager;
    this.memoryManager = memoryManager;
    this.config = config;
    this.logger = logger;
    
    this.enhancedGenerator = new EnhancedBatchGenerator(config, logger);
    this.graphBuilder = new DependencyGraphBuilder();
    this.astSplitter = new ASTSplitter();
  }

  /**
   * Генерирует документацию для проекта
   */
  async generateDocumentation(projectStructure, outputDir) {
    this.logger.info('🚀 Запуск улучшенной генерации документации');

    try {
      // Определяем модули для документирования
      const modules = await this.identifyModules(projectStructure);
      this.logger.info(`Найдено ${modules.length} модулей для документирования`);

      // Генерируем документацию для каждого модуля
      const results = [];
      for (const module of modules) {
        this.logger.info(`\n📦 Обработка модуля: ${module.name}`);
        
        const moduleDoc = await this.generateModuleDocumentation(
          module,
          projectStructure,
          outputDir
        );
        
        results.push(moduleDoc);
      }

      // Генерируем общий обзор
      await this.generateProjectOverview(results, projectStructure, outputDir);

      this.logger.info('\n✅ Генерация документации завершена успешно!');
      
      return {
        modules: results,
        outputDir: outputDir
      };
    } catch (error) {
      this.logger.error('❌ Ошибка при генерации документации:', error);
      throw error;
    }
  }

  /**
   * Определяет модули в проекте
   */
  async identifyModules(projectStructure) {
    const modules = [];
    
    // Ищем модули в source директории
    if (projectStructure.source && projectStructure.source.modules) {
      for (const moduleName in projectStructure.source.modules) {
        const modulePath = path.join(
          projectStructure.projectPath,
          'src/modules',
          moduleName
        );
        
        modules.push({
          name: moduleName,
          path: modulePath,
          type: 'source'
        });
      }
    }

    // Можно добавить поиск других типов модулей
    
    return modules;
  }

  /**
   * Генерирует документацию для модуля
   */
  async generateModuleDocumentation(module, projectStructure, outputDir) {
    const moduleOutputDir = path.join(outputDir, 'modules', module.name);
    
    // Используем улучшенный генератор
    const documentation = await this.enhancedGenerator.generateModuleDocumentation(
      module.path,
      projectStructure,
      moduleOutputDir
    );

    return {
      module: module.name,
      path: module.path,
      documentation: documentation,
      outputPath: moduleOutputDir
    };
  }

  /**
   * Генерирует общий обзор проекта
   */
  async generateProjectOverview(moduleResults, projectStructure, outputDir) {
    let overview = '# Обзор проекта\n\n';
    
    // Статистика
    const totalFiles = this.countFiles(projectStructure);
    overview += `## Статистика\n\n`;
    overview += `- Всего файлов: ${totalFiles}\n`;
    overview += `- Модулей документировано: ${moduleResults.length}\n\n`;

    // Архитектура
    overview += `## Архитектура\n\n`;
    overview += `Проект построен на модульной архитектуре со следующими основными модулями:\n\n`;

    // Список модулей
    for (const result of moduleResults) {
      const docPath = path.relative(outputDir, path.join(result.outputPath, `${result.module}.md`));
      overview += `### [${result.module}](./${docPath})\n`;
      
      // Добавляем краткое описание из документации
      const firstParagraph = this.extractFirstParagraph(result.documentation);
      if (firstParagraph) {
        overview += `${firstParagraph}\n\n`;
      }
    }

    // Граф зависимостей
    overview += `## Граф зависимостей\n\n`;
    overview += `\`\`\`mermaid\ngraph TD\n`;
    
    // Простой граф модулей
    for (const result of moduleResults) {
      overview += `  ${result.module}[${result.module}]\n`;
    }
    overview += `\`\`\`\n\n`;

    // Сохраняем обзор
    const overviewPath = path.join(outputDir, 'README.md');
    await fs.writeFile(overviewPath, overview, 'utf8');
    
    this.logger.info(`📄 Обзор проекта сохранен: ${overviewPath}`);
  }

  /**
   * Подсчитывает файлы в структуре
   */
  countFiles(structure) {
    let count = 0;
    
    const traverse = (obj) => {
      if (obj._files) {
        count += obj._files.length;
      }
      
      for (const key in obj) {
        if (key !== '_files' && typeof obj[key] === 'object') {
          traverse(obj[key]);
        }
      }
    };
    
    traverse(structure);
    return count;
  }

  /**
   * Извлекает первый параграф из документации
   */
  extractFirstParagraph(documentation) {
    const lines = documentation.split('\n');
    let paragraph = '';
    let foundContent = false;
    
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        paragraph = line.trim();
        foundContent = true;
        break;
      }
    }
    
    return paragraph;
  }

  /**
   * Метод для совместимости со старым API
   */
  async generateDocumentationBatch(files, outputPath, options = {}) {
    // Создаем временную структуру для обратной совместимости
    const projectStructure = {
      projectPath: process.cwd(),
      source: {
        _files: files
      }
    };

    return this.generateDocumentation(projectStructure, outputPath);
  }
}

export default ImprovedBatchDocumentationGenerator;