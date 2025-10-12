import * as validationAuth from '@martyrs/src/modules/auth/views/middlewares/auth.validation.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js';

const { hasAccess, isAdmin } = useGlobalMixins();

export function getRoutes(options = {}) {
  const route = options.route || 'Home';
  const routeBackoffice = options.routeBackoffice || 'Backoffice Root';
  const routeOrganizations = options.routeOrganizations || 'OrganizationRoot';

  const routes = [];

  // Home контекст
  routes.push({
    parentName: route,
    config: {
      basePath: options.basePath || 'products',
      meta: {
        title: {
          en: 'Products',
          ru: 'Товары',
        },
      },
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
          component: () => import(/* webpackChunkName: 'products-list' */ '../components/pages/Products.vue'),
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
          component: () => import(/* webpackChunkName: 'products-list' */ '../components/pages/Products.vue'),
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
          beforeEnter: [validationAuth.requiresAuth],
          component: () => import(/* webpackChunkName: "products-edit" */ '../components/pages/ProductEdit.vue'),
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
          component: () => import(/* webpackChunkName: "products-detail" */ '../components/pages/Product.vue'),
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
          beforeEnter: [validationAuth.requiresAuth],
          component: () => import(/* webpackChunkName: "products-edit" */ '../components/pages/ProductEdit.vue'),
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
          component: () => import(/* webpackChunkName: 'products-recommendation' */ '../components/pages/ProductRecommmendation.vue'),
          props: route => ({ mood: route.query.mood }),
        },
      ],
    },
  });

  // Backoffice контекст
  if (!options.withBackoffice) {
    routes.push({
      parentName: routeBackoffice,
      config: {
        basePath: options.backofficeBasePath || 'products',
        routeNamePrefix: 'Backoffice',
        meta: {
          title: {
            en: 'Products',
            ru: 'Товары',
          },
          context: 'backoffice',
        },
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
            component: () => import(/* webpackChunkName: 'products-backoffice' */ '../components/pages/Products.vue'),
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
            beforeEnter: [
              validationAuth.requiresAuth,
              (to, from, next) => {
                if (isAdmin(auth.state.access.roles)) {
                  next();
                } else {
                  next('/401');
                }
              }
            ],
            component: () => import(/* webpackChunkName: "products-backoffice-edit" */ '../components/pages/ProductEdit.vue'),
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
            component: () => import(/* webpackChunkName: "products-backoffice-detail" */ '../components/pages/Product.vue'),
          },
          {
            path: ':product/edit',
            name: 'ProductEdit',
            meta: {
              title: {
                en: 'Edit Product',
                ru: 'Редактировать товар',
              },
            },
            beforeEnter: [
              validationAuth.requiresAuth,
              (to, from, next) => {
                if (isAdmin(auth.state.access.roles)) {
                  next();
                } else {
                  next('/401');
                }
              }
            ],
            component: () => import(/* webpackChunkName: "products-backoffice-edit" */ '../components/pages/ProductEdit.vue'),
          },
        ],
      },
    });
  }

  // Organizations контекст
  if (!options.withOrganizationRoutes) {
    routes.push({
      parentName: routeOrganizations,
      config: {
        basePath: options.organizationBasePath || 'products',
        routeNamePrefix: 'Organization_',
        meta: {
          title: {
            en: 'Organization Products',
            ru: 'Товары Организации',
          },
          context: 'organization',
        },
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
            component: () => import(/* webpackChunkName: 'products-list' */ '../components/pages/Products.vue'),
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
            component: () => import(/* webpackChunkName: 'products-list' */ '../components/pages/Products.vue'),
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
            beforeEnter: [
              validationAuth.requiresAuth,
              (to, from, next) => {
                if (isAdmin(auth.state.access.roles) || hasAccess(to.params._id, 'products', 'create', auth.state.accesses, auth.state.access.roles)) {
                  next();
                } else {
                  next('/401');
                }
              }
            ],
            component: () => import(/* webpackChunkName: "products-edit" */ '../components/pages/ProductEdit.vue'),
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
            component: () => import(/* webpackChunkName: "products-detail" */ '../components/pages/Product.vue'),
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
              validationAuth.requiresAuth,
              (to, from, next) => {
                if (isAdmin(auth.state.access.roles) || hasAccess(to.params._id, 'products', 'edit', auth.state.accesses, auth.state.access.roles)) {
                  next();
                } else {
                  next('/401');
                }
              }
            ],
            component: () => import(/* webpackChunkName: "products-edit" */ '../components/pages/ProductEdit.vue'),
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
            component: () => import(/* webpackChunkName: 'products-recommendation' */ '../components/pages/ProductRecommmendation.vue'),
            props: route => ({ mood: route.query.mood }),
          },
        ],
      },
    });
  }

  return routes;
}

export default { getRoutes };
