<template>
  <div class="dropdown pos-relative" v-click-outside="clickedOutside" @click.stop="isOpen = !isOpen">
    <div v-if="isComponentLabel" class="w-100 h-100 flex-center flex">
      <component :is="label.component" v-bind="label.props" :class="label.class"></component>
    </div>
    <div v-else>
      {{ label }}
    </div>
    <transition name="TransitionTranslateY" mode="out-in">
      <div 
        v-show="isOpen" 
        :style="{ left: align === 'left' ? '0' : 'auto', right: align === 'right' ? '0' : 'auto' }" 
        class="dropdown-content radius-big" 
      >
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import clickOutside from '../FieldPhone/click-outside.js';

let vClickOutside = clickOutside

const props = defineProps({
  label: {
    type: [String, Object],
    default: 'Open'
  },
  align: {
    type: String,
    default: 'left'
  }
})

const isOpen = ref(false);
const isComponentLabel = computed(() => typeof props.label === 'object');

function clickedOutside () {
  isOpen.value = false
}
</script>

<style >
.dropdown-content {
  display: block;
  position: absolute;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

/*.dropdown:hover .dropdown-content {
  display: block;
}*/
</style>
