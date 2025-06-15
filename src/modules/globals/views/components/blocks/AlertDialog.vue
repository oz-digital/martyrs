<template>
  <Popup 
    :title="alertState.title" 
    :isPopupOpen="alertState.visible"
    @close-popup="closeAlert" 
    class="bg-white w-min-20r w-max-30r w-max-100 radius-medium pd-medium"
  >
    <p class="mn-b-medium">{{ alertState.message }}</p>

    <footer class="flex-nowrap flex-justify-end flex gap-thin">
      <button
        v-for="(action, index) in alertState.actions"
        :key="index"
        @click="handleAction(action)"
        class="button pd-small radius-medium bg-main"
      >
        {{ action.label }}
      </button>
    </footer>

  </Popup>
</template>

<script setup>
import { toRefs } from 'vue'
import Popup from "@martyrs/src/components/Popup/Popup.vue";

const props = defineProps({
  alertState: { type: Object, required: true },
  handleAction: { type: Function, required: true },
  closeAlert: { type: Function, required: true }
})

const { alertState } = toRefs(props)
</script>