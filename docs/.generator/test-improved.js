#!/usr/bin/env node

import generateImprovedDocumentation from './index-improved.js';

// Тестовый запуск улучшенного генератора
async function test() {
  console.log('🧪 Тестовый запуск улучшенного генератора документации\n');
  
  try {
    // Запускаем с опцией сброса для чистого теста
    const result = await generateImprovedDocumentation({
      reset: true,
      resetMemory: true
    });
    
    if (result.success) {
      console.log('\n✅ Тест успешно завершен!');
      console.log('📋 Результаты:');
      console.log(`  - Модулей обработано: ${result.modules.length}`);
      console.log(`  - Покрытие: ${result.stats.coverage.total}%`);
      console.log(`  - Выходная директория: ${result.outputPath}`);
      
      // Выводим список модулей
      console.log('\n📦 Обработанные модули:');
      result.modules.forEach((mod, index) => {
        console.log(`  ${index + 1}. ${mod.module}`);
      });
    } else {
      console.error('\n❌ Тест завершился с ошибкой:', result.error);
    }
  } catch (error) {
    console.error('\n❌ Критическая ошибка:', error);
  }
}

// Запускаем тест
test();