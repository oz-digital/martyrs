// date-selector.plugin.js
import { reactive, markRaw, defineComponent, h, render, defineAsyncComponent } from 'vue'
import * as globals from '@martyrs/src/modules/globals/views/store/globals.js'

// Dynamic import for better tree shaking and lazy loading
const PopupDateSelector = defineAsyncComponent(() => 
  import('@martyrs/src/modules/globals/views/components/blocks/PopupDateSelector.vue')
)

// 1) Общее состояние и API
const state = reactive({
  isOpen: false,
  productId: null,
  variantId: null,
  quantity: 1,
  price: 0,
  options: { showFees: false, feesRate: 0.15, showVat: false, vatRate: 0 },
  resolve: null,
  reject: null
})

function getDefaultOptions() {
  return {
    showFees: globals.state.options?.orders?.showFees || false,
    feesRate: globals.state.options?.orders?.feesRate || 0.15,
    showVat: globals.state.options?.orders?.showVat || false,
    vatRate: globals.state.options?.orders?.vatRate || 0
  }
}

export function showDateSelector(productId, variantId, quantity = 1, price = 0, customOptions = {}) {
  return new Promise((res, rej) => {
    state.resolve = res
    state.reject  = rej
    state.productId = productId
    state.variantId = variantId
    state.quantity = quantity
    state.price = price
    state.options = { ...getDefaultOptions(), ...customOptions }
    state.isOpen  = true
  })
}

function confirmSelection(dates) {
  state.isOpen = false
  state.resolve?.(dates)
  state.resolve = state.reject = state.productId = state.variantId = null
}

function cancelSelection() {
  state.isOpen = false
  state.reject?.(new Error('Date selection cancelled'))
  state.resolve = state.reject = state.productId = state.variantId = null
}

// 2) Хост-компонент
const DateSelectorHost = defineComponent({
  name: 'DateSelectorHost',
  setup() {
    return () =>
      state.isOpen
        ? h(PopupDateSelector, {
            productId: state.productId,
            variantId: state.variantId,
            quantity: state.quantity,
            price: state.price,
            isOpen: state.isOpen,
            showFees: state.options.showFees,
            feesRate: state.options.feesRate,
            showVat: state.options.showVat,
            vatRate: state.options.vatRate,
            showCancelButton: state.options.showCancelButton || false,
            onConfirm: confirmSelection,
            onCancel: state.options.onCancel || cancelSelection,
            'onClose-popup': cancelSelection
          })
        : null
  }
})

// 3) Плагин
export default {
  install(app) {
    // 3.1) Глобальный метод
    app.config.globalProperties.$dateSelector = showDateSelector

    // 3.2) Контейнер в body
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const container = document.createElement('div')
      container.id = 'date-selector-host'
      document.body.appendChild(container)

      // 3.3) Рендерим VNode в контексте основного app
      const vnode = h(DateSelectorHost)
      vnode.appContext = app._context    // <-- ключевой момент
      render(vnode, container)
    }
  }
}
