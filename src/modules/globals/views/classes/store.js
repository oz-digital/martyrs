import { isReactive, reactive } from 'vue';

// Фабрика для создания store
export function createStore() {
  const store = reactive({
    modules: [],
    addStore(name, storage) {
      this[name] = storage;
      this.modules.push(name);
    },
    async getInitialState() {
      const initialState = {};
      for (const [moduleName, moduleStore] of Object.entries(this)) {
        if (moduleName !== 'modules' && moduleName !== 'addStore' && moduleName !== 'getInitialState' && moduleName !== 'setInitialState') {
          if (moduleStore.state) {
            initialState[moduleName] = JSON.parse(JSON.stringify(moduleStore.state));
          }
        }
      }
      return initialState;
    },
    async setInitialState(initialState, isHydration = false) {
      console.time('[PERF] Store.setInitialState');
      const modules = Object.entries(initialState);
      console.log(`[PERF] Setting initial state for ${modules.length} modules (hydration: ${isHydration})`);
      
      for (const [moduleName, moduleState] of modules) {
        if (this[moduleName] && this[moduleName].state) {
          console.time(`[PERF] Merge state: ${moduleName}`);
          
          // При гидратации просто заменяем state целиком для скорости
          if (isHydration) {
            Object.assign(this[moduleName].state, moduleState);
          } else {
            mergeReactive(this[moduleName].state, moduleState);
          }
          
          console.timeEnd(`[PERF] Merge state: ${moduleName}`);
        }
      }
      console.timeEnd('[PERF] Store.setInitialState');
    }
  });

  function mergeReactive(target, source) {
    // Оптимизированная версия слияния
    const keys = Object.keys(source);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const sourceValue = source[key];
      
      if (sourceValue !== null && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        if (isReactive(target[key])) {
          mergeReactive(target[key], sourceValue);
        } else {
          target[key] = sourceValue;
        }
      } else {
        target[key] = sourceValue;
      }
    }
  }

  return store;
}

// Синглтон для клиента
let clientStore = null;

// Store для SSR должен создаваться в createApp и передаваться сюда
let ssrStore = null;

export function setSSRStore(store) {
  ssrStore = store;
}

export function useStore() {
  if (typeof window === 'undefined') {
    // SSR: используем переданный store
    if (ssrStore) {
      return ssrStore;
    }
    // Fallback для обратной совместимости
    console.warn('[WARN] SSR store not set, creating new store instance');
    return createStore();
  }
  // Client: синглтон
  if (!clientStore) {
    clientStore = createStore();
  }
  return clientStore;
}

export default useStore();
