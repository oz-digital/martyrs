import { setAuthToken } from '@martyrs/src/modules/core/views/utils/axios-instance.js';
import { renderSSRHead } from '@unhead/ssr';
import { renderToString } from '@vue/server-renderer';

export function renderAndMountApp({ createApp, hooks = {} }) {
  const start = async () => {
    // [LOADING 22] Starting client-side hydration
    performance.mark('loading-22-start');
    console.log('[LOADING 22] Starting client-side hydration...');

    const { app, router, store, moduleManager, config } = await createApp();
    
    let serverModules = [];
    
    // Загружаем модули которые были загружены на сервере
    if (typeof window !== 'undefined') {
      try {
        const modulesElement = document.querySelector('[data-loaded-modules]');
        if (modulesElement) {
          serverModules = JSON.parse(modulesElement.innerHTML);
        }
      } catch (e) {
        console.error('Failed to parse loaded modules', e);
      }
      
      const context = { app, store, router, config };

      // [LOADING 23] Loading server modules for hydration
      performance.mark('loading-23-start');
      console.log(`[LOADING 23] Loading ${serverModules.length} server modules for hydration...`);

      for (const moduleName of serverModules) {
        try {
          await moduleManager.load(moduleName, context);
          await moduleManager.initialize(moduleName, context);
        } catch (error) {
          console.error(`Failed to load module ${moduleName}:`, error);
        }
      }

      performance.mark('loading-23-end');
      performance.measure('loading-23', 'loading-23-start', 'loading-23-end');
      const measure23 = performance.getEntriesByName('loading-23')[0];
      console.log(`[LOADING 23] Server modules loaded in ${measure23?.duration?.toFixed(2)}ms`);
    }
    
    // Call beforeHydration hook if provided
    if (hooks.beforeHydration) {
      hooks.beforeHydration({ app, router, store, moduleManager });
    }

    // [LOADING 24] Parsing and applying initialState
    performance.mark('loading-24-start');
    console.log('[LOADING 24] Parsing and applying initialState...');

    let initialState;

    try {
      const initialStateElement = document.querySelector('[data-state]');

      if (initialStateElement && initialStateElement.innerHTML.trim() !== '') {
        const stateContent = initialStateElement.innerHTML.trim();
        
        // Validate JSON format before parsing
        if (stateContent.startsWith('{') && stateContent.endsWith('}')) {
          initialState = JSON.parse(stateContent);
          
          // Basic validation of state structure
          if (typeof initialState !== 'object' || initialState === null) {
            throw new Error('Invalid state format');
          }
        } else {
          throw new Error('Invalid JSON format');
        }
      }
    } catch (error) {
      console.error('Failed to parse user state', error);
      initialState = null;
    }


    if (initialState) {
      console.log('[AUTH COOKIE DEBUG] Browser initialState.auth:', initialState.auth);
      console.log('[AUTH COOKIE DEBUG] Has token?', !!initialState?.auth?.access?.token);
      console.log('[AUTH COOKIE DEBUG] Has auth but no status?', !!initialState?.auth && !initialState.auth.access?.status);

      // Применяем начальное состояние ко всем модулям (true = гидратация)
      store.setInitialState(initialState, true);

      if (initialState?.auth?.access?.token) {
        console.log('[AUTH COOKIE DEBUG] Setting auth token from initialState');
        setAuthToken(initialState.auth.access.token);
      } else if (initialState?.auth && !initialState.auth.access?.status) {
        // Если SSR сбросил auth (из-за ошибки), удаляем куку в браузере
        console.log('[AUTH COOKIE DEBUG] SSR reset auth, removing cookie in browser');
        if (store.auth && store.auth.removeCookie) {
          await store.auth.removeCookie('user');
        }
      }
    } else {
      // Если нет initialState, сбрасываем авторизацию (если модуль auth загружен)
      if (store.auth && store.auth.actions) {
        store.auth.actions.resetState();
        // await store.auth.removeCookie('user');
        await store.auth.actions.logout();
      }
    }

    // app.config.globalProperties.$i18n.locale = router.currentRoute.value.params.locale
    // app.config.globalProperties.$i18n.locale = router.currentRoute.value.params.locale
    // If user browser locae supported then change locale
    // if (i18n.global.availableLocales.includes(browserLocale)) {
    //   app.config.globalProperties.$i18n.locale = browserLocale;
    // }

    performance.mark('loading-24-end');
    performance.measure('loading-24', 'loading-24-start', 'loading-24-end');
    const measure24 = performance.getEntriesByName('loading-24')[0];
    console.log(`[LOADING 24] InitialState parsed and applied in ${measure24?.duration?.toFixed(2)}ms`);

    await router.isReady();

    // [LOADING 25] Mounting the application
    performance.mark('loading-25-start');
    console.log('[LOADING 25] Mounting the application...');

    app.mount('#app');

    performance.mark('loading-25-end');
    performance.measure('loading-25', 'loading-25-start', 'loading-25-end');
    const measure25 = performance.getEntriesByName('loading-25')[0];
    console.log(`[LOADING 25] Application mounted in ${measure25?.duration?.toFixed(2)}ms`);

    // Return the objects for further use
    return { app, router, store, moduleManager };
  };
  return start();
}

