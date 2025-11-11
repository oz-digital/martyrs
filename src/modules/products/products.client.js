// Router
import addRoutes from '@martyrs/src/modules/core/views/router/addRoutes.js';
import { getRoutes as getProductRoutes } from './router/products.router.js';
import { getRoutes as getCategoryRoutes } from './router/categories.router.js';

//Store
import * as storeCategories from './store/categories.js';
import * as storeProducts from './store/products.js';

// Layouts

// Blocks
import CardCategory from './components/blocks/CardCategory.vue';
import CardPosition from './components/blocks/CardPosition.vue';
import CardProduct from './components/blocks/CardProduct.vue';
import Image360 from './components/elements/Image360.vue';
import ProductImages from './components/blocks/ProductImages.vue';

// Sections
import EditVariants from './components/sections/EditVariants.vue';
import FilterProducts from './components/sections/FilterProducts.vue';
import HeroRecommendation from './components/sections/HeroRecommendation.vue';
import ProductsPopular from './components/sections/ProductsPopular.vue';
import SectionProduct from './components/sections/SectionProduct.vue';

// Elements
import Price from './components/elements/Price.vue';
// Pages
import Product from './components/pages/Product.vue';
import ProductEdit from './components/pages/ProductEdit.vue';
import ProductRecommendation from './components/pages/ProductRecommmendation.vue';
import Products from './components/pages/Products.vue';

// Пример функции инициализации для модуля продуктов
function initializeProducts(app, store, router, options = {}) {
  const productRoutes = getProductRoutes(options);
  productRoutes.forEach(({ parentName, config }) => {
    addRoutes(router, { ...config, parentName });
  });

  const categoryRoutes = getCategoryRoutes(options);
  categoryRoutes.forEach(({ parentName, config }) => {
    addRoutes(router, { ...config, parentName });
  });

  store.addStore('categories', storeCategories);
  store.addStore('products', storeProducts);
}

const ModuleProducts = {
  initialize: initializeProducts,
  views: {
    store: {
      storeCategories,
      storeProducts,
    },
    router: {
      getProductRoutes,
      getCategoryRoutes,
    },
    components: {
      // Elements
      Price,
      // Blocks
      ProductImages,
      CardCategory,
      CardProduct,
      Image360,
      CardPosition,
      // Sections
      SectionProduct,
      HeroRecommendation,
      FilterProducts,
      EditVariants,
      ProductsPopular,
      // Pages
      Product,
      ProductEdit,
      ProductRecommendation,
      Products,
      // Layouts
    },
  },
};

export {
  CardCategory,
  CardPosition,
  CardProduct,
  EditVariants,
  FilterProducts,
  HeroRecommendation,
  Image360,
  // Blocks
  ProductImages,
  ProductsPopular,
  // Elements
  Price,
  // Pages
  Product,
  ProductEdit,
  ProductRecommendation,
  Products,
  // Sections
  SectionProduct,
  // Store
  storeProducts,
  storeCategories,
};

export default ModuleProducts;
