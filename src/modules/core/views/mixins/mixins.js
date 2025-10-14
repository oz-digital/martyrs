import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js';
import { inject } from 'vue';

// useGlobalMixins.js
export function useGlobalMixins() {
  const isModuleInstalled = (moduleName) => {
    const store = inject('store');
    const options = store.core.state.options;

    if (options && typeof options === 'object') {
      return Object.prototype.hasOwnProperty.call(options, moduleName);
    }

    return false;
  };
  const isAdmin = roles => {
    if (roles) {
      const isAdmin = roles.includes('ROLE_ADMIN') ? roles.includes('ROLE_ADMIN') : false;

      if (isAdmin !== true) {
        return false;
      }

      return true;
    } else {
      return false;
    }
  };

  const hasAccess = (organizationId, rightCategory = null, rightType = null, accesses, roles) => {
    // Если пользователь админ, то сразу даем доступ
    if (isAdmin(roles)) {
      return true;
    }

    const accessArray = accesses;

    // Проверяем существование записи для организации
    const organizationAccess = accessArray.find(access => access.organization === organizationId);

    // Если переданы только organizationId и accesses - проверяем только членство
    if (rightCategory === null && rightType === null) {
      return Boolean(organizationAccess); // если организация найдена - значит член
    }

    // Для проверки прав сначала проверяем существование организации
    if (!organizationAccess) {
      return false;
    }

    const categoryAccess = organizationAccess.rights[rightCategory];
    if (!categoryAccess) {
      return false;
    }
    return categoryAccess[rightType] === true;
  };

  const returnCurrency = () => {
    const store = useStore();
    const currency = store.core.state.options?.currency || '$';
    return currency;
  };

  const formatPrice = number => {
    try {
      if (number == null) {
        throw new TypeError('formatPrice: ожидается число, но получено null или undefined');
      }

      const currency = returnCurrency();
      const absNumber = Math.abs(number)
        .toFixed(2)
        .replace('.', ',')
        .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

      const sign = number < 0 ? '-' : '';
      return `${sign} ${currency}${absNumber}`;
    } catch (err) {
      console.error(err);
      return 'null';
    }
  };
  
  const replaceClasses = (original = '', map = null) => {
    if (map == null && typeof original !== 'string') return '';
    if (typeof map === 'string') {
      const orig = typeof original === 'string' ? original.trim().split(/\s+/) : [];
      const next = map.trim().split(/\s+/);
      const replaceSet = new Set(next);
      const replaced = orig.map(cls => (replaceSet.has(cls) ? next.find(c => c !== cls) || cls : cls));
      const extra = next.filter(c => !orig.includes(c));
      return [...new Set([...replaced, ...extra])].join(' ');
    }

    if (typeof map === 'object' && map !== null) {
      const orig = typeof original === 'string' ? original.trim().split(/\s+/) : [];
      return orig.map(cls => map[cls] ?? cls).join(' ');
    }

    return typeof original === 'string' ? original.trim() : '';
  };
    

  const formatDate = (d, options = {}) => {
    var fixedDate = new Date(d);

    // Определяем параметры локализации
    const formatOptions = {
      year: 'numeric',
      month: 'long', // название месяца
      day: '2-digit', // день с ведущим нулем
      hour: '2-digit', // часы с ведущим нулем
      minute: '2-digit', // минуты с ведущим нулем
      hour12: false, // 24-часовой формат времени
      ...options, // дополнительные настройки
    };

    // Язык, по умолчанию "ru" (русский)
    const locale = options.language || 'ru';

    // Используем Intl.DateTimeFormat для локализации
    const dateFormatter = new Intl.DateTimeFormat(locale, formatOptions);

    var format = {
      dateOnly: options.dateOnly || false,
      timeOnly: options.timeOnly || false,
      dayMonth: options.dayMonth || false,
      dayTime: options.dayTime || false,
      monthYear: options.monthYear || false,
      yearOnly: options.yearOnly || false,
      custom: options.custom || '',
      monthName: options.monthName || false, // Новый параметр для вывода названия месяца
      language: options.language || 'ru', // Язык, по умолчанию русский
    };

    if (format.dateOnly) {
      return dateFormatter.format(fixedDate).split(',')[0]; // Выводим только дату
    } else if (format.timeOnly) {
      return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(fixedDate); // Выводим только время
    } else if (format.dayMonth) {
      return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(fixedDate); // день и месяц
    } else if (format.dayTime) {
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(fixedDate); // день и время
    } else if (format.monthYear) {
      return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(fixedDate); // месяц и год
    } else if (format.yearOnly) {
      return new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(fixedDate); // только год
    } else if (format.custom) {
      // Для пользовательского формата с подстановкой
      return format.custom
        .replace('yyyy', fixedDate.getFullYear())
        .replace('mm', ('0' + (fixedDate.getMonth() + 1)).slice(-2)) // добавление ведущего нуля
        .replace('dd', ('0' + fixedDate.getDate()).slice(-2)) // добавление ведущего нуля
        .replace('hh', ('0' + fixedDate.getHours()).slice(-2)) // добавление ведущего нуля
        .replace('min', ('0' + fixedDate.getMinutes()).slice(-2)); // добавление ведущего нуля
    }

    // Вернуть полную дату в стандартном формате
    return dateFormatter.format(fixedDate);
  };

  const formateText = (text, maxLength = 16) => {
    // Return empty string if text is undefined or null
    if (!text) return '';

    // If text is shorter than or equal to maxLength, return it as is
    if (text.length <= maxLength) {
      return text;
    }

    // Otherwise truncate and add ellipsis
    return text.substring(0, maxLength) + '...';
  };

  const normalizeUrlParam = param => {
    if (!param) param = '';

    return param
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const joinArrayToUrl = arr => {
    return arr.join('/');
  };

  function generateFilters(selectedFilters) {
    const filters = [];

    // Process all selected filters
    for (const [key, values] of Object.entries(selectedFilters)) {
      if (values && values.length > 0) {
        // Skip special filters (these are handled separately)
        if (key !== 'prices' && key !== 'delivery' && key !== 'categories') {
          filters.push({
            parameter: key,
            caseSensitive: false,
            values: Array.isArray(values) ? values : [values],
          });
        }
      }
    }

    return filters.length > 0 ? JSON.stringify(filters) : undefined;
  }

  const getMarketplaceLink = (categories, country, state, city) => {
    let country_normalized = country ? normalizeUrlParam(country) : '';
    let state_normalized = state ? normalizeUrlParam(state) : '';
    let city_normalized = city ? normalizeUrlParam(city) : '';

    let base = '/marketplace';
    base += country_normalized ? `/${country_normalized}` : '';
    base += country_normalized && state_normalized ? `/${state_normalized}` : '';
    base += country_normalized && state_normalized && city_normalized ? `/${city_normalized}` : '';

    if (categories && categories.length) {
      base += `?categories=${categories.join(',')}`;
    }

    return base;
  };

  const getSpotsLink = (country, state, city) => {
    let country_normalized = country ? normalizeUrlParam(country) : '';
    let state_normalized = state ? normalizeUrlParam(state) : '';
    let city_normalized = city ? normalizeUrlParam(city) : '';

    let base = '/spots';
    base += country_normalized ? `/${country_normalized}` : '';
    base += country_normalized && state_normalized ? `/${state_normalized}` : '';
    base += country_normalized && state_normalized && city_normalized ? `/${city_normalized}` : '';

    return base;
  };

  const isClientSide = typeof window !== 'undefined' && typeof document !== 'undefined';

  const getCssVar = name => {
    if (!isClientSide) return ''; // SSR fallback
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  };

  const matchMediaSafe = query => {
    if (!isClientSide) return { matches: false };
    return window.matchMedia(query);
  };

  const isMediaMax = varName => {
    const maxWidth = getCssVar(varName);
    return matchMediaSafe(`(max-width: ${maxWidth})`).matches;
  };

  const isMediaMin = varName => {
    const minWidth = getCssVar(varName);
    return matchMediaSafe(`(min-width: ${minWidth})`).matches;
  };

  const isFlipPhone = () => isMediaMax('--flip-phone-max');
  const isPhone = () => isMediaMax('--phone-landscape-max');

  const isTabletPortrait = () => {
    const min = getCssVar('--tablet-portrait-min');
    const max = getCssVar('--tablet-portrait-max');
    return matchMediaSafe(`(min-width: ${min}) and (max-width: ${max})`).matches;
  };

  const isTabletLandscape = () => {
    const min = getCssVar('--tablet-landscape-min');
    const max = getCssVar('--tablet-landscape-max');
    return matchMediaSafe(`(min-width: ${min}) and (max-width: ${max})`).matches;
  };

  const isTablet = () => isTabletPortrait() || isTabletLandscape();

  const isDesktop = () => {
    const min = getCssVar('--desktop-min');
    const max = getCssVar('--desktop-max');
    return matchMediaSafe(`(min-width: ${min}) and (max-width: ${max})`).matches;
  };

  const isXLDesktop = () => {
    const min = getCssVar('--xl-desktop-min');
    const max = getCssVar('--xl-desktop-max');
    return matchMediaSafe(`(min-width: ${min}) and (max-width: ${max})`).matches;
  };

  const isXXLDesktop = () => isMediaMin('--xxl-desktop-min');

  return {
    isModuleInstalled,
    isAdmin,
    hasAccess,
    returnCurrency,
    formatPrice,
    formatDate,
    formateText,
    replaceClasses,
    normalizeUrlParam,
    joinArrayToUrl,
    getMarketplaceLink,
    getSpotsLink,
    generateFilters,
    // Брейкпоинты
    getCssVar,
    isMediaMax,
    isMediaMin,
    isFlipPhone,
    isPhone,
    isTabletPortrait,
    isTabletLandscape,
    isTablet,
    isDesktop,
    isXLDesktop,
    isXXLDesktop,
  };
}

// Экспорт для глобальной регистрации
export const globalMixins = {
  methods: useGlobalMixins(),
};
