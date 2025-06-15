<template>
  <div class="cursor-pointer tooltip-container" @mouseover="showTooltip" @mouseleave="hideTooltip">
    <slot></slot>
    <div  class="tooltip-content" :style="tooltipStyle">
      {{ text }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true
  }
});

const visible = ref(false);

const tooltipStyle = reactive({
  position: 'absolute',
  width: 'max-content',
  zIndex: 1000,
  background: '#333',
  color: '#fff',
  padding: '5px 10px',
  borderRadius: '3px',
  fontSize: '14px',
  display: 'none',
});

function showTooltip(event) {
  visible.value = true;
  tooltipStyle.left = `${(event.clientX / 100) + 10 }px`;
  tooltipStyle.top = `${(event.clientY / 100) + 10 }px`;
  tooltipStyle.display = 'block';
}

function hideTooltip() {
  visible.value = false;
  tooltipStyle.display = 'none';
}
</script>

<style >
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-content {
  pointer-events: none;
}
</style>