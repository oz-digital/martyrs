<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalMixins } from "@martyrs/src/modules/globals/views/mixins/mixins.js"

import * as globals from '@martyrs/src/modules/globals/views/store/globals.js'

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

const toggleSidebar = () => {
  emit('closeSidebar')
}

router.beforeEach((to, from) => {
   if (isPhone() || isTablet()) {
    emits('closeSidebar')
  }
})

</script>

<template>
  <aside
    class="transition-quint-out w-min-0 o-hidden flex-child-default z-index-2  br-r br-solid  flex flex-column h-100"
    :class="[
      stateSidebar
      ? `${width} w-min-10 tablet:w-min-100 tablet:w-100 mobile:w-min-100 mobile:w-100`
      : `${widthHidden} mobile:w-0`,
      // 
      theme === 'light' 
      ? 't-black bg-white br-light'
      : 't-white bg-black br-dark'
    ]"
  >

    <!-- Slot for navigation content -->
    <slot></slot>

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
        @click="() => globals.actions.toggleTheme()"
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
          {{ globals.state.theme.darkmode ? '🌙' : '☀️' }}
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