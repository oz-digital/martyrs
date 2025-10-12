// products.meta.js
// Meta-файл для регистрации роутов модуля products
// Содержит полное описание всех роутов с lazy-loading компонентов

export function getRoutes(options = {}) {
  const route = options.route || 'Home';
  const routeBackoffice = options.routeBackoffice || 'Backoffice Root';
  const routeOrganizations = options.routeOrganizations || 'OrganizationRoot';
  
  const routes = [];
  
  // 1. Products в Home - публичные роуты для просмотра и покупки товаров
  routes.push({
    parentName: route,
    config: {
      basePath: 'products',
      routes: [
        {
          path: '',
          name: 'Products',
          meta: {
            title: {
              en: 'Products',
              ru: 'Товары',
            },
          },
          component: () => import(/* webpackChunkName: 'products-list' */ './components/pages/Products.vue'),
        },
        {
          path: 'categories/:categoryPath(.*)',
          name: 'ProductsCategory',
          meta: {
            title: {
              en: 'Products',
              ru: 'Товары',
            },
          },
          component: () => import(/* webpackChunkName: 'products-list' */ './components/pages/Products.vue'),
        },
        {
          path: 'add',
          name: 'ProductAdd',
          meta: {
            title: {
              en: 'Add Product',
              ru: 'Добавить товар',
            },
          },
          component: () => import(/* webpackChunkName: "products-edit" */ './components/pages/ProductEdit.vue'),
        },
        {
          path: ':product',
          name: 'Product',
          meta: {
            title: {
              en: 'Product',
              ru: 'Продукт',
            },
            showShopCart: true,
          },
          component: () => import(/* webpackChunkName: "products-detail" */ './components/pages/Product.vue'),
        },
        {
          path: ':product/edit',
          name: 'ProductEdit',
          meta: {
            title: {
              en: 'Edit Product',
              ru: 'Редактировать продукт',
            },
          },
          beforeEnter: [
            () => import(/* webpackChunkName: "auth-validation" */ '@martyrs/src/modules/auth/views/middlewares/auth.validation.js').then(m => m.requiresAuth),
          ],
          component: () => import(/* webpackChunkName: "products-edit" */ './components/pages/ProductEdit.vue'),
        },
        {
          path: 'recommendation',
          name: 'ProductRecommmendation',
          meta: {
            title: {
              en: 'Product Recommmendation',
              ru: 'Рекомендации продукта',
            },
            header_theme: 'dark',
            footer_theme: 'dark',
          },
          component: () => import(/* webpackChunkName: 'products-recommendation' */ './components/pages/ProductRecommmendation.vue'),
          props: route => ({ mood: route.query.mood }),
        },
      ],
    }
  });
  
  // 2. Products в Organizations - товары организации

  routes.push({
    parentName: routeOrganizations,
    config: {
      basePath: 'products',
      routes: [
        {
          path: '',
          name: 'Organization_Products',
          meta: {
            title: {
              en: 'Products',
              ru: 'Товары',
            },
            context: 'organization',
          },
          component: () => import(/* webpackChunkName: 'products-list' */ './components/pages/Products.vue'),
        },
        {
          path: 'categories/:categoryPath(.*)',
          name: 'Organization_ProductsCategory',
          meta: {
            title: {
              en: 'Products',
              ru: 'Товары',
            },
            context: 'organization',
          },
          component: () => import(/* webpackChunkName: 'products-list' */ './components/pages/Products.vue'),
        },
        {
          path: 'add',
          name: 'Organization_ProductAdd',
          meta: {
            title: {
              en: 'Add Product',
              ru: 'Добавить товар',
            },
            context: 'organization',
          },
          component: () => import(/* webpackChunkName: "products-edit" */ './components/pages/ProductEdit.vue'),
        },
        {
          path: ':product',
          name: 'Organization_Product',
          meta: {
            title: {
              en: 'Product',
              ru: 'Продукт',
            },
            showShopCart: true,
            context: 'organization',
          },
          component: () => import(/* webpackChunkName: "products-detail" */ './components/pages/Product.vue'),
        },
        {
          path: ':product/edit',
          name: 'Organization_ProductEdit',
          meta: {
            title: {
              en: 'Edit Product',
              ru: 'Редактировать продукт',
            },
            context: 'organization',
          },
          beforeEnter: [
            () => import(/* webpackChunkName: "auth-validation" */ '@martyrs/src/modules/auth/views/middlewares/auth.validation.js').then(m => m.requiresAuth),
          ],
          component: () => import(/* webpackChunkName: "products-edit" */ './components/pages/ProductEdit.vue'),
        },
        {
          path: 'recommendation',
          name: 'Organization_ProductRecommmendation',
          meta: {
            title: {
              en: 'Product Recommmendation',
              ru: 'Рекомендации продукта',
            },
            header_theme: 'dark',
            footer_theme: 'dark',
            context: 'organization',
          },
          component: () => import(/* webpackChunkName: 'products-recommendation' */ './components/pages/ProductRecommmendation.vue'),
          props: route => ({ mood: route.query.mood }),
        },
      ],
    }
  });
  
  // Categories для Organizations
  routes.push({
    parentName: routeOrganizations,
    config: {
      basePath: 'categories',
      routes: [
        {
          path: '',
          name: 'Categories',
          meta: {
            title: {
              en: 'Categories',
              ru: 'Категории',
            },
            context: 'organization',
          },
          component: () => import(/* webpackChunkName: 'categories' */ './components/pages/Categories.vue'),
        },
        {
          path: 'add',
          name: 'Category Add',
          meta: {
            title: {
              en: 'Add Category',
              ru: 'Добавить Категорию',
            },
            context: 'organization',
          },
          component: () => import(/* webpackChunkName: 'category-edit' */ './components/pages/CategoryEdit.vue'),
        },
        {
          path: ':category/edit',
          name: 'Category Edit',
          meta: {
            title: {
              en: 'Edit Category',
              ru: 'Редактировать Категорию',
            },
            context: 'organization',
          },
          beforeEnter: [
            () => import(/* webpackChunkName: "auth-validation" */ '@martyrs/src/modules/auth/views/middlewares/auth.validation.js').then(m => m.requiresAuth),
          ],
          component: () => import(/* webpackChunkName: 'category-edit' */ './components/pages/CategoryEdit.vue'),
        }
      ]
    }
  });
  
  // 3. Products в Backoffice - административные функции
  if (!options.withBackoffice) {
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: 'products',
        routes: [
          {
            path: '',
            name: 'BackofficeProducts',
            meta: {
              title: {
                en: 'Products Management',
                ru: 'Управление товарами',
              },
              context: 'backoffice',
            },
            component: () => import(/* webpackChunkName: 'products-backoffice' */ './components/pages/Products.vue'),
          },
          {
            path: 'add',
            name: 'BackofficeProductAdd',
            meta: {
              title: {
                en: 'Add Product',
                ru: 'Добавить товар',
              },
              context: 'backoffice',
            },
            component: () => import(/* webpackChunkName: "products-backoffice-edit" */ './components/pages/ProductEdit.vue'),
          },
          {
            path: ':product/edit',
            name: 'BackofficeProductEdit',
            meta: {
              title: {
                en: 'Edit Product',
                ru: 'Редактировать товар',
              },
              context: 'backoffice',
            },
            component: () => import(/* webpackChunkName: "products-backoffice-edit" */ './components/pages/ProductEdit.vue'),
          },
        ],
      }
    });
    
    // Categories в Backoffice
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: 'categories',
        routes: [
          {
            path: '',
            name: 'BackofficeCategories',
            meta: {
              title: {
                en: 'Categories Management',
                ru: 'Управление категориями',
              },
              context: 'backoffice',
            },
            component: () => import(/* webpackChunkName: 'categories-backoffice' */ './components/pages/Categories.vue'),
          },
          {
            path: 'add',
            name: 'BackofficeCategoryAdd',
            meta: {
              title: {
                en: 'Add Category',
                ru: 'Добавить категорию',
              },
              context: 'backoffice',
            },
            component: () => import(/* webpackChunkName: 'category-backoffice-edit' */ './components/pages/CategoryEdit.vue'),
          },
          {
            path: ':category/edit',
            name: 'BackofficeCategoryEdit',
            meta: {
              title: {
                en: 'Edit Category',
                ru: 'Редактировать категорию',
              },
              context: 'backoffice',
            },
            component: () => import(/* webpackChunkName: 'category-backoffice-edit' */ './components/pages/CategoryEdit.vue'),
          },
        ],
      }
    });
  }
  
  return routes;
}