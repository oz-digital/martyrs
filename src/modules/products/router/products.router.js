import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';

export function createProductRoutes(prefix = '', options = {}) {
  const nameWithPrefix = name => (prefix ? `${prefix}${name}` : name);

  const routes = {
    path: options.basePath || 'products',
    children: [
      {
        path: '',
        name: nameWithPrefix('Products'),
        meta: {
          title: {
            en: 'Products',
            ru: 'Товары',
          },
          authorize: options.productsAuthorize || [],
        },
        component: () => import(/* webpackChunkName: 'Products' */ '@martyrs/src/modules/products/components/pages/Products.vue'),
      },
      {
        path: 'categories/:categoryPath(.*)',
        name: nameWithPrefix('ProductsCategory'),
        meta: {
          title: {
            en: 'Products',
            ru: 'Товары',
          },
          authorize: options.productsAuthorize || [],
        },
        component: () => import(/* webpackChunkName: 'Products' */ '@martyrs/src/modules/products/components/pages/Products.vue'),
      },
      {
        path: 'add',
        name: nameWithPrefix('ProductAdd'),
        meta: {
          title: {
            en: 'Add Product',
            ru: 'Добавить товар',
          },
          authorize: options.addProductAuthorize || [],
        },
        component: () => import('@martyrs/src/modules/products/components/pages/ProductEdit.vue'),
      },
      {
        path: ':product',
        name: nameWithPrefix('Product'),
        meta: {
          title: {
            en: 'Product',
            ru: 'Продукт',
          },
          showShopCart: true,
        },
        component: () => import('@martyrs/src/modules/products/components/pages/Product.vue'),
      },
      {
        path: ':product/edit',
        name: nameWithPrefix('ProductEdit'),
        meta: {
          title: {
            en: 'Edit Product',
            ru: 'Редактировать продукт',
          },
          authorize: options.editProductAuthorize || [],
        },
        beforeEnter: [validationAuth.requiresAuth],
        component: () => import('@martyrs/src/modules/products/components/pages/ProductEdit.vue'),
      },
      {
        path: 'recommendation',
        name: nameWithPrefix('ProductRecommmendation'),
        meta: {
          title: {
            en: 'Product Recommmendation',
            ru: 'Рекомендации продукта',
          },
          header_theme: 'dark',
          footer_theme: 'dark',
        },
        component: () => import(/* webpackChunkName: 'Product Recommmendation' */ '@martyrs/src/modules/products/components/pages/ProductRecommmendation.vue'),
        props: route => ({ mood: route.query.mood }),
      },
    ],
  };

  return routes;
}
