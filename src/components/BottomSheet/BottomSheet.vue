<template>
  <transition name="slideY"  mode="out-in">
    <section 
      v-if="show"
      ref="wrapper" 
      class="w-100 bs-black rows-1 h-100"
      :class="{
        'pd-t-extra': MOBILE_APP === 'ios',  
      }"
      >
      <!-- Toggle To Close -->
      <div
        @click="emits('toggle')"
        @mousedown="startDrag"
        @touchstart="startDrag"
        @mousemove="onDrag"
        @touchmove="onDrag"
        @mouseup="endDrag"
        @touchend="endDrag"
        @mouseleave="endDrag"
        class="bs-black pd-small br-b br-solid br-light pos-relative bg-white flex-center flex z-index-2"
      >
        <div class="radius-extra pd-nano w-3r h-1r bg-light"></div>
      </div>
      
      <slot></slot>
    </section>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  options: {
    type: Object,
    default: {
      position: false
    }
  }
})

const emits = defineEmits([
  'toggle'
])

const wrapper = ref(null)

const startY = ref(0);
const currentY = ref(0);
const dragging = ref(false);

watch(() => props.show, (newVal) => {
  if (newVal) {
    document.body.classList.add('no-scroll');
  } else {
    document.body.classList.remove('no-scroll');
  }
});

function startDrag(event) {
  dragging.value = true;
  startY.value = event.touches ? event.touches[0].clientY : event.clientY;
  currentY.value = startY.value;
}

function onDrag(event) {
  if (!dragging.value) return;
  event.preventDefault(); // Prevent scrolling while dragging
  currentY.value = event.touches ? event.touches[0].clientY : event.clientY;
  const deltaY = currentY.value - startY.value;

  if (deltaY > 0) {
    wrapper.value.style.top = `${deltaY}px`;
  }
}
function endDrag() {
  if (!dragging.value) return;

  dragging.value = false;

  const deltaY = currentY.value - startY.value;
  const threshold = window.innerHeight * 0.2;

  if (deltaY < threshold) {
    // If less than 40%, snap back to the original position
    wrapper.value.style.top = '';
  } else {
    // If more than 40%, hide the element
    emits('toggle')
    // VisualizerWrapper.value.style.top = '';
  }
}
</script>