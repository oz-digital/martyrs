# Модуль: Vue компоненты

## Обзор модуля

Модуль состоит из 32 файлов, разбитых на 4 группы для анализа.

### Группа 1

## Обзор группы
Данная группа файлов представляет собой компоненты и модули, связанные с управлением категориями и продуктами в приложении, построенном на фреймворке martyrs. Основные функции включают создание, редактирование и отображение категорий и продуктов, а также управление состоянием через Vuex.

## Архитектура и взаимодействие
Файлы организованы в несколько ключевых компонентов, которые взаимодействуют друг с другом через маршруты и хранилище состояния. Основные маршруты определяются в `categories.router.js`, который связывает страницы категорий и их редактирования с соответствующими компонентами.

- **router/categories.router.js**:
  - Определяет маршруты для страниц `Categories.vue` и `CategoryEdit.vue`.
  
- **components/pages/Categories.vue**:
  - Отображает список категорий и взаимодействует с `store/categories.js` для управления состоянием категорий.
  - Использует компонент `CardCategory.vue` для визуализации каждой категории.

- **components/pages/CategoryEdit.vue**:
  - Предоставляет интерфейс для редактирования категорий и также взаимодействует с `store/categories.js`.

- **store/categories.js**:
  - Управляет состоянием категорий, предоставляя функции для CRUD-операций.

- **components/pages/Product.vue**:
  - Отображает информацию о продукте и использует компоненты `ProductImages.vue` и `ProductConfigurator.vue` для визуализации и настройки продукта.
  - Взаимодействует с `store/products.js` и `store/categories.js`.

- **components/pages/ProductEdit.vue**:
  - Обеспечивает интерфейс для редактирования продуктов, взаимодействуя с `store/products.js` и `store/categories.js`.

- **components/pages/Products.vue**:
  - Отображает список продуктов и использует `FilterProducts.vue` для фильтрации.

- **store/products.js**:
  - Управляет состоянием продуктов и предоставляет функции для их обработки.

## Ключевые компоненты
1. **Categories.vue**: Основная страница для управления категориями.
2. **CategoryEdit.vue**: Интерфейс для редактирования категорий.
3. **Product.vue**: Страница для отображения информации о продукте.
4. **ProductEdit.vue**: Интерфейс для редактирования продуктов.
5. **Products.vue**: Страница для просмотра и фильтрации продуктов.
6. **FilterProducts.vue**: Компонент для фильтрации товаров по различным критериям.

## Примеры использования
### Пример маршрута для категорий
```javascript
import Categories from '@martyrs/src/modules/products/components/pages/Categories.vue';
import CategoryEdit from '@martyrs/src/modules/products/components/pages/CategoryEdit.vue';

const routes = [
  { path: '/categories', component: Categories },
  { path: '/categories/edit/:id', component: CategoryEdit }
];
```

### Пример использования состояния в Categories.vue
```javascript
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();
    const categories = store.state.categories;

    const deleteCategory = (id) => {
      store.dispatch('categories/delete', id);
    };

    return { categories, deleteCategory };
  }
};
```

### Пример использования фильтров в Products.vue
```javascript
<template>
  <FilterProducts @filterChange="applyFilters" />
  <CardProduct v-for="product in filteredProducts" :key="product.id" :product="product" />
</template>

<script>
import FilterProducts from './sections/FilterProducts.vue';

export default {
  components: { FilterProducts },
  methods: {
    applyFilters(filters) {
      // Логика применения фильтров
    }
  }
};
</script>
```

## Зависимости
- **categories.router.js**: Зависит от `Categories.vue` и `CategoryEdit.vue`.
- **Categories.vue**: Зависит от `store/categories.js` и `CardCategory.vue`.
- **CategoryEdit.vue**: Зависит от `store/categories.js`.
- **Product.vue**: Зависит от `store/products.js`, `store/categories.js`, `ProductImages.vue`, и `ProductConfigurator.vue`.
- **ProductEdit.vue**: Зависит от `store/products.js` и `store/categories.js`.
- **Products.vue**: Зависит от `store/products.js`, `store/categories.js`, и `FilterProducts.vue`.
- **FilterProducts.vue**: Зависит от `store/categories.js`.

### Группа 2

## Обзор группы
Данная группа файлов представляет собой часть приложения на Vue, предназначенного для управления остатками товаров на складе. Она включает в себя компоненты для создания, редактирования и отображения остатков, а также для визуализации истории складских операций. Основные файлы в группе: `LeftoverEdit.vue`, `leftovers.js`, `leftovers.router.js`, `StockHistoryView.vue`, и `Leftovers.vue`.

## Архитектура и взаимодействие
Файлы в данной группе имеют взаимосвязи, которые обеспечивают функциональность управления остатками:

