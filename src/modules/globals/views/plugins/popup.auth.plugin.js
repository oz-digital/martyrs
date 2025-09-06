// @martyrs/src/modules/auth/views/plugins/authPlugin.js
import { reactive, defineComponent, h, render, defineAsyncComponent } from 'vue';

// Dynamic import for better tree shaking and lazy loading
const PopupAuth = defineAsyncComponent(() => 
  import('@martyrs/src/modules/globals/views/components/blocks/PopupAuth.vue')
);

// 1) Общее состояние и API
const state = reactive({
  visible: false,
  title: 'Welcome',
  subtitle: 'Please sign in or create an account to continue.',
  returnUrl: '',
  resolve: null,
  reject: null
});

export function showAuth({ 
  title = 'Welcome', 
  subtitle = 'Please sign in or create an account to continue.',
  returnUrl = ''
} = {}) {
  return new Promise((res, rej) => {
    state.resolve = res;
    state.reject = rej;
    state.title = title;
    state.subtitle = subtitle;
    state.returnUrl = returnUrl;
    state.visible = true;
  });
}

export function closeAuth(result = null) {
  state.visible = false;
  state.resolve?.(result);
  state.resolve = state.reject = null;
}

export function cancelAuth() {
  state.visible = false;
  state.reject?.(new Error('Authentication cancelled'));
  state.resolve = state.reject = null;
}

// 2) Хост-компонент
const AuthDialogHost = defineComponent({
  name: 'AuthDialogHost',
  setup() {
    return () => {
      if (!state.visible) return null;
      
      return h(PopupAuth, {
        authState: state,
        closeAuth: closeAuth,
        'onClose-popup': cancelAuth
      });
    };
  }
});

// 3) Плагин
export default {
  install(app) {
    // 3.1) Глобальный метод
    app.config.globalProperties.$auth = showAuth;
    app.config.globalProperties.$showAuth = showAuth;
    
    // 3.2) Контейнер в body
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const container = document.createElement('div');
      container.id = 'auth-dialog-host';
      document.body.appendChild(container);
      
      // 3.3) Рендерим VNode в контексте основного app
      const vnode = h(AuthDialogHost);
      vnode.appContext = app._context;    // <-- ключевой момент
      render(vnode, container);
    }
  }
};