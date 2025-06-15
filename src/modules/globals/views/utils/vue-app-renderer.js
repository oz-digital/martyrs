import { setAuthToken } from '@martyrs/src/modules/globals/views/utils/axios-instance.js';
import { renderSSRHead } from '@unhead/ssr';
import { renderToString } from '@vue/server-renderer';

export function renderAndMountApp({ createApp }) {
  const start = async () => {
    const { app, router, store } = createApp();

    let initialState;

    try {
      const initialStateElement = document.querySelector('[data-state]');

      if (initialStateElement && initialStateElement.innerHTML.trim() !== '') {
        initialState = JSON.parse(initialStateElement.innerHTML.trim());
      }
    } catch (error) {
      console.error('Failed to parse user state', error);
    }

    if (initialState) {
      // Применяем начальное состояние ко всем модулям
      store.setInitialState(initialState);
    }

    console.log('auth', initialState.auth);
    if (initialState?.auth?.access?.token) {
      setAuthToken(initialState.auth.access.token);
    } else {
      store.auth.actions.resetState();
      // await store.auth.removeCookie('user');
      await store.auth.actions.logout();
    }

    // app.config.globalProperties.$i18n.locale = router.currentRoute.value.params.locale
    // app.config.globalProperties.$i18n.locale = router.currentRoute.value.params.locale
    // If user browser locae supported then change locale
    // if (i18n.global.availableLocales.includes(browserLocale)) {
    //   app.config.globalProperties.$i18n.locale = browserLocale;
    // }

    await router.isReady();
    app.mount('#app');
  };
  start();
}

export async function render({ url, cookies, createApp }) {
  const { app, router, store, meta } = createApp();

  await router.push(url);
  await router.isReady();

  // If user's language is supported, change the locale
  // if (language === 'en' || language === 'ru') {
  //   app.config.globalProperties.$i18n.locale = language
  // }

  // console.log(router.currentRoute.value.params.locale)
  // app.config.globalProperties.$i18n.locale = router.currentRoute.value.params.locale

  const sharedContext = {};

  if (router.currentRoute.value.name?.toLowerCase() === 'notfound') {
    sharedContext.notFound = true;
  }

  let user = null;

  if (cookies.user) {
    user = JSON.parse(cookies.user);
  }

  if (user) {
    await store.auth.actions.initialize(user);
  } else {
    store.auth.actions.resetState();
  }

  const html = await renderToString(app, sharedContext);
  const payload = await renderSSRHead(meta, {});
  const initialState = await store.getInitialState();

  return {
    html,
    meta: payload,
    state: initialState,
    statusCode: router.currentRoute?.value?.name?.toLowerCase() === 'notfound' ? 404 : 200,
  };
}
