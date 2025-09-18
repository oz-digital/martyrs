import { setAuthToken } from '@martyrs/src/modules/globals/views/utils/axios-instance.js';
import { renderSSRHead } from '@unhead/ssr';
import { renderToString } from '@vue/server-renderer';

export function renderAndMountApp({ createApp, hooks = {} }) {
  const start = async () => {
    const { app, router, store, moduleRegistry } = await createApp();
    
    // Call beforeHydration hook if provided
    if (hooks.beforeHydration) {
      hooks.beforeHydration({ app, router, store, moduleRegistry });
    }

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
      // Применяем начальное состояние ко всем модулям (true = гидратация)
      store.setInitialState(initialState, true);
      
      if (initialState?.auth?.access?.token) {
        setAuthToken(initialState.auth.access.token);
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

    await router.isReady();
    
    app.mount('#app');
    
    // Return the objects for further use
    return { app, router, store, moduleRegistry };
  };
  return start();
}

export async function render({ url, cookies,  ssrContext, createApp}) {
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
    if (store.auth && store.auth.actions) {
      await store.auth.actions.initialize(user);
    } else {
      console.warn('[SSR] Auth module not loaded, cannot initialize user');
    }
  } else {
    if (store.auth && store.auth.actions) {
      store.auth.actions.resetState();
    } else {
      console.warn('[SSR] Auth module not loaded, cannot reset state');
    }
  }

  // After render, ctx.modules will be populated with used module identifiers
  const html = await renderToString(app, ctx);
  const payload = await renderSSRHead(meta, {});
  const initialState = await store.getInitialState();

  return {
    html,
    meta: payload,
    state: initialState,
    statusCode: router.currentRoute?.value?.name?.toLowerCase() === 'notfound' ? 404 : 200,
    usedModules: Array.from(ctx.modules || new Set()), // Return used modules
  };
}
