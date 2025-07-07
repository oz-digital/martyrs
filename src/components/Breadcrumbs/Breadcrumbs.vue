<template>
  <ol 
    class="
      breadcrumbs
      flex-row
      flex-nowrap
      flex-left
      flex
    " 
    aria-label="breadcrumbs"
  >
    <li 
      v-for="(item, index) in breadcrumbs" 
      :key="index" 
      class="
        flex-v-center
        flex-nowrap
        flex
      " 
      :class="{ 't-main': index === breadcrumbs.length - 1 }"
    >
      <!-- Home -->
      <svg 
        v-if="index === 0"
        class="i-small mn-r-thin" 
        viewBox="0 0 10 9" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="rgb(var(--black))" d="M0.494141 4.26391C0.494141 4.48862 0.659906 4.66912 0.928813 4.66912C1.05037 4.66912 1.16825 4.6065 1.27139 4.52177L1.64344 4.20866V7.56448C1.64344 8.13545 1.98971 8.47803 2.5791 8.47803H7.56678C8.15616 8.47803 8.50243 8.13545 8.50243 7.56448V4.19392L8.8929 4.52177C8.99604 4.6065 9.11392 4.66912 9.23916 4.66912C9.48597 4.66912 9.67015 4.5144 9.67015 4.27128C9.67015 4.1313 9.61121 4.01343 9.5007 3.92133L8.50243 3.08146V1.47538C8.50243 1.30961 8.3956 1.1991 8.22984 1.1991H7.63308C7.46732 1.1991 7.35313 1.30961 7.35313 1.47538V2.11634L5.66969 0.70181C5.31606 0.403433 4.85928 0.403433 4.50197 0.70181L0.663589 3.92133C0.553079 4.01711 0.494141 4.14235 0.494141 4.26391ZM6.13752 5.26219C6.13752 5.08906 6.02701 4.97855 5.85387 4.97855H4.31779C4.14097 4.97855 4.02678 5.08906 4.02678 5.26219V7.63447H2.83327C2.60856 7.63447 2.48332 7.50922 2.48332 7.28084V3.5014L4.90349 1.47538C5.01768 1.37592 5.15029 1.37592 5.26817 1.47538L7.66255 3.48298V7.28084C7.66255 7.50922 7.53731 7.63447 7.3126 7.63447H6.13752V5.26219Z"/>
      </svg>

      <router-link v-if="index !== breadcrumbs.length - 1" :to="item.path">
        {{ item.name }}
      </router-link>

      <a v-else>
        {{ item.name }}
      </a>

      <!-- Arrow -->
      <svg 
        v-if="index !== breadcrumbs.length - 1"
        class="i-small chevron" 
        viewBox="0 0 4 8" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        >
        <path d="M4 3.99992C4 3.83673 3.94307 3.70391 3.81025 3.57867L0.899431 0.732369C0.800759 0.629902 0.679317 0.580566 0.531309 0.580566C0.239089 0.580566 0 0.815861 0 1.10808C0 1.25229 0.0607211 1.38512 0.166983 1.49138L2.74763 3.99613L0.166983 6.50846C0.0607211 6.61093 0 6.74375 0 6.89176C0 7.18398 0.239089 7.41928 0.531309 7.41928C0.675522 7.41928 0.800759 7.36994 0.899431 7.26747L3.81025 4.42117C3.94307 4.29594 4 4.15931 4 3.99992Z" fill="rgb(var(--black))"/>
      </svg>
      
    </li>
  </ol>
</template>

<script setup>
/**
 * Компонент Breadcrumbs с автоматическим построением на основе роутов
 * 
 * Примеры настройки роутов:
 * 
 * 1. Базовое использование:
 * {
 *   path: '/products',
 *   name: 'Products',
 *   meta: { title: 'Продукты' }
 * }
 * 
 * 2. Скрытие роута из хлебных крошек:
 * {
 *   path: '/admin',
 *   meta: { breadcrumbs: { hide: true } }
 * }
 * 
 * 3. Связывание с предыдущим роутом:
 * {
 *   path: '/products/:id',
 *   meta: { breadcrumbs: { linkToPrevious: true } }
 * }
 * 
 * 4. Кастомное имя:
 * {
 *   path: '/settings',
 *   meta: {
 *     breadcrumbs: {
 *       name: { ru: 'Настройки', en: 'Settings' }
 *     }
 *   }
 * }
 */
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();

const breadcrumbs = ref([]);

