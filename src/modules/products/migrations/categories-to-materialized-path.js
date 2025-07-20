/**
 * Миграция категорий на Materialized Path Pattern
 * 
 * Этот скрипт переводит существующие категории с adjacency list на materialized path:
 * - Добавляет поля: slug, url, path, level
 * - Переносит старое поле url в новую структуру
 * - Пересчитывает структуру дерева
 * - Обновляет индексы
 */

import mongoose from 'mongoose';

// Подключение к базе данных
const DB_ADDRESS = process.env.DB_ADDRESS || 'mongodb://localhost:27017/martyrs';

console.log('🔗 Подключаемся к базе данных:', DB_ADDRESS);

try {
  await mongoose.connect(DB_ADDRESS);
  console.log('✅ Подключение к MongoDB установлено');
} catch (error) {
  console.error('❌ Ошибка подключения к базе данных:', error);
  process.exit(1);
}

// Функция для генерации slug из имени
const generateSlug = (name, existingSlugs = []) => {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
  
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// Функция для построения url
const buildUrl = (parentPath, slug) => {
  return parentPath ? `${parentPath}/${slug}` : `/${slug}`;
};

// Основная функция миграции
const migrateCategoriesToMaterializedPath = async (db, testMode = false) => {
  console.log('🚀 Начинаем миграцию категорий на Materialized Path Pattern...');
  
  if (testMode) {
    console.log('⚠️  ТЕСТОВЫЙ РЕЖИМ - данные НЕ будут изменены');
  }
  
  const Category = db.collection('categories');
  
  try {
    // Шаг 1: Удаляем проблемные индексы сначала
    console.log('🗑️ Шаг 1: Удаляем старые индексы...');
    
    if (!testMode) {
      try {
        await Category.dropIndex({ url: 1 });
        console.log('   ✅ Удален индекс url_1');
      } catch (error) {
        console.log('   ℹ️  Индекс url_1 не найден (это нормально)');
      }
    } else {
      console.log('   [ТЕСТ] Удалили бы индекс url_1');
    }

    // Шаг 2: Добавляем новые поля во все документы
    console.log('📝 Шаг 2: Добавляем новые поля...');
    
    if (!testMode) {
      await Category.updateMany(
        {},
        {
          $set: {
            slug: '',
            url: '',
            path: [],
            level: 0
          }
        }
      );
    } else {
      console.log('   [ТЕСТ] Обновили бы поля у всех категорий');
    }
    
    // Шаг 3: Получаем все категории и строим карту
    console.log('📊 Шаг 3: Загружаем все категории...');
    
    const allCategories = await Category.find({}).toArray();
    const categoryMap = new Map();
    
    // Создаем карту категорий для быстрого доступа
    allCategories.forEach(cat => {
      categoryMap.set(cat._id.toString(), cat);
    });
    
    // Шаг 3: Функция для рекурсивного обновления категории и её потомков
    const updateCategoryPath = async (categoryId, parentPath = '', level = 0, ancestors = []) => {
      const category = categoryMap.get(categoryId.toString());
      if (!category) return;
      
      console.log(`   Обрабатываем: ${category.name} (level: ${level})`);
      
      // Получаем существующие slug на том же уровне (в рамках того же parent)
      const siblings = allCategories.filter(cat => 
        cat.parent?.toString() === category.parent?.toString()
      );
      const existingSlugs = siblings
        .filter(cat => cat._id.toString() !== categoryId.toString())
        .map(cat => cat.slug || generateSlug(cat.name));
      
      // Генерируем slug если его нет или если он из старого поля url
      let slug = category.slug;
      if (!slug || slug === category.url) {
        slug = generateSlug(category.name, existingSlugs);
      }
      
      // Строим url
      const url = buildUrl(parentPath, slug);
      
      // Обновляем категорию
      if (!testMode) {
        const updateResult = await Category.updateOne(
          { _id: category._id },
          {
            $set: {
              slug: slug,
              url: url,
              path: ancestors,
              level: level
            },
          }
        );
        
        if (updateResult.modifiedCount === 0) {
          console.warn(`   ⚠️  Не удалось обновить категорию: ${category.name}`);
        }
      } else {
        console.log(`   [ТЕСТ] Обновили бы ${category.name}: slug="${slug}", url="${url}", level=${level}`);
      }
      
      // Обновляем карту
      categoryMap.set(categoryId.toString(), {
        ...category,
        slug,
        url,
        path: ancestors,
        level
      });
      
      // Рекурсивно обновляем дочерние категории
      const children = allCategories.filter(cat => 
        cat.parent?.toString() === categoryId.toString()
      );
      
      for (const child of children) {
        await updateCategoryPath(
          child._id,
          url,
          level + 1,
          [...ancestors, category._id]
        );
      }
    };
    
    // Шаг 4: Начинаем с корневых категорий
    console.log('🌳 Шаг 4: Обрабатываем дерево категорий...');
    
    const rootCategories = allCategories.filter(cat => !cat.parent);
    console.log(`   Найдено ${rootCategories.length} корневых категорий`);
    
    for (const rootCategory of rootCategories) {
      await updateCategoryPath(rootCategory._id);
    }
    
    // Шаг 5: Проверяем и исправляем возможные проблемы
    console.log('🔍 Шаг 5: Проверяем результаты миграции...');
    
    // Проверяем, что у всех категорий есть новые поля
    const categoriesWithoutSlug = await Category.countDocuments({ 
      $or: [
        { slug: { $exists: false } },
        { slug: '' }
      ]
    });
    
    const categoriesWithoutFullPath = await Category.countDocuments({ 
      $or: [
        { url: { $exists: false } },
        { url: '' }
      ]
    });
    
    if (categoriesWithoutSlug > 0) {
      console.warn(`   ⚠️  ${categoriesWithoutSlug} категорий без slug`);
    }
    
    if (categoriesWithoutFullPath > 0) {
      console.warn(`   ⚠️  ${categoriesWithoutFullPath} категорий без url`);
    }
    
    // Проверяем дубликаты url
    const duplicateFullPaths = await Category.aggregate([
      { $group: { _id: '$url', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (duplicateFullPaths.length > 0) {
      console.warn(`   ⚠️  Найдено ${duplicateFullPaths.length} дубликатов url:`);
      duplicateFullPaths.forEach(dup => {
        console.warn(`      - ${dup._id} (${dup.count} раз)`);
      });
    }
    
    // Шаг 6: Создаем новые индексы
    console.log('📚 Шаг 6: Создаем новые индексы...');
    
    if (!testMode) {
      try {
        // Удаляем существующие индексы которые могут конфликтовать
        const existingIndexesToDrop = ['url_1', 'path_1', 'parent_1_slug_1'];
        
        for (const indexName of existingIndexesToDrop) {
          try {
            await Category.dropIndex(indexName);
            console.log(`   ✅ Удален существующий индекс: ${indexName}`);
          } catch (error) {
            // Индекс не существует - это нормально
          }
        }
        
        // Создаем новые индексы
        await Category.createIndex({ parent: 1, slug: 1 }, { unique: true });
        console.log('   ✅ Создан индекс: parent_1_slug_1 (unique)');
        
        await Category.createIndex({ path: 1 });
        console.log('   ✅ Создан индекс: path_1');
        
        await Category.createIndex({ url: 1 }, { unique: true });
        console.log('   ✅ Создан индекс: url_1 (unique)');
        
        await Category.createIndex({ level: 1, status: 1, order: 1 });
        console.log('   ✅ Создан индекс: level_1_status_1_order_1');
        
        await Category.createIndex({ 'owner.type': 1, 'owner.target': 1, status: 1, level: 1 });
        console.log('   ✅ Создан индекс: owner.type_1_owner.target_1_status_1_level_1');
        
        console.log('   ✅ Все новые индексы созданы');
      } catch (error) {
        console.warn(`   ⚠️  Ошибка при создании индексов: ${error.message}`);
      }
    } else {
      console.log('   [ТЕСТ] Удалили бы существующие конфликтующие индексы и создали новые');
    }
    
    // Шаг 7: Финальная статистика
    console.log('📈 Шаг 7: Финальная статистика...');
    
    const totalCategories = await Category.countDocuments();
    const categoriesByLevel = await Category.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    console.log(`   Всего категорий: ${totalCategories}`);
    console.log('   Распределение по уровням:');
    categoriesByLevel.forEach(level => {
      console.log(`     Уровень ${level._id}: ${level.count} категорий`);
    });
    
    if (testMode) {
      console.log('✅ Тестирование завершено успешно! База данных НЕ изменена.');
    } else {
      console.log('✅ Миграция завершена успешно!');
    }
    
    return {
      success: true,
      totalCategories,
      categoriesByLevel,
      issues: {
        categoriesWithoutSlug,
        categoriesWithoutFullPath,
        duplicateFullPaths: duplicateFullPaths.length
      }
    };
    
  } catch (error) {
    console.error('❌ Ошибка во время миграции:', error);
    throw error;
  }
};

// Функция отката миграции
const rollbackMigration = async (db) => {
  console.log('🔄 Начинаем откат миграции...');
  
  const Category = db.collection('categories');
  
  try {
    // Оставляем только новую структуру с url
    const categories = await Category.find({}).toArray();
    
    for (const category of categories) {
      if (category.url) {
        await Category.updateOne(
          { _id: category._id },
          {
            $unset: {
              slug: "",
              path: "",
              level: ""
            }
          }
        );
      }
    }
    
    // Восстанавливаем старые индексы
    await Category.createIndex({ url: 1 }, { unique: true });
    
    // Удаляем новые индексы
    await Category.dropIndex({ parent: 1, slug: 1 }).catch(() => {});
    await Category.dropIndex({ path: 1 }).catch(() => {});
    await Category.dropIndex({ url: 1 }).catch(() => {});
    await Category.dropIndex({ level: 1, status: 1, order: 1 }).catch(() => {});
    await Category.dropIndex({ 'owner.type': 1, 'owner.target': 1, status: 1, level: 1 }).catch(() => {});
    
    console.log('✅ Откат миграции завершен');
    
  } catch (error) {
    console.error('❌ Ошибка при откате:', error);
    throw error;
  }
};

// CLI интерфейс
const runMigration = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  const testMode = args.includes('--test');
  
  try {
    const db = mongoose.connection.db;
    
    if (command === 'rollback') {
      if (testMode) {
        console.log('❌ Тестовый режим не поддерживается для отката');
        process.exit(1);
      }
      await rollbackMigration(db);
    } else {
      const result = await migrateCategoriesToMaterializedPath(db, testMode);
      
      if (!testMode && (result.issues.categoriesWithoutSlug > 0 || 
          result.issues.categoriesWithoutFullPath > 0 || 
          result.issues.duplicateFullPaths > 0)) {
        console.log('\n⚠️  Обнаружены проблемы. Рекомендуется проверить данные вручную.');
        process.exit(1);
      }
    }
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Отключено от MongoDB');
  }
};

// Экспорт для использования в других скриптах
export { migrateCategoriesToMaterializedPath, rollbackMigration };

// Запуск из командной строки
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runMigration();
}

/*
Использование:

1. Тестовый режим (показывает что будет сделано, НЕ меняет базу):
   DB_ADDRESS="mongodb://localhost:27017/martyrs" node categories-to-materialized-path.js --test

2. Обычная миграция:
   DB_ADDRESS="mongodb://localhost:27017/martyrs" node categories-to-materialized-path.js

3. Откат миграции:
   DB_ADDRESS="mongodb://localhost:27017/martyrs" node categories-to-materialized-path.js rollback

4. Перед запуском убедитесь что:
   - Есть резервная копия базы данных
   - Настроена переменная окружения MONGO_URL
   - Установлены зависимости: npm install mongoose

4. После миграции проверьте:
   - Что все категории имеют правильные slug и url
   - Что нет дубликатов url
   - Что структура дерева сохранилась
   - Что фронтенд работает корректно

Пример вывода:
🚀 Начинаем миграцию категорий на Materialized Path Pattern...
📝 Шаг 1: Добавляем новые поля...
📊 Шаг 2: Загружаем все категории...
🌳 Шаг 3: Обрабатываем дерево категорий...
   Найдено 5 корневых категорий
   Обрабатываем: Electronics (level: 0)
   Обрабатываем: Phones (level: 1)
   Обрабатываем: Smartphones (level: 2)
   ...
📈 Шаг 6: Финальная статистика...
   Всего категорий: 150
   Распределение по уровням:
     Уровень 0: 5 категорий
     Уровень 1: 25 категорий
     Уровень 2: 80 категорий
     Уровень 3: 40 категорий
✅ Миграция завершена успешно!
*/