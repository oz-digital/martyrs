import { config as dotenvConfig } from 'dotenv';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import ProjectAnalyzer from './analyzer.js';
import config from './config.js';
import DocumentationBuilder from './documentationBuilder.js';
import DocumentMemoryManager from './documentMemoryManager.js';
import ProjectScanner from './fileScanner.js';
import { setupLogger } from './logger.js';
import DocumentationStateManager from './stateManager.js';
import TocGenerator from './tocGenerator.js';

// doc-generator/index.js
dotenvConfig();

/**
 * Основная функция генератора документации с поддержкой контекстного обучения
 */
async function generateDocumentation(options = {}) {
  const logger = setupLogger();
  logger.info('Начало генерации документации с контекстным обучением');
  logger.info(`Режим: ${options.reset ? 'сброс и полная регенерация' : 'инкрементальная генерация'}`);
  
  try {
    // Инициализация менеджера состояния
    const stateManager = new DocumentationStateManager();
    await stateManager.initialize(logger);
    
    // Сброс состояния, если указана соответствующая опция
    if (options.reset) {
      await stateManager.resetState(logger);
      // Если указана опция сброса памяти, сбрасываем и её
      if (options.resetMemory) {
        const memoryManager = new DocumentMemoryManager(stateManager);
        await memoryManager.initialize(logger);
        await memoryManager.resetMemory(logger);
      }
    }
    
    // Обработка импорта существующей документации
    if (options.importDocs && !options.reset) {
      logger.info(`Импорт документации из ${options.importDocs}`);
      const memoryManager = new DocumentMemoryManager(stateManager);
      await memoryManager.initialize(logger);
      await memoryManager.importExistingDocumentation(options.importDocs, logger);
    }
    
    // Сканирование проекта
    const projectScanner = new ProjectScanner(stateManager);
    const files = await projectScanner.scanProject(config.projectRootDir, logger);
    
    // Анализ файлов с использованием ChatGPT
    const projectAnalyzer = new ProjectAnalyzer(stateManager);
    const analysisResults = await projectAnalyzer.analyzeFiles(files, logger);
    
    // Получаем структуру проекта из состояния
    const projectStructure = stateManager.documentationState.projectStructure;
    
    // Генерация оглавления
    const tocGenerator = new TocGenerator(stateManager);
    const tocStructure = await tocGenerator.generateGlobalToc(projectStructure, logger);
    
    // Построение документации на основе оглавления и результатов анализа
    // с использованием контекстной памяти
    const documentationBuilder = new DocumentationBuilder(stateManager);
    await documentationBuilder.initialize(logger);
    const documentation = await documentationBuilder.buildDocumentation(tocStructure, projectStructure, logger);
    
    // Сохранение документации в файл
    await documentationBuilder.saveDocumentation(documentation, config.outputPath, logger);
    
    // Вывод статистики о документации
    const stats = stateManager.getDocumentationStats();
    
    // Получаем статистику по памяти документации
    const memoryManager = new DocumentMemoryManager(stateManager);
    await memoryManager.initialize(logger);
    const memoryStats = memoryManager.getMemoryStats();
    
    logger.info(`Документация успешно сгенерирована: ${config.outputPath}`);
    logger.info(`Статистика документации:`);
    logger.info(`- Всего файлов: ${stats.totalFiles}`);
    logger.info(`- Проанализировано файлов: ${stats.filesAnalyzed}`);
    logger.info(`- Покрытие документацией: ${stats.coverage.total}%`);
    logger.info(`  - Фреймворк: ${stats.coverage.framework}%`);
    logger.info(`  - Проект: ${stats.coverage.source}%`);
    logger.info(`Статистика памяти документации:`);
    logger.info(`- Документов в памяти: ${memoryStats.totalDocuments}`);
    logger.info(`- Концепций: ${memoryStats.totalConcepts}`);
    logger.info(`- Связей между разделами: ${memoryStats.totalRelations}`);
    
    console.log(`Документация успешно сгенерирована: ${config.outputPath}`);
    console.log(`Общее покрытие документацией: ${stats.coverage.total}%`);
    console.log(`Документов в памяти: ${memoryStats.totalDocuments}`);
    
    return {
      success: true,
      outputPath: config.outputPath,
      stats,
      memoryStats,
    };
  } catch (err) {
    logger.error(`Ошибка при генерации документации: ${err.message}`);
    logger.error(err.stack);
    console.error('Ошибка при генерации документации:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Обработка аргументов командной строки
 */
function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  const options = {
    reset: false,
    resetMemory: false,
    importDocs: null,
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--reset' || arg === '-r') {
      options.reset = true;
    } else if (arg === '--reset-memory' || arg === '--reset-context') {
      options.resetMemory = true;
    } else if (arg === '--import-docs') {
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options.importDocs = args[i + 1];
        i++; // Пропускаем следующий аргумент
      }
    }
  }
  
  return options;
}

/**
 * Точка входа при запуске скрипта напрямую
 * В ES модулях используем import.meta.url для проверки
 */
const currentModuleURL = import.meta.url;
const currentModulePath = fileURLToPath(currentModuleURL);

// Проверяем, запущен ли файл напрямую
if (process.argv[1] === currentModulePath) {
  const options = parseCommandLineArgs();
  generateDocumentation(options).catch(err => {
    console.error('Критическая ошибка:', err);
    process.exit(1);
  });
}

export { generateDocumentation };
export default {
  generateDocumentation,
};