// Настройки компонента
const props = defineProps({
  homeName: {
    type: [String, Object],
    default: 'Home'
  },
  debug: {
    type: Boolean,
    default: false
  }
});

// Построение пути для конкретного роута
function buildRoutePath(matched, index, params) {
  // Для корневого роута
  if (index === 0 && matched[0].path === '/') {
    return '/';
  }
  
  // Собираем путь из всех предыдущих сегментов
  const segments = [];
  
  for (let i = 0; i <= index; i++) {
    const route = matched[i];
    // Получаем только сегмент текущего роута без родительских путей
    const routeSegments = route.path.split('/').filter(Boolean);
    
    // Если это не корневой роут, добавляем только новые сегменты
    if (i > 0) {
      const parentPath = matched[i - 1].path.split('/').filter(Boolean);
      const newSegments = routeSegments.slice(parentPath.length);
      segments.push(...newSegments);
    } else {
      segments.push(...routeSegments);
    }
  }
  
  // Заменяем параметры на реальные значения
  const processedSegments = segments.map(segment => {
    if (segment.startsWith(':')) {
      const paramName = segment.replace(/[:?]/g, '');
      return params[paramName] || '';
    }
    return segment;
  }).filter(Boolean);
  
  return '/' + processedSegments.join('/');
}

// Получение имени для хлебной крошки
function getBreadcrumbName(routeMeta, routeName, params) {
  const currentLocale = locale?.value;
  
  // Приоритет: meta.breadcrumbs.name > meta.title > routeName
  let name;
  
  if (routeMeta?.breadcrumbs?.name) {
    name = typeof routeMeta.breadcrumbs.name === 'object' && currentLocale
      ? routeMeta.breadcrumbs.name[currentLocale]
      : routeMeta.breadcrumbs.name;
  } else if (routeMeta?.title) {
    name = typeof routeMeta.title === 'object' && currentLocale
      ? routeMeta.title[currentLocale]
      : routeMeta.title;
  } else {
    name = routeName || '';
  }
  
  // Если имя содержит параметры, заменяем их
  if (name && typeof name === 'string') {
    Object.keys(params).forEach(key => {
      name = name.replace(`:${key}`, params[key]);
    });
  }
  
  return name;
}

// Обновление хлебных крошек
function updateBreadcrumbs() {
  const matched = route.matched;
  const result = [];
  const isHome = matched.length === 1 && matched[0].path === '/';
  
  for (let i = 0; i < matched.length; i++) {
    const r = matched[i];
    
    // Пропускаем корневой роут если это не единственный роут
    if (r.path === '/' && !isHome) {
      continue;
    }
    
    // Проверяем, нужно ли скрыть этот роут
    if (r.meta?.breadcrumbs?.hide) {
      continue;
    }
    
    // Проверяем, нужно ли связать с предыдущим
    if (r.meta?.breadcrumbs?.linkToPrevious && result.length > 0) {
      // Обновляем путь предыдущего элемента на текущий
      const prevItem = result[result.length - 1];
      prevItem.path = buildRoutePath(matched, i, route.params);
      continue;
    }
    
    const name = getBreadcrumbName(r.meta, r.name, route.params);
    
    if (name) {
      result.push({
        name,
        path: buildRoutePath(matched, i, route.params)
      });
    }
  }
  
  // Добавляем домашнюю страницу, если её нет и мы не на главной
  if (result.length > 0 && !isHome && result[0].name !== 'Home') {
    const homeName = typeof props.homeName === 'object' && locale?.value
      ? props.homeName[locale.value]
      : props.homeName;
      
    result.unshift({
      name: homeName,
      path: '/'
    });
  }
  
  // Отладочная информация
  if (props.debug) {
    console.log('Breadcrumbs Debug:', {
      currentPath: route.path,
      params: route.params,
      matched: matched.map(r => ({
        path: r.path,
        name: r.name,
        meta: r.meta
      })),
      result
    });
  }
  
  breadcrumbs.value = result;
}

// Следим за изменениями роута
watch(
  () => [route.path, route.params, locale.value],
  () => {
    updateBreadcrumbs();
  },
  { immediate: true }
);
</script>

<style lang='scss'>
.breadcrumbs { 
  height: 4rem;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;

  .home {
    height: 1rem;
  }

  .chevron {
    height: 0.75rem;
  }

  a {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;

    span {
      margin-left: 0.5rem;
      margin-right: 0.5rem;
    }
  }

  .router-link-exact-active:last-of-type {
    span {
      color: #00ff88;
    } 
  }
}
</style>