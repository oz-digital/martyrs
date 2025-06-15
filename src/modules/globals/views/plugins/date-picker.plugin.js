// date-selector.plugin.js
import { reactive, markRaw, defineComponent, h, render } from 'vue'
import PopupDateSelector from '@martyrs/src/modules/globals/views/components/blocks/PopupDateSelector.vue'
import * as globals from '@martyrs/src/modules/globals/views/store/globals.js'

// 1) Общее состояние и API
const state = reactive({
  isOpen: false,
  product: null,
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

export function showDateSelector(product, customOptions = {}) {
  return new Promise((res, rej) => {
    state.resolve = res
    state.reject  = rej
    state.product = markRaw(product)
    state.options = { ...getDefaultOptions(), ...customOptions }
    state.isOpen  = true
  })
}

function confirmSelection(dates) {
  state.isOpen = false
  state.resolve?.(dates)
  state.resolve = state.reject = null
}

function cancelSelection() {
  state.isOpen = false
  state.reject?.(new Error('Date selection cancelled'))
  state.resolve = state.reject = null
}

// 2) Хост-компонент
const DateSelectorHost = defineComponent({
  name: 'DateSelectorHost',
  setup() {
    return () =>
      state.isOpen
        ? h(PopupDateSelector, {
            product: state.product,
            isOpen: state.isOpen,
            showFees: state.options.showFees,
            feesRate: state.options.feesRate,
            showVat: state.options.showVat,
            vatRate: state.options.vatRate,
            onConfirm: confirmSelection,
            onCancel: cancelSelection,
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
