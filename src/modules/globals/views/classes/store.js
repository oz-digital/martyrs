import { isReactive, reactive } from 'vue';

class Store {
  constructor() {
    if (!Store.instance) {
      this.store = reactive({
        modules: [], // Инициализация пустого объекта для модулей
        addStore: this.addStore.bind(this), // Привязка контекста
        getInitialState: this.getInitialState.bind(this), // Метод получения начального состояния
        setInitialState: this.setInitialState.bind(this), // Метод установки начального состояния
      });

      Store.instance = this;
    }
    return Store.instance;
  }

  addStore(name, storage) {
    this.store[name] = storage;
    this.store.modules.push(name);
  }

  async getInitialState() {
    const initialState = {};
    for (const [moduleName, moduleStore] of Object.entries(this.store)) {
      if (moduleName !== 'modules' && moduleName !== 'addStore' && moduleName !== 'getInitialState' && moduleName !== 'setInitialState') {
        if (moduleStore.state) {
          initialState[moduleName] = JSON.parse(JSON.stringify(moduleStore.state));
        }
      }
    }
    return initialState;
  }

  async setInitialState(initialState, isHydration = false) {
    console.time('[PERF] Store.setInitialState');
    const modules = Object.entries(initialState);
    console.log(`[PERF] Setting initial state for ${modules.length} modules (hydration: ${isHydration})`);
    
    for (const [moduleName, moduleState] of modules) {
      if (this.store[moduleName] && this.store[moduleName].state) {
        console.time(`[PERF] Merge state: ${moduleName}`);
        
        // При гидратации просто заменяем state целиком для скорости
        if (isHydration) {
          Object.assign(this.store[moduleName].state, moduleState);
        } else {
          this.mergeReactive(this.store[moduleName].state, moduleState);
        }
        
        console.timeEnd(`[PERF] Merge state: ${moduleName}`);
      }
    }
    console.timeEnd('[PERF] Store.setInitialState');
  }

  mergeReactive(target, source) {
    // Оптимизированная версия слияния
    const keys = Object.keys(source);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const sourceValue = source[key];
      
      if (sourceValue !== null && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        if (isReactive(target[key])) {
          this.mergeReactive(target[key], sourceValue);
        } else {
          target[key] = sourceValue;
        }
      } else {
        target[key] = sourceValue;
      }
    }
  }
}

const instance = new Store();

Object.freeze(instance);

export function useStore() {
  return instance.store;
}

export default instance.store;
