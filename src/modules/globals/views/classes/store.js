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

  async setInitialState(initialState) {
    for (const [moduleName, moduleState] of Object.entries(initialState)) {
      if (this.store[moduleName] && this.store[moduleName].state) {
        this.mergeReactive(this.store[moduleName].state, moduleState);
      }
    }
  }

  mergeReactive(target, source) {
    for (const key in source) {
      if (isReactive(target[key]) && typeof source[key] === 'object') {
        this.mergeReactive(target[key], source[key]);
      } else {
        target[key] = source[key];
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