- `LeftoverEdit.vue` и `Leftovers.vue` используют хранилище `leftovers.js` для управления состоянием остатков.
- `leftovers.router.js` определяет маршруты для страниц `Leftovers.vue` и `LeftoverEdit.vue`, что позволяет пользователю переходить между просмотром и редактированием остатков.
- `StockHistoryView.vue` также использует `leftovers.js` для отображения истории операций по остаткам.

Таким образом, `leftovers.js` служит центральным хранилищем данных, а маршруты, определенные в `leftovers.router.js`, связывают компоненты, обеспечивая навигацию и доступ к функционалу.

## Ключевые компоненты
1. **LeftoverEdit.vue**: Компонент для создания и редактирования остатков. Позволяет пользователю добавлять позиции, выбирать склад и управлять вариантами товаров.
2. **Leftovers.vue**: Основная страница для управления остатками, предоставляющая интерфейс для фильтрации, сортировки и выполнения действий с остатками.
3. **StockHistoryView.vue**: Компонент для отображения истории движения товара по складу, включая детали операций.
4. **leftovers.js**: Хранилище для управления состоянием остатков, включая методы для работы с API и локального управления состоянием.
5. **leftovers.router.js**: Конфигурация маршрутов для управления остатками, обеспечивающая навигацию между компонентами.

## Примеры использования
- **LeftoverEdit.vue**:
  ```javascript
  methods: {
    onSubmit() {
      // Логика для сохранения остатка
    },
    onDelete() {
      // Логика для удаления остатка
    }
  }
  ```

- **Leftovers.vue**:
  ```javascript
  methods: {
    openStockHistory() {
      // Логика для открытия истории остатков
    },
    handleAuditSave() {
      // Логика для сохранения аудита
    }
  }
  ```

- **StockHistoryView.vue**:
  ```javascript
  mounted() {
    this.loadHistory(); // Загрузка истории при монтировании компонента
  }
  ```

## Зависимости
- **LeftoverEdit.vue** и **Leftovers.vue** зависят от `store/products.js`.
- **StockHistoryView.vue** зависит от `store/leftovers.js`.
- **leftovers.js** использует `vue` для реактивного состояния и `axios` для работы с API.
- **leftovers.router.js** зависит от компонентов `Leftovers.vue` и `LeftoverEdit.vue` для маршрутизации.

Эта документация описывает архитектуру и взаимодействие файлов, а также их ключевые функции и зависимости, что позволяет разработчикам эффективно работать с проектом.

### Группа 3

## Обзор группы
Данная группа файлов представляет собой набор Vue-компонентов и хранилищ, предназначенных для управления товарами в приложении. Основные компоненты включают управление вариантами товара, ингредиентами и рекомендованными товарами. Все компоненты взаимодействуют друг с другом и используют централизованное хранилище для работы с данными.

## Архитектура и взаимодействие
Компоненты в данной группе имеют следующие взаимосвязи:

- **EditVariants.vue**: Основной компонент для управления вариантами товара. Он взаимодействует с хранилищем `variants.store.js` для получения и изменения данных о вариантах. Также он использует компонент `EditIngredients.vue` для редактирования связанных ингредиентов.
  
- **EditIngredients.vue**: Компонент для редактирования списка ингредиентов, который может быть вызван из `EditVariants.vue`. Он использует компонент `CardPosition.vue` для отображения информации о каждом ингредиенте.

- **EditRecommended.vue**: Компонент для управления рекомендованными товарами, который также использует `CardPosition.vue` для отображения информации о товарах.

- **CardPosition.vue**: Компонент, который отображает карточку товара и используется как в `EditIngredients.vue`, так и в `EditRecommended.vue`.

Все три компонента (`EditVariants.vue`, `EditIngredients.vue`, `EditRecommended.vue`) используют внешнее хранилище `store/products.js` для доступа к данным о продуктах.

## Ключевые компоненты
1. **EditVariants.vue**
   - Назначение: Управление вариантами товара (CRUD операции).
   - Зависимости: `variants.store.js`, `products.js`, `EditIngredients.vue`.

2. **variants.store.js**
   - Назначение: Централизованное хранилище для работы с вариантами товара через API.
   - Зависимости: `core.store.js`.

3. **EditIngredients.vue**
   - Назначение: Управление ингредиентами (добавление, редактирование, удаление).
   - Зависимости: `products.js`, `CardPosition.vue`.

4. **CardPosition.vue**
   - Назначение: Отображение карточки товара с информацией и действиями.
   - Зависимости: `PlaceholderImage.vue`.

5. **EditRecommended.vue**
   - Назначение: Управление рекомендованными товарами.
   - Зависимости: `products.js`, `CardPosition.vue`.

## Примеры использования
### Пример использования EditVariants.vue
```vue
<template>
  <EditVariants />
</template>

<script>
import EditVariants from '@/components/sections/EditVariants.vue';

export default {
  components: {
    EditVariants
  }
}
</script>
```

### Пример использования EditIngredients.vue
```vue
<template>
  <EditIngredients />
</template>

<script>
import EditIngredients from '@/components/sections/EditIngredients.vue';

export default {
  components: {
    EditIngredients
  }
}
</script>
```

