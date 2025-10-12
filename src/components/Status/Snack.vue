<template>
  <div class="snack-wrapper" v-if="show">
    <div 
      class="flex-nowrap flex-v-center flex radius-small pd-small t-white"
      :class="snackClass"
        @click="$emit('close')" 
    >
      <component 
        :is="iconComponent" 
        fill="rgb(var(--white))" 
        class="t-transp i-medium mn-r-thin z-index-5"
      />
      <p class="w-100">
        {{ te(`core.snacks.${message}`) ? t(`core.snacks.${message}`) : message }}
      </p>
      <!-- <IconCross 
        @click="$emit('close')" 
        class="cursor-pointer hover-scale-1 i-medium z-index-5"
      /> -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import IconInfo from '@martyrs/src/modules/icons/navigation/IconInfo.vue'
import IconSuccess from '@martyrs/src/modules/icons/navigation/IconInfo.vue'
import IconAlert from '@martyrs/src/modules/icons/navigation/IconInfo.vue'

import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue'

const { t, te } = useI18n({ useScope: 'global' })

const props = defineProps({
  type: {
    type: String,
    default: 'notification',
    validator: (v) => ['error', 'success', 'alert', 'notification'].includes(v)
  },
  message: String,
  show: Boolean
})

defineEmits(['close'])

const snackClass = computed(() => ({
  'bg-red': props.type === 'error',
  'bg-green': props.type === 'success', 
  'bg-fourth': props.type === 'alert',
  'bg-second': props.type === 'notification'
}))

const iconComponent = computed(() => {
  const icons = {
    error: IconCross,
    success: IconSuccess,
    alert: IconAlert,
    notification: IconInfo
  }
  return icons[props.type] || IconInfo
})
</script>

<style lang="scss">
.snack-wrapper {
  position: fixed;
  bottom: var(--gap);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}
</style>