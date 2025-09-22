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
  const getModuleRegistry = () => import('./module-registry.js').then(m => m.moduleRegistry);
  const getWebsockets = () => import('./globals.websocket.js').then(m => m.default);
  const getAppRenderer = () => import('../utils/vue-app-renderer.js');
  
  // Асинхронная инициализация для избежания циклических зависимостей
  async function initializeApp() {
    // Создаем конфигурацию
    const config = await getConfig();
    const hooks = getHooks;
    
    const [layoutApp, moduleRegistry, globalWebSocket, appRenderer] = await Promise.all([
      getLayoutApp(),
      getModuleRegistry(),
      getWebsockets(),
      getAppRenderer()
    ]);
    
    // Регистрация модуля globals первым
    moduleRegistry.register('globals', {
      loader: () => import('../../globals.client.js'),
      critical: true,
      priority: 'critical'
    });
    
    // Регистрация модулей из config
    Object.entries(config.modules).forEach(([name, module]) => {
      if (module.loader) {
        moduleRegistry.register(name, {
          loader: module.loader,
          routes: module.routes || [],
          priority: module.priority || 'normal',
          critical: module.critical || false,
          dependencies: module.dependencies || [],
          preload: module.preload || false
        });
      }
    });
    
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
      
      // Загружаем только критические модули синхронно
      const initCriticalModules = async () => {
        // Если это SSR гидратация - модули загрузятся в renderAndMountApp
        const isSSRHydration = typeof window !== 'undefined' && !process.env.MOBILE_APP;
        if (isSSRHydration) {
          return;
        }
        
        // Для SPA и сервера загружаем как обычно
        const criticalModules = ['globals', 'auth', 'organizations', 'backoffice'];
        
        for (const moduleName of criticalModules) {
          try {
            await moduleRegistry.load(moduleName, context);
            await moduleRegistry.initialize(moduleName, context);
          } catch (error) {
            console.error(`Failed to load critical module ${moduleName}:`, error);
          }
        }
      };
      
      // Router guard для загрузки модулей ДО навигации (только на клиенте)
      if (typeof window !== 'undefined') {
        const originalPush = router.push.bind(router);
        const originalReplace = router.replace.bind(router);

        async function paintNow() {
          await nextTick();                           // flush реактивки в DOM
          await new Promise(requestAnimationFrame);   // кадр layout/style
          await new Promise(requestAnimationFrame);   // кадр отрисовки
          // иногда в WebView помогает ещё макротаск
          await new Promise(r => setTimeout(r, 0));
        }

        router.push = async (...args) => {
          // Включаем лоадер
          store.globals.state.loading = true;
          
          // Даем браузеру отрисовать лоадер
          await paintNow();
          
          // Запускаем навигацию асинхронно, чтобы не блокировать UI
          setTimeout(() => {
            originalPush(...args);
          }, 0);
          
          // Возвращаем промис для совместимости
          return Promise.resolve();
        };

        // router.replace = async (...args) => {
        //   // Включаем лоадер
        //   store.globals.state.loading = true;
          
        //   // Даем браузеру отрисовать лоадер
        //   await paintNow();
          
        //   // Запускаем навигацию асинхронно
        //   setTimeout(() => {
        //     originalReplace(...args);
        //   }, 0);
          
        //   return Promise.resolve();
        // };

        router.beforeEach(async (to, from) => {
          // Получаем оригинальный путь ДО fallback редиректа на 404
          // Это критически важно для SSR гидратации вложенных роутов!
          const target = to.redirectedFrom || to;
          
          // Используем оригинальный путь для определения нужных модулей
          const requiredModules = moduleRegistry.getModulesForRoute(target.path);
          
          // Проверяем, какие модули еще не загружены
          const modulesToLoad = requiredModules.filter(m => !moduleRegistry.initialized.has(m.name));
          
          if (modulesToLoad.length > 0) {
            // Логируем если это редирект с 404 (для отладки)
            if (to.redirectedFrom) {
              console.log('[Router] Loading modules for redirected path:', target.path, 'modules:', modulesToLoad.map(m => m.name));
            }
            
            // Загружаем и инициализируем модули
            for (const module of modulesToLoad) {
              try {
                await moduleRegistry.load(module.name, context);
                await moduleRegistry.initialize(module.name, context);
              } catch (error) {
                console.error(`Failed to load module ${module.name}:`, error);
              }
            }
            
            // После загрузки модулей и регистрации их роутов,
            // возвращаем объект с оригинальным путем и replace: true
            // Это заставит роутер заново резолвить маршрут с новыми роутами
            return { path: target.fullPath, replace: true };
          }
        });
      }

      router.beforeResolve(async (to, from) => {
           store.globals.state.loading = false;
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
        
        // 1. Критические модули
        await initCriticalModules();
        
        // 2. WebSocket (отложим после гидратации)
        if (typeof window !== 'undefined') {
          // Откладываем инициализацию WebSocket после гидратации
          requestIdleCallback(() => {
            globalWebSocket.initialize({
              wsUrl: process.env.WSS_URL || undefined,
              maxReconnectAttempts: 5,
              reconnectDelay: 3000,
              pingInterval: 30000,
            });
          });
          
          // 3. Предзагрузка важных модулей в фоне
          requestIdleCallback(() => {
            moduleRegistry.preloadModules(context);
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
        
        return {
          app,
          router,
          store,
          i18n,
          meta,
          moduleRegistry,
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
      const { app, router, store, i18n, meta, moduleRegistry } = await createApp();
      
      // Set SSR store for useStore calls
      if (typeof window === 'undefined') {
        const { setSSRStore } = await import('./store.js');
        setSSRStore(store);
      }
      
      
      if (typeof window === 'undefined') {
        moduleRegistry.initialized.clear();
        moduleRegistry.modules.clear();
        moduleRegistry.loadingPromises.clear();
      }
      //   // На сервере загружаем auth для SSR рендеринга (vue-app-renderer требует его)
      //   const context = { app, store, router, config };
      //   await moduleRegistry.load('globals', context);
      //   await moduleRegistry.initialize('globals', context);
      //   await moduleRegistry.load('auth', context);
      //   await moduleRegistry.initialize('auth', context);
      // }
      
      const context = {
        app,
        store,
        router,
        config,
        ssr: true,
      };
      
      // Для SSR загружаем модули для текущего маршрута
      const requiredModules = moduleRegistry.getModulesForRoute(url);
      
      // Собираем имена модулей которые нужны для текущего роута
      const currentRouteModules = [];
      
      // Загружаем необходимые модули для SSR
      for (const module of requiredModules) {
        await moduleRegistry.load(module.name, context);
        await moduleRegistry.initialize(module.name, context);
        currentRouteModules.push(module.name);
      }
      
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
      
      // Передаем только модули текущего роута + критические модули
      // Это не реальные модули а метаданные для дегидратации
      const criticalModules = ['globals', 'auth', 'organizations', 'backoffice'];
      const allModulesForRoute = [...new Set([...criticalModules, ...currentRouteModules])];
      
      result.loadedModules = allModulesForRoute;
      
      return result;
    }
    
    // FOR SPA
    if (typeof window !== 'undefined' && process.env.MOBILE_APP) {
      createApp();
    }
    
    // FOR SSR / CLIENT ENTRY
    if (typeof window !== 'undefined' && !process.env.MOBILE_APP) {
      // Используем renderAndMountApp для правильной гидратации со state
      appRenderer.renderAndMountApp({ createApp, hooks }).then(({ app, router, store, moduleRegistry }) => {
        // Хук ПОСЛЕ гидратации
        if (hooks.afterHydration) {
          hooks.afterHydration({ app, router, store, moduleRegistry });
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