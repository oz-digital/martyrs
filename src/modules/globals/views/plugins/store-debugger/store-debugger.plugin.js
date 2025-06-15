// src/plugins/storeDebuggerPlugin.js
import { createVNode, render } from 'vue'
import StoreDebugger from './StoreDebugger.vue'

export default {
  install(app, store) {
    if (!store || typeof store !== 'object') {
      console.warn('[storeDebuggerPlugin] please pass a valid store instance')
      return
    }
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // создаём контейнер и встраиваем его в тело документа
      const container = document.createElement('div')
      document.body.appendChild(container)

      // создаём vnode компонента и привязываем к контексту вашего приложения
      const vnode = createVNode(StoreDebugger, { store })
      vnode.appContext = app._context

      // монтируем
      render(vnode, container)
    }
  }
}
