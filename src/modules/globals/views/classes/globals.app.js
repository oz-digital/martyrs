// client-factory.js - фабрика для создания клиентского приложения
import { createApp as createVueApp, createSSRApp as createVueSSRApp } from 'vue';
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
    async function createApp() {
      const store = getStore();
      console.log('[DEBUG createApp] store created:', !!store);
      
      // Установить SSR store для useStore
      if (typeof window === 'undefined') {
        const { setSSRStore } = await import('./store.js');
        setSSRStore(store);
      }
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
        // Критические модули одинаковые для всех проектов
        const criticalModules = ['globals', 'auth', 'organizations', 'backoffice'];
        
        for (const moduleName of criticalModules) {
          try {
            console.log(`[DEBUG] Loading module ${moduleName}, context.store:`, !!context.store);
            await moduleRegistry.load(moduleName, context);
            await moduleRegistry.initialize(moduleName, context);
            console.log(`[DEBUG] Module ${moduleName} initialized, store.${moduleName}:`, !!context.store[moduleName]);
          } catch (error) {
            console.error(`Failed to load critical module ${moduleName}:`, error);
          }
        }
      };
      
      // Router guard для загрузки модулей ДО навигации (только на клиенте)
      if (typeof window !== 'undefined') {
        router.beforeEach(async (to, from) => {
          // Получаем модули для маршрута
          const requiredModules = moduleRegistry.getModulesForRoute(to.path);
          
          // Проверяем, какие модули еще не загружены
          const modulesToLoad = requiredModules.filter(m => !moduleRegistry.initialized.has(m.name));
          
          if (modulesToLoad.length > 0) {
            // Показываем глобальный лоадер
            if (store.globals && store.globals.state) {
              store.globals.state.loading = true;
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
            
            // Лоадер остается включенным - страница сама выключит через globals.state.loading = false
            
            // После загрузки модулей и регистрации их роутов,
            // возвращаем тот же путь для повторной навигации с новыми роутами
            return to.fullPath;
          }
        });
      }
      
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
      console.log('[DEBUG SSR] After createApp - store.globals:', !!store.globals);
      
      
      // if (typeof window === 'undefined') {
      //   moduleRegistry.initialized.clear();
      //   moduleRegistry.modules.clear();
      //   moduleRegistry.loadingPromises.clear();
        
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
      createApp().then(({ app, router, store, moduleRegistry }) => {
        // Ждем когда роутер будет готов
        router.isReady().then(() => {
          // Хук ДО гидратации
          if (hooks.beforeHydration) {
            hooks.beforeHydration({ app, router, store, moduleRegistry });
          }
          
          app.mount('#app');
          
          // Хук ПОСЛЕ гидратации
          if (hooks.afterHydration) {
            hooks.afterHydration({ app, router, store, moduleRegistry });
          }
          
          // Создаем context для загрузки модулей
          const context = { app, store, router, config };
          
          // Загружаем auth модуль сразу - он критичен
          moduleRegistry.load('auth', context).then(() => {
            // Загружаем важные модули в следующем тике
            setTimeout(async () => {
              try {
                await Promise.all([
                  moduleRegistry.load('organizations', context),
                  moduleRegistry.load('backoffice', context),
                ]);
              } catch (error) {
                console.error('Error loading core modules:', error);
              }
            }, 0);
            
            // Загружаем некритичные модули когда браузер idle
            requestIdleCallback(async () => {
              try {
                await moduleRegistry.load('notifications', context);
                // Маркер для тестов
                if (typeof window !== 'undefined') {
                  window.performance.mark('client-ready');
                }
              } catch (error) {
                console.error('Error loading non-critical modules:', error);
              }
            });
          }).catch(error => {
            console.error('Error loading auth module:', error);
          });
        });
      }).catch(error => {
        console.error('Hydration failed:', error);
      });
    }
    
    return { createApp, renderApp };
  }
  
  // Возвращаем промис, который резолвится с функциями
  return initializeApp();
}