export async function render({ url, cookies,  ssrContext, createApp}) {
  // [LOADING 26] SSR render starting
  performance.mark('loading-26-start');
  console.log('[LOADING 26] SSR render starting...');

  const { app, router, store, meta } = createApp();

  await router.push(url);
  await router.isReady();

  // If user's language is supported, change the locale
  // if (language === 'en' || language === 'ru') {
  //   app.config.globalProperties.$i18n.locale = language
  // }

  // app.config.globalProperties.$i18n.locale = router.currentRoute.value.params.locale

  const ctx = ssrContext || {};

  if (router.currentRoute.value.name?.toLowerCase() === 'notfound') {
    ctx.notFound = true;
  }

  let user = null;

  if (cookies.user) {
    try {
      user = JSON.parse(cookies.user);
    } catch (error) {
      console.error('Failed to parse user cookie', error);
      user = null;
    }
  }

  if (user) {
    // [LOADING 27] SSR auth initialization
    performance.mark('loading-27-start');
    console.log('[LOADING 27] SSR auth initialization...');

    if (store.auth && store.auth.actions) {
      try {
        await store.auth.actions.initialize(user);
      } catch (error) {
        console.error('[SSR] Auth initialization failed, continuing without auth:', error);
        // Сбрасываем состояние если инициализация упала
        if (store.auth.actions.resetState) {
          store.auth.actions.resetState();
        }
      }
    } else {
      console.warn('[SSR] Auth module not loaded, cannot initialize user');
    }

    performance.mark('loading-27-end');
    performance.measure('loading-27', 'loading-27-start', 'loading-27-end');
    const measure27 = performance.getEntriesByName('loading-27')[0];
    console.log(`[LOADING 27] SSR auth initialized in ${measure27?.duration?.toFixed(2)}ms`);
  } else {
    if (store.auth && store.auth.actions) {
      store.auth.actions.resetState();
    } else {
      console.warn('[SSR] Auth module not loaded, cannot reset state');
    }
  }

  // [LOADING 28] SSR renderToString
  performance.mark('loading-28-start');
  console.log('[LOADING 28] SSR renderToString starting...');

  // After render, ctx.modules will be populated with used module identifiers
  const html = await renderToString(app, ctx);
  const payload = await renderSSRHead(meta, {});
  const initialState = await store.getInitialState();

  performance.mark('loading-28-end');
  performance.measure('loading-28', 'loading-28-start', 'loading-28-end');
  const measure28 = performance.getEntriesByName('loading-28')[0];
  console.log(`[LOADING 28] SSR renderToString completed in ${measure28?.duration?.toFixed(2)}ms`);

  // Total SSR render time
  performance.measure('loading-26-total', 'loading-26-start', 'loading-28-end');
  const measure26Total = performance.getEntriesByName('loading-26-total')[0];
  console.log(`[LOADING 26] Total SSR render completed in ${measure26Total?.duration?.toFixed(2)}ms`);

  return {
    html,
    meta: payload,
    state: initialState,
    statusCode: router.currentRoute?.value?.name?.toLowerCase() === 'notfound' ? 404 : 200,
    usedModules: Array.from(ctx.modules || new Set()), // Return used modules
  };
}
