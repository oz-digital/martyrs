// alertPlugin.js
import { h, reactive, render, defineAsyncComponent } from 'vue';

// Dynamic import for better tree shaking and lazy loading
const AlertDialog = defineAsyncComponent(() => 
  import('@martyrs/src/modules/globals/views/components/blocks/AlertDialog.vue')
);

// Глобальное реактивное состояние для алерта
const alertState = reactive({
  visible: false,
  title: '',
  message: '',
  actions: [],
});

let resolvePromise = null;

function closeAlert(result = null) {
  alertState.visible = false;

  // Гарантируем, что промис всегда будет резолвлен
  if (resolvePromise) {
    resolvePromise(result);
    resolvePromise = null;
  }
}

function showAlert({ title = '', message = '', actions = null } = {}) {
  return new Promise(resolve => {
    resolvePromise = resolve;

    if (!actions || !actions.length) {
      actions = [{ label: 'OK', value: true }];
    }

    alertState.title = title;
    alertState.message = message;
    alertState.actions = actions;
    alertState.visible = true;
  });
}

function handleAction(action) {
  if (action && typeof action.handler === 'function') {
    action.handler();
  }

  const result = action.value === undefined ? action.label : action.value;

  closeAlert(result);
}

export default {
  install(app) {
    app.config.globalProperties.$alert = showAlert;

    // Avoid running DOM operations during SSR
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const vnode = h(AlertDialog, { alertState, handleAction, closeAlert });
      vnode.appContext = app._context;
      render(vnode, container);
    }
  },
};

export { closeAlert, handleAction, showAlert };
