# Модуль: controllers

## Обзор группы
Группа файлов, состоящая из `products.controller.js`, `products.queries.js` и `products.lookup.config.js`, предназначена для управления продуктами в проекте на базе фреймворка martyrs. Эти файлы обеспечивают реализацию бизнес-логики, агрегационных запросов и конфигураций для работы с товарами, их остатками и категориями.

## Архитектура и взаимодействие
- **products.controller.js**: Этот файл является основным контроллером для управления продуктами. Он использует функции из `products.queries.js` для построения агрегационных запросов и конфигурации из `products.lookup.config.js` для выполнения сложных операций с данными. Контроллер предоставляет CRUD-операции и функцию интеллектуального подбора товаров.
  
- **products.queries.js**: Этот файл предоставляет функции для создания этапов агрегации MongoDB, которые контроллер использует для фильтрации товаров по различным критериям, таким как категории, опции доставки и атрибуты. Он экспортирует утилиты, которые могут быть использованы в контроллерах или сервисах.

- **products.lookup.config.js**: Этот файл определяет конфигурации для MongoDB lookup-агрегаций, которые используются в контроллере для работы с продуктами, остатками и категориями. Конфигурации позволяют строить сложные агрегационные запросы, которые могут быть переиспользованы в других частях приложения.

## Ключевые компоненты
- **products.controller.js**
  - Компоненты: `controllerFactory`
  - Функции: `Create`, `Read`, `Update`, `Delete`, `getProductRecommendation`
  
- **products.queries.js**
  - Функции: `getCategoriesFilterStage`, `getDeliveryFilterStage`, `getAttributeFiltersStage`, `escapeRegex`
  
- **products.lookup.config.js**
  - Компоненты: `leftovers`, `recommended`, `categories`
  - Функции: `leftovers.lookup`, `leftovers.additionalStages`, `recommended.lookup`, `categories.lookup`, `categories.additionalStages`

## Примеры использования
Пример использования контроллера для получения рекомендованных товаров:
```javascript
const productController = require('./controllers/products.controller.js');

// Получение рекомендаций по продуктам
const recommendations = productController.getProductRecommendation(userPreferences);
```

Пример использования функций агрегации из `products.queries.js`:
```javascript
const productQueries = require('./controllers/queries/products.queries.js');

// Фильтрация товаров по категориям
const categoryFilterStage = productQueries.getCategoriesFilterStage(selectedCategories);
```

Пример использования конфигураций из `products.lookup.config.js`:
```javascript
const lookupConfig = require('./controllers/configs/products.lookup.config.js');

// Использование конфигурации для выполнения lookup-агрегации
const lookupStage = lookupConfig.categories.lookup;
```

## Зависимости
- **products.controller.js**:
  - Зависимости: 
    - `@martyrs/src/modules/integrations/openai/openai.globals.js`
    - `@martyrs/src/modules/globals/controllers/utils/queryProcessor.js`
    - `controllers/queries/products.queries.js`
    - `controllers/configs/products.lookup.config.js`
  
- **products.queries.js**:
  - Зависимости: 
    - `mongoose (Types.ObjectId)`

- **products.lookup.config.js**:
  - Зависимости: Нет