import { promises } from 'fs';
import DocumentMemoryManager from '../documentMemoryManager.js';
import logger from '../logger.js';
import DocumentationStateManager from '../stateManager.js';
const fs = { promises }.promises;
const { setupLogger } = logger;
/**
 * Проверяет текущий статус документации
 */
async function checkDocumentationStatus() {
  const logger = setupLogger();
  try {
    // Инициализация менеджера состояния
    const stateManager = new DocumentationStateManager();
    await stateManager.initialize(logger);
    // Получение статистики о документации
    const stats = stateManager.getDocumentationStats();
    // Получение дополнительной информации о разделах
    const sections = stateManager.documentationState.sections || {};
    const completedSections = Object.values(sections).filter(section => section.lastUpdated).length;
    const totalSections = Object.keys(sections).length;
    const enhancedStats = {
      ...stats,
      sectionsCompleted: completedSections,
      totalSections,
      sectionsCompletionPercentage: totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0,
    };
    // Если доступен менеджер памяти, получаем статистику о нем
    try {
      const memoryManager = new DocumentMemoryManager(stateManager);
      await memoryManager.initialize(logger);
      const memoryStats = memoryManager.getMemoryStats();
      enhancedStats.memory = memoryStats;
    } catch (err) {
      logger.warn(`Не удалось получить статистику памяти документации: ${err.message}`);
    }
    return enhancedStats;
  } catch (err) {
    logger.error(`Ошибка при проверке статуса документации: ${err.message}`);
    throw err;
  }
}
if (require.main === module) {
  checkDocumentationStatus()
    .then(stats => {
      console.log('Статус документации:');
      console.log(`- Всего файлов: ${stats.totalFiles}`);
      console.log(`- Проанализировано файлов: ${stats.filesAnalyzed}`);
      console.log(`- Покрытие документацией: ${stats.coverage.total}%`);
      console.log(`  - Фреймворк: ${stats.coverage.framework}%`);
      console.log(`  - Проект: ${stats.coverage.source}%`);
      console.log(`- Завершенные разделы: ${stats.sectionsCompleted}/${stats.totalSections} (${stats.sectionsCompletionPercentage}%)`);
      if (stats.memory) {
        console.log('\nСтатистика контекстной памяти:');
        console.log(`- Документов в памяти: ${stats.memory.totalDocuments}`);
        console.log(`- Концепций: ${stats.memory.totalConcepts}`);
        console.log(`- Связей между разделами: ${stats.memory.totalRelations}`);
      }
    })
    .catch(err => {
      console.error('Ошибка:', err);
      process.exit(1);
    });
}
export { checkDocumentationStatus };
export default {
  checkDocumentationStatus,
};
