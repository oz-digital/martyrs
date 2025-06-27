import { config as dotenvConfig } from 'dotenv';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import ProjectAnalyzer from './analyzer.js';
import config from './config.js';
import ImprovedBatchDocumentationGenerator from './improvedBatchDocumentationGenerator.js';
import DocumentMemoryManager from './documentMemoryManager.js';
import ProjectScanner from './fileScanner.js';
import { setupLogger } from './logger.js';
import DocumentationStateManager from './stateManager.js';

// Загружаем переменные окружения
dotenvConfig();

/**
 * Улучшенный генератор документации с графом зависимостей и AST-разбиением
 */
async function generateImprovedDocumentation(options = {}) {
  const logger = setupLogger();
  logger.info('🚀 Запуск улучшенного генератора документации');
  logger.info(`Режим: ${options.reset ? 'сброс и полная регенерация' : 'инкрементальная генерация'}`);
  
  try {
    // Инициализация менеджера состояния
    const stateManager = new DocumentationStateManager();
    await stateManager.initialize(logger);
    
    // Сброс состояния, если указана соответствующая опция
    if (options.reset) {
      await stateManager.resetState(logger);
      if (options.resetMemory) {
        const memoryManager = new DocumentMemoryManager(stateManager);
        await memoryManager.initialize(logger);
        await memoryManager.resetMemory(logger);
      }
    }
    
    // Сканирование проекта
    logger.info('📂 Сканирование файлов проекта...');
    const projectScanner = new ProjectScanner(stateManager);
    const files = await projectScanner.scanProject(config.projectRootDir, logger);
    logger.info(`Найдено ${files.length} файлов`);
    
    // Анализ файлов
    logger.info('🔍 Анализ структуры и зависимостей...');
    const projectAnalyzer = new ProjectAnalyzer(stateManager);
    const analysisResults = await projectAnalyzer.analyzeFiles(files, logger);
    
    // Получаем структуру проекта
    const projectStructure = stateManager.documentationState.projectStructure;
    projectStructure.projectPath = config.projectRootDir;
    
    // Инициализация улучшенного генератора
    const memoryManager = new DocumentMemoryManager(stateManager);
    await memoryManager.initialize(logger);
    
    const improvedGenerator = new ImprovedBatchDocumentationGenerator(
      stateManager,
      memoryManager,
      config,
      logger
    );
    
    // Генерация документации
    logger.info('📝 Генерация документации...');
    const documentation = await improvedGenerator.generateDocumentation(
      projectStructure,
      config.outputPath
    );
    
    // Статистика
    const stats = stateManager.getDocumentationStats();
    const memoryStats = memoryManager.getMemoryStats();
    
    logger.info('✅ Документация успешно сгенерирована!');
    logger.info(`📊 Статистика:`);
    logger.info(`  - Всего файлов: ${stats.totalFiles}`);
    logger.info(`  - Проанализировано: ${stats.filesAnalyzed}`);
    logger.info(`  - Покрытие: ${stats.coverage.total}%`);
    logger.info(`  - Модулей документировано: ${documentation.modules.length}`);
    logger.info(`  - Выходная директория: ${config.outputPath}`);
    
    console.log('\n✅ Документация успешно сгенерирована!');
    console.log(`📁 Результаты сохранены в: ${config.outputPath}`);
    console.log(`📊 Покрытие документацией: ${stats.coverage.total}%`);
    console.log(`📦 Модулей обработано: ${documentation.modules.length}`);
    
    return {
      success: true,
      outputPath: config.outputPath,
      modules: documentation.modules,
      stats,
      memoryStats,
    };
  } catch (err) {
    logger.error(`❌ Ошибка при генерации документации: ${err.message}`);
    logger.error(err.stack);
    console.error('❌ Ошибка при генерации документации:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

// Обработка аргументов командной строки
async function main() {
  const args = process.argv.slice(2);
  const options = {
    reset: args.includes('--reset'),
    resetMemory: args.includes('--reset-memory'),
    importDocs: args.find(arg => arg.startsWith('--import='))?.split('=')[1],
  };
  
  await generateImprovedDocumentation(options);
}

// Запуск если вызван напрямую
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}

export default generateImprovedDocumentation;