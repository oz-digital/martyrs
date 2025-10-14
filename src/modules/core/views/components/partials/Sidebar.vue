<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGlobalMixins } from "@martyrs/src/modules/core/views/mixins/mixins.js"
import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js'

const store = useStore()

const props = defineProps({
  theme: {
    type: String,
    default: "light"
  },
  stateSidebar: {
    type: Boolean,
    default: false
  },
  width: {
    type: String,
    default: 'w-15r'
  },
  widthHidden:{
    type: String,
    default: 'w-3r '
  },
})

const emits = defineEmits([
  'closeSidebar'
])

const { isPhone, isTablet } = useGlobalMixins()
const router = useRouter()
const route = useRoute()

// Отдельный флаг для клика меню на mobile
const isManuallyOpened = ref(false)

// Синхронизируем с stateSidebar ТОЛЬКО на mobile
watch(() => props.stateSidebar, (newVal) => {
  if (isPhone() || isTablet()) {
    isManuallyOpened.value = newVal
  }
})

const toggleSidebar = () => {
  isManuallyOpened.value = !isManuallyOpened.value
  if (!isManuallyOpened.value) {
    emits('closeSidebar')
  }
}

const handleMouseEnter = () => {
  if (route.meta?.sidebar_hover && !isPhone() && !isTablet()) {
    store.core.state.isOpenSidebar = true
  }
}

const handleMouseLeave = () => {
  if (route.meta?.sidebar_hover && !isPhone() && !isTablet()) {
    store.core.state.isOpenSidebar = false
  }
}

router.beforeEach((to, from) => {
  // На mobile не трогаем state через навигацию
  if (isPhone() || isTablet()) {
    return
  }

  // Desktop логика
  // Если уходим с профиля И НЕ идем на профиль - закрыть
  if (from.meta?.sidebarCloseOnLeave === true && to.meta?.sidebarOpenOnEnter !== true) {
    store.core.state.isOpenSidebar = false
  }

  // Если приходим на профиль - открыть
  if (to.meta?.sidebarOpenOnEnter === true) {
    store.core.state.isOpenSidebar = true
  }
})
</script>

<template>
  <aside
    data-sidebar
    class="transition-quint-out w-min-0 o-hidden flex-child-default z-index-2  br-r br-solid  flex flex-column h-100"
    :class="[
      { 'mobile-opened': isManuallyOpened },
      stateSidebar
      ? `${width} w-min-10 tablet:w-min-100 tablet:w-100 mobile:w-min-100 mobile:w-100`
      : `${widthHidden} mobile:w-0`,
      //
      theme === 'light'
      ? 't-black bg-white br-light'
      : 't-white bg-black br-dark'
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Slot for header component (e.g., ProfileCard) -->
    <slot name="header"></slot>

    <!-- Slot for navigation content -->
    <slot></slot>

    <!-- Slot for footer component (e.g., HelpCard) -->
    <slot name="footer"></slot>
    <div v-if="MOBILE_APP" @click="() => toggleSidebar()"  class="pos-relative">
      <div class="bg-light radius-medium pd-medium">
        <p  class="t-medium t-black-transp-60">
          Close Menu
        </p>
      </div>
    </div>
    <div 
      class="br-solid w-100 br-t"
      :class="{ 
        'pd-micro': !stateSidebar, 
        'pd-small': stateSidebar,
        'br-light': theme === 'light',
        'br-dark':  theme === 'dark'
      }"
    >
      <button
        @click="() => store.core.actions.toggleTheme()"
        class="transition-quint-out flex w-100 flex-center radius-small cursor-pointer flex-nowrap"
        :class="[
          stateSidebar ? 'pd-thin justify-between' : 'w-100 justify-center',
          theme === 'light' ? 'hover-bg-light' : 'hover-bg-dark'
        ]"
      >
        <span
          class="w-100 t-nowrap transition-quint-out  t-left t-medium mn-r-thin"
          :class="{ 'hidden': !stateSidebar, 'visible': stateSidebar }"
        >
          Dark Mode
        </span>
        <span class="aspect-1x1 flex-child-default w-max-big w-100 flex flex-center ">
          {{ store.core.state.theme.darkmode ? '🌙' : '☀️' }}
        </span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.hidden {
  opacity: 0;
  width: 0;
  display: none;
}
.visible {
  opacity: 1;
  display: block;
}

/* Mobile: ВСЕГДА скрываем, показываем ТОЛЬКО по клику меню */
@media (max-width: 1024px) {
  aside[data-sidebar] {
    position: fixed !important;
    left: 0 !important;
    transform: translateX(-100%) !important;
    visibility: hidden !important;
    z-index: 1000 !important;
  }

  /* Показываем ТОЛЬКО когда manual клик (НЕ от SSR state) */
  aside[data-sidebar].mobile-opened {
    transform: translateX(0) !important;
    visibility: visible !important;
  }
}

/* Scrollbar styles */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: var(--grey-micro);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: var(--grey-small);
}
</style>