### Пример использования EditRecommended.vue
```vue
<template>
  <EditRecommended />
</template>

<script>
import EditRecommended from '@/components/sections/EditRecommended.vue';

export default {
  components: {
    EditRecommended
  }
}
</script>
```

## Зависимости
- **Внутренние зависимости**:
  - `EditVariants.vue` → `variants.store.js`
  - `EditVariants.vue` → `EditIngredients.vue`
  - `EditIngredients.vue` → `CardPosition.vue`
  - `EditRecommended.vue` → `CardPosition.vue`

- **Внешние зависимости**:
  - Все компоненты используют `store/products.js` для доступа к данным о продуктах.
  
- **Использование в других файлах**:
  - `EditVariants.vue` и `EditRecommended.vue` используются в `ProductEdit.vue`.

### Группа 4

## Обзор группы
Данная группа файлов представляет собой модуль продуктов в приложении, реализованном на основе фреймворка Vue.js. Она включает в себя маршрутизацию, компоненты для отображения продуктов, их рекомендаций и взаимодействия с пользователем. Основные функции включают отображение информации о товарах, рекомендации на основе пользовательского ввода и управление корзиной.

## Архитектура и взаимодействие
Файлы в данной группе имеют четкие внутренние и внешние зависимости, что позволяет им эффективно взаимодействовать друг с другом. Основные компоненты, такие как `ProductRecommmendation.vue`, `SectionProduct.vue`, и `CardProduct.vue`, служат связующими звеньями между различными частями интерфейса.

- `router/products.router.js` управляет маршрутизацией и использует компоненты страниц, такие как `Products.vue`, `ProductEdit.vue`, и `Product.vue`.
- `ProductRecommmendation.vue` взаимодействует с `SectionProduct.vue` и `HeroRecommendation.vue`, предоставляя пользователю рекомендации на основе введенных данных.
- `SectionProduct.vue` отображает детальную информацию о товаре и использует компоненты, такие как `Image360.vue`, `THC.vue`, и `Price.vue`, для визуализации данных о продукте.
- `CardProduct.vue` используется в компонентах `ProductsPopular.vue` и `ProductsRecommended.vue`, что позволяет отображать карточки товаров в различных контекстах.

## Ключевые компоненты
1. **products.router.js**: Определяет маршруты для работы с продуктами, включая страницы для просмотра, редактирования и рекомендаций.
2. **ProductRecommmendation.vue**: Компонент для отображения рекомендаций продуктов на основе пользовательского ввода.
3. **SectionProduct.vue**: Предоставляет детальную информацию о товаре, включая изображения и цену.
4. **HeroRecommendation.vue**: Интерфейс для ввода настроения пользователя, на основе которого AI подбирает продукты.
5. **CardProduct.vue**: Отображает карточку товара с основной информацией и действиями.
6. **ProductsPopular.vue** и **ProductsRecommended.vue**: Компоненты для отображения популярных и рекомендуемых товаров соответственно.

## Примеры использования
### Пример маршрутизации
```javascript
import { createProductRoutes } from './products.router.js';

const routes = createProductRoutes();
```

### Пример компонента рекомендаций
```vue
<template>
  <div>
    <HeroRecommendation @submit="submitInput" />
    <SectionProduct v-if="recommendedProduct" :product="recommendedProduct" />
  </div>
</template>

<script>
import HeroRecommendation from './HeroRecommendation.vue';
import SectionProduct from './SectionProduct.vue';

export default {
  components: { HeroRecommendation, SectionProduct },
  data() {
    return {
      recommendedProduct: null,
    };
  },
  methods: {
    submitInput(mood) {
      // Логика для получения рекомендаций на основе настроения
    },
  },
};
</script>
```

### Пример карточки товара
```vue
<template>
  <CardProduct v-for="product in products" :key="product.id" :product="product" />
</template>

<script>
import CardProduct from './CardProduct.vue';

export default {
  components: { CardProduct },
  data() {
    return {
      products: [], // Список продуктов
    };
  },
};
</script>
```

## Зависимости
- **Внутренние зависимости**:
  - `router/products.router.js` → `components/pages/ProductRecommmendation.vue`
  - `ProductRecommmendation.vue` → `SectionProduct.vue`, `HeroRecommendation.vue`
  - `SectionProduct.vue` → `Image360.vue`, `THC.vue`, `Price.vue`
  - `CardProduct.vue` → `THC.vue`, `Price.vue`
  - `ProductsPopular.vue` и `ProductsRecommended.vue` → `CardProduct.vue`

- **Внешние зависимости**:
  - `products.router.js` использует `Products.vue`, `ProductEdit.vue`, `Product.vue`
  - `ProductRecommmendation.vue` и `HeroRecommendation.vue` используют `store/products.js`
  - `SectionProduct.vue` использует `ProductImages.vue`

