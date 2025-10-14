// client-factory.js - фабрика для создания клиентского приложения
import { nextTick, createApp as createVueApp, createSSRApp as createVueSSRApp } from 'vue';
import { createHead } from '@unhead/vue';

export function createUniversalApp({
  getConfig,
  getRouter,
  getLocales,
  getStore,
  getHooks = {}
}) {
  // Lazy imports to avoid circular dependencies
  const getLayoutApp = () => import('../components/layouts/App.vue').then(m => m.default);
  const getModuleRegistry = () => import('./module.manager.js').then(m => m.moduleManager);
  const getWebsockets = () => import('./ws.manager.js').then(m => m.default);
  const getAppRenderer = () => import('../utils/vue-app-renderer.js');
  
  // Асинхронная инициализация для избежания циклических зависимостей
  async function initializeApp() {
    // [LOADING 14] Starting initializeApp
    performance.mark('loading-14-start');
    console.log('[LOADING 14] Starting application initialization...');

    // Создаем конфигурацию
    const config = await getConfig();
    const hooks = getHooks;

    // [LOADING 15] Loading core dependencies
    performance.mark('loading-15-start');
    console.log('[LOADING 15] Loading core dependencies via Promise.all...');

    const [layoutApp, moduleManager, wsManager, appRenderer] = await Promise.all([
      getLayoutApp(),
      getModuleRegistry(),
      getWebsockets(),
      getAppRenderer()
    ]);

    performance.mark('loading-15-end');
    performance.measure('loading-15', 'loading-15-start', 'loading-15-end');
    const measure15 = performance.getEntriesByName('loading-15')[0];
    console.log(`[LOADING 15] Core dependencies loaded in ${measure15?.duration?.toFixed(2)}ms`);
    
    // Core module is always loaded - no need to register in moduleManager

    // [LOADING 16] Registering modules in registry
    performance.mark('loading-16-start');
    console.log('[LOADING 16] Registering modules in registry...');

    // Регистрация модулей из config
    Object.entries(config.modules).forEach(([name, module]) => {
      if (module.loader) {
        moduleManager.register(name, {
          loader: module.loader,
          routes: module.routes || [],
          priority: module.priority || 'normal',
          critical: module.critical || false,
          dependencies: module.dependencies || [],
          preload: module.preload || false
        });
      }
    });

    performance.mark('loading-16-end');
    performance.measure('loading-16', 'loading-16-start', 'loading-16-end');
    const measure16 = performance.getEntriesByName('loading-16')[0];
    console.log(`[LOADING 16] Modules registered in ${measure16?.duration?.toFixed(2)}ms`);
    
    // Основная функция создания приложения
    function createApp() {
      const store = getStore();
      const app = process.env.MOBILE_APP 
        ? createVueApp(layoutApp, config) 
        : createVueSSRApp(layoutApp, config);
      
      const meta = createHead();
      const i18n = getLocales();
      
      const context = {
        app,
        store,
        router: null,
        config,
      };
      
      // Создаем роутер с контекстом
      const router = getRouter(context);
      context.router = router;

      // Регистрируем заглушки для роутов, которые требуют другие модули
      // Когда Organizations/Backoffice/Auth загрузятся, они заменят эти заглушки
      const stubComponent = { template: '<router-view />' };

      router.addRoute('Home', {
        path: 'backoffice',
        name: 'Backoffice Root',
        children: [],
        component: stubComponent,
        meta: {
          sidebar_width_hidden: 'w-0',
        }
      });

      router.addRoute('Home', {
        path: 'organizations/:_id',
        name: 'OrganizationRoot',
        children: [],
        component: stubComponent
      });

      router.addRoute('Home', {
        path: 'users/:_id',
        name: 'User Profile Root',
        children: [],
        component: stubComponent
      });
      
      // No critical modules - everything loads on demand
      
      // Router guard для загрузки модулей ДО навигации (только на клиенте)
      if (typeof window !== 'undefined') {
        router.beforeEach(async (to, from) => {
          // Получаем оригинальный путь ДО fallback редиректа на 404
          // Это критически важно для SSR гидратации вложенных роутов!
          const target = to.redirectedFrom || to;
          
          // Используем оригинальный путь для определения нужных модулей
          const requiredModules = moduleManager.getModulesForRoute(target.path);
          
          // Проверяем, какие модули еще не загружены
          const modulesToLoad = requiredModules.filter(m => !moduleManager.initialized.has(m.name));
          
          if (modulesToLoad.length > 0) {
            // Логируем если это редирект с 404 (для отладки)
            if (to.redirectedFrom) {
              console.log('[Router] Loading modules for redirected path:', target.path, 'modules:', modulesToLoad.map(m => m.name));
            }

            // [LOADING 18] Loading modules for route
            performance.mark('loading-18-start');
            console.log(`[LOADING 18] Loading ${modulesToLoad.length} modules for route...`);

            // Загружаем и инициализируем модули
            for (const module of modulesToLoad) {
              try {
                await moduleManager.load(module.name, context);
                await moduleManager.initialize(module.name, context);
              } catch (error) {
                console.error(`Failed to load module ${module.name}:`, error);
              }
            }

            performance.mark('loading-18-end');
            performance.measure('loading-18', 'loading-18-start', 'loading-18-end');
            const measure18 = performance.getEntriesByName('loading-18')[0];
            console.log(`[LOADING 18] Modules loaded for route in ${measure18?.duration?.toFixed(2)}ms`);

            // После загрузки модулей и регистрации их роутов,
            // возвращаем объект с оригинальным путем и replace: true
            // Это заставит роутер заново резолвить маршрут с новыми роутами
            return { path: target.fullPath, replace: true };
          }
        });
      }

      router.beforeResolve(async (to, from) => {
           store.core.state.loading = false;
      })
      
      // Error handler для lazy loaded chunks
      if (typeof window !== 'undefined') {
        window.addEventListener('error', (e) => {
          if (e.message && e.message.includes('Loading chunk')) {
            console.error('Chunk loading failed:', e);
            // Можно показать уведомление пользователю
            // или попытаться перезагрузить
          }
        });
      }
      
      // Инициализация в правильном порядке
      const initialize = async () => {
        // Хук ДО инициализации
        if (hooks.beforeInitialize) {
          await hooks.beforeInitialize(context);
        }
        // [LOADING 17] Initializing Core module
        performance.mark('loading-17-start');
        console.log('[LOADING 17] Initializing Core module...');

        // Core module must ALWAYS be initialized
        const ModuleCore = await import('../../core.client.js');
        await ModuleCore.default.initialize(app, store, router, config);

        performance.mark('loading-17-end');
        performance.measure('loading-17', 'loading-17-start', 'loading-17-end');
        const measure17 = performance.getEntriesByName('loading-17')[0];
        console.log(`[LOADING 17] Core module initialized in ${measure17?.duration?.toFixed(2)}ms`);

        // 2. WebSocket (отложим после гидратации, только если включен)
        const useWebsocket = config.globals?.websocket !== false; // по умолчанию false

        if (useWebsocket && typeof window !== 'undefined') {
          // Откладываем инициализацию WebSocket после гидратации
          requestIdleCallback(() => {
            wsManager.initialize({
              wsUrl: process.env.WSS_URL || undefined,
              maxReconnectAttempts: 5,
              reconnectDelay: 3000,
              pingInterval: 30000,
            });
          });
        }

        // 3. Предзагрузка важных модулей в фоне
        if (typeof window !== 'undefined') {
          requestIdleCallback(() => {
            moduleManager.preloadModules(context);
          });
        }
        
        // 5. Подключаем Vue плагины
        app.use(router).use(i18n).use(meta);
        
        // 6. Монтируем приложение
        if (process.env.MOBILE_APP) {
          app.mount('#app');
        }

        // Хук ПОСЛЕ инициализации
        if (hooks.afterInitialize) {
          await hooks.afterInitialize(context);
        }

        // [LOADING 19] Application initialization completed
        performance.mark('loading-19-end');
        performance.measure('loading-19', 'loading-14-start', 'loading-19-end');
        const measure19 = performance.getEntriesByName('loading-19')[0];
        console.log(`[LOADING 19] Application initialization completed in ${measure19?.duration?.toFixed(2)}ms`);

        return {
          app,
          router,
          store,
          i18n,
          meta,
          moduleManager,
          config,
        };
      };
      
      // Возвращаем промис для SSR
      if (!process.env.MOBILE_APP) {
        return initialize();
      }
      
      // Для SPA инициализируем сразу
      initialize();
    }
    
    // FOR SSR / SERVER ENTRY
    async function renderApp({ url, cookies, languages, ssrContext }) {
      const { app, router, store, i18n, meta, moduleManager } = await createApp();
      
      // Set SSR store for useStore calls
      if (typeof window === 'undefined') {
        const { setSSRStore } = await import('../store/core.store.js');
        await setSSRStore(store);
      }
      
      const context = {
        app,
        store,
        router,
        config,
        ssr: true,
      };

      // [LOADING 20] SSR renderApp starting and loading modules
      performance.mark('loading-20-start');
      console.log('[LOADING 20] SSR renderApp starting and loading modules...');

      // Для SSR загружаем модули для текущего маршрута
      const requiredModules = moduleManager.getModulesForRoute(url);

      // Собираем имена модулей которые нужны для текущего роута
      const currentRouteModules = [];

      // Загружаем необходимые модули для SSR
      for (const module of requiredModules) {
        await moduleManager.load(module.name, context);
        await moduleManager.initialize(module.name, context);
        currentRouteModules.push(module.name);
      }

      performance.mark('loading-20-end');
      performance.measure('loading-20', 'loading-20-start', 'loading-20-end');
      const measure20 = performance.getEntriesByName('loading-20')[0];
      console.log(`[LOADING 20] SSR modules loaded in ${measure20?.duration?.toFixed(2)}ms`);
      
      // После загрузки модулей и регистрации роутов, выполняем навигацию
      await router.push(url);
      await router.isReady();
      
      const result = await appRenderer.render({
        url,
        cookies,
        createApp: () => ({ app, router, store, i18n, meta }),
        ssrContext
      });
      
      if (ssrContext?.modules) {
        result.usedModules = Array.from(ssrContext.modules);
      }
      
      // Передаем только модули текущего роута (без критических)
      result.loadedModules = currentRouteModules;

      // [LOADING 21] SSR render completed
      performance.mark('loading-21-end');
      performance.measure('loading-21', 'loading-20-start', 'loading-21-end');
      const measure21 = performance.getEntriesByName('loading-21')[0];
      console.log(`[LOADING 21] SSR render completed in ${measure21?.duration?.toFixed(2)}ms`);

      // Clean up for next SSR request
      if (typeof window === 'undefined') {
        moduleManager.initialized.clear();
        moduleManager.modules.clear();
        moduleManager.loadingPromises.clear();

        const { clearSSRStore } = await import('../store/core.store.js');
        await clearSSRStore();
      }

      return result;
    }
    
    // FOR SPA
    if (typeof window !== 'undefined' && process.env.MOBILE_APP) {
      createApp();
    }
    
    // FOR SSR / CLIENT ENTRY
    if (typeof window !== 'undefined' && !process.env.MOBILE_APP) {
      // Используем renderAndMountApp для правильной гидратации со state
      appRenderer.renderAndMountApp({ createApp, hooks }).then(({ app, router, store, moduleManager }) => {
        // Хук ПОСЛЕ гидратации
        if (hooks.afterHydration) {
          hooks.afterHydration({ app, router, store, moduleManager });
        }
        
        // Модули уже загружены в renderAndMountApp, просто ставим маркер
        if (typeof window !== 'undefined') {
          window.performance.mark('client-ready');
        }
      }).catch(error => {
        console.error('Hydration failed:', error);
      });
    }
    
    return { createApp, renderApp };
  }
  
  // Возвращаем промис, который резолвится с функциями
  return initializeApp();
}