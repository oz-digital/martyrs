#!/usr/bin/env node
// .generator/bin/martyrs-doc.js
const path = require('path');
const fs = require('fs');

// Определяем путь к корневой директории генератора
const generatorRoot = path.resolve(__dirname, '..');

// Импортируем необходимые модули относительно корня генератора
const { generateDocumentation } = require(path.join(generatorRoot, 'index'));
const DocumentationStateManager = require(path.join(generatorRoot, 'stateManager'));
const DocumentMemoryManager = require(path.join(generatorRoot, 'documentMemoryManager'));
const { setupLogger } = require(path.join(generatorRoot, 'logger'));

// Обработка аргументов командной строки
const args = process.argv.slice(2);
let command = 'generate';
const options = {
  reset: false,
  resetMemory: false,
  importDocs: null,
  contextMode: 'auto',
  verbose: false,
};

// Извлекаем команду и аргументы
if (args.length > 0 && !args[0].startsWith('-')) {
  command = args[0];
}

// Обработка опций
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
  } else if (arg === '--context-mode') {
    if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
      options.contextMode = args[i + 1];
      i++; // Пропускаем следующий аргумент
    }
  } else if (arg === '--verbose' || arg === '-v') {
    options.verbose = true;
  }
}

// Выполнение соответствующей команды
async function run() {
  const logger = setupLogger();

  try {
    switch (command) {
      case 'generate':
        console.log('Генерация документации...');
        const result = await generateDocumentation(options);
        if (result.success) {
          console.log(`Документация успешно сгенерирована: ${result.outputPath}`);
          console.log(`Общее покрытие документацией: ${result.stats.coverage.total}%`);
          if (result.memoryStats) {
            console.log('\nСтатистика памяти документации:');
            console.log(`- Документов в памяти: ${result.memoryStats.totalDocuments}`);
            console.log(`- Концепций: ${result.memoryStats.totalConcepts}`);
            console.log(`- Связей между разделами: ${result.memoryStats.totalRelations}`);
          }
        } else {
          console.error('Ошибка при генерации документации:', result.error);
          process.exit(1);
        }
        break;

      case 'reset':
        console.log('Сброс и регенерация документации...');
        options.reset = true;
        const resetResult = await generateDocumentation(options);
        if (resetResult.success) {
          console.log(`Документация успешно сброшена и регенерирована: ${resetResult.outputPath}`);
        } else {
          console.error('Ошибка при сбросе документации:', resetResult.error);
          process.exit(1);
        }
        break;

      case 'import':
        if (!options.importDocs) {
          console.error('Не указан путь к импортируемой документации. Используйте --import-docs <путь>');
          process.exit(1);
        }

        console.log(`Импорт документации из ${options.importDocs}...`);
        const stateManager = new DocumentationStateManager();
        await stateManager.initialize(logger);

        const memoryManager = new DocumentMemoryManager(stateManager);
        await memoryManager.initialize(logger);

        const importResult = await memoryManager.importExistingDocumentation(options.importDocs, logger);

        if (importResult) {
          const stats = memoryManager.getMemoryStats();
          console.log('Документация успешно импортирована.');
          console.log(`- Документов в памяти: ${stats.totalDocuments}`);
          console.log(`- Концепций: ${stats.totalConcepts}`);
          console.log(`- Связей между разделами: ${stats.totalRelations}`);
        } else {
          console.error('Ошибка при импорте документации');
          process.exit(1);
        }
        break;

      case 'status':
        const { checkDocumentationStatus } = require(path.join(generatorRoot, 'scripts', 'docStatus'));
        const status = await checkDocumentationStatus();
        console.log('Статус документации:');
        console.log(`- Всего файлов: ${status.totalFiles}`);
        console.log(`- Проанализировано файлов: ${status.filesAnalyzed}`);
        console.log(`- Покрытие документацией: ${status.coverage.total}%`);
        console.log(`  - Фреймворк: ${status.coverage.framework}%`);
        console.log(`  - Проект: ${status.coverage.source}%`);
        console.log(`- Завершенные разделы: ${status.sectionsCompleted}/${status.totalSections} (${status.sectionsCompletionPercentage}%)`);

        if (status.memory) {
          console.log('\nСтатистика памяти документации:');
          console.log(`- Документов в памяти: ${status.memory.totalDocuments}`);
          console.log(`- Концепций: ${status.memory.totalConcepts}`);
          console.log(`- Связей между разделами: ${status.memory.totalRelations}`);
        }
        break;

      case 'memory-stats':
        console.log('Статистика контекстной памяти документации:');
        const sm = new DocumentationStateManager();
        await sm.initialize(logger);

        const mm = new DocumentMemoryManager(sm);
        await mm.initialize(logger);

        const memoryStats = mm.getMemoryStats();
        console.log(`- Документов в памяти: ${memoryStats.totalDocuments}`);
        console.log(`- Концепций: ${memoryStats.totalConcepts}`);
        console.log(`- Связей между разделами: ${memoryStats.totalRelations}`);
        console.log(`- Средняя длина документа: ${memoryStats.averageLength} символов`);

        // Выводим информацию о наиболее связанных разделах
        if (mm.conceptsMap && mm.conceptsMap.relations) {
          const relatedSections = mm.conceptsMap.relations.sort((a, b) => b.strength - a.strength).slice(0, 5);

          if (relatedSections.length > 0) {
            console.log('\nНаиболее связанные разделы:');
            for (const relation of relatedSections) {
              console.log(`- ${relation.source} ↔ ${relation.target} (сила связи: ${relation.strength})`);
            }
          }
        }
        break;

      case 'clear-memory':
        console.log('Очистка контекстной памяти...');
        const clearSm = new DocumentationStateManager();
        await clearSm.initialize(logger);

        const clearMm = new DocumentMemoryManager(clearSm);
        await clearMm.initialize(logger);

        await clearMm.resetMemory(logger);
        console.log('Контекстная память документации успешно очищена.');
        break;

      case 'help':
      default:
        console.log(`
Martyrs Documentation Generator

Использование:
  martyrs-doc [command] [options]

Команды:
  generate           Генерирует документацию (действие по умолчанию)
  reset              Сбрасывает кэш и регенерирует документацию
  import             Импортирует существующую документацию в память
  status             Показывает статус и покрытие документации
  memory-stats       Показывает статистику контекстной памяти
  clear-memory       Очищает контекстную память документации
  help               Показывает эту справку

Опции:
  --reset, -r                   Сбрасывает кэш и регенерирует документацию
  --reset-memory                Сбрасывает контекстную память
  --import-docs <path>          Путь к директории с документацией для импорта
  --context-mode <mode>         Режим использования контекста: 'auto', 'memory', 'none'
  --verbose, -v                 Подробный вывод информации
        `);
        break;
    }
  } catch (err) {
    console.error('Ошибка:', err);
    process.exit(1);
  }
}

run();
