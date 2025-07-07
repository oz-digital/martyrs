import layoutEmpty from '@martyrs/src/modules/globals/views/components/layouts/Empty.vue';
import NotFound from '@martyrs/src/modules/globals/views/components/pages/404.vue'; // Предполагаемый компонент 404

function addRoutes(router, config) {
  const {
    basePath, // Путь для корневого или промежуточного маршрута
    parentName, // Имя существующего родительского маршрута (опционально)
    routes, // Массив маршрутов
    routeNamePrefix = '', // Префикс для имен маршрутов
    filterConfig = {}, // Конфигурация фильтрации
    meta = {}, // Мета-данные для маршрутов
    component = layoutEmpty, // Компонент по умолчанию (layout)
    emptyRootBehavior = {
      // Поведение для пустого корневого маршрута
      type: 'redirect', // 'redirect' или 'fallback'
      fallbackComponent: NotFound, // Компонент для заглушки, если type: 'fallback'
      redirectPath: '/404', // Пользовательский путь для редиректа (опционально)
    },
  } = config;

  const { include = [], exclude = [], match } = filterConfig;

  // Рекурсивная функция для обработки маршрутов и их вложенных children
  function processRoutes(routesArray, prefix = routeNamePrefix) {
    return routesArray
      .filter(route => {
        if (include.length > 0 && !include.includes(route.name)) return false;
        if (exclude.length > 0 && exclude.includes(route.name)) return false;
        if (match && !match(route)) return false;
        return true;
      })
      .map(route => {
        const processedRoute = {
          ...route,
          name: `${prefix}${route.name}`,
          meta: { ...meta, ...route.meta },
        };
        if (route.children && Array.isArray(route.children)) {
          processedRoute.children = processRoutes(route.children, prefix);
        }
        return processedRoute;
      });
  }

  // Обрабатываем маршруты
  const filteredRoutes = processRoutes(routes);
  const hasRootRoute = filteredRoutes.some(route => route.path === '');

  // Определяем дочерние маршруты с учётом поведения для пустого корня
  let finalChildren = filteredRoutes;
  if (!hasRootRoute && filteredRoutes.length > 0) {
    if (emptyRootBehavior.type === 'redirect') {
      // Используем пользовательский redirectPath или первый дочерний маршрут
      const redirectTo = emptyRootBehavior.redirectPath || filteredRoutes[0].path;
      finalChildren = [{ path: '', redirect: redirectTo, meta: { ...meta, isAutoRedirect: true } }, ...filteredRoutes];
    } else if (emptyRootBehavior.type === 'fallback') {
      finalChildren = [
        {
          path: '',
          component: emptyRootBehavior.fallbackComponent || NotFound,
          meta: { ...meta, isFallback: true },
        },
        ...filteredRoutes,
      ];
    }
  }

  if (parentName) {
    const parentRoute = router.getRoutes().find(route => route.name === parentName);
    if (!parentRoute) {
      throw new Error(`Родительский маршрут "${parentName}" не найден`);
    }

    if (basePath) {
      console.log('addRoutes: Adding intermediate route', `${routeNamePrefix}${basePath.charAt(0).toUpperCase() + basePath.slice(1)}Intermediate`, 'to parent', parentName);
      console.log('Routes before adding:', router.getRoutes().filter(r => r.name && r.name.includes('OrganizationOrders')).map(r => r.name));
      const intermediateRoute = {
        path: basePath,
        component,
        name: `${routeNamePrefix}${basePath.charAt(0).toUpperCase() + basePath.slice(1)}Intermediate`,
        meta,
        children: finalChildren,
      };
      router.addRoute(parentName, intermediateRoute);
      console.log('Routes after adding:', router.getRoutes().filter(r => r.name && r.name.includes('OrganizationOrders')).map(r => r.name));
    } else {
      filteredRoutes.forEach(route => {
        router.addRoute(parentName, route);
      });
    }
  } else if (basePath) {
    const rootRouteName = `${routeNamePrefix}Root`;
    const existingRoute = router.getRoutes().find(route => route.name === rootRouteName);
    if (existingRoute) {
      throw new Error(`Маршрут "${rootRouteName}" уже существует`);
    }

    const rootRoute = {
      path: basePath,
      component,
      name: rootRouteName,
      meta,
      children: finalChildren,
    };
    router.addRoute(rootRoute);
  } else {
    throw new Error('Необходимо указать basePath');
  }
}

export default addRoutes;
