<template>
  <div>
    <div @click="toggleSpoiler" class="flex-v-center flex-nowrap flex">
      <slot name="header" :isOpen="showSpoiler"></slot>
    </div>
    <transition
      name="collapse"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
    >
      <div v-show="showSpoiler" class="spoiler" ref="spoilerContent">
        <slot name="content"></slot>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  status: {
    type: Boolean,
    default: false
  }
});

const showSpoiler = ref(false);
const spoilerContent = ref(null);

onMounted(() => {
  if (props.status) {
    showSpoiler.value = props.status;
  }
});

const toggleSpoiler = () => {
  showSpoiler.value = !showSpoiler.value;
};

// Анимация открытия
const onEnter = (el) => {
  el.style.height = '0';
  void el.offsetHeight; // force reflow
  el.style.height = el.scrollHeight + 'px';
};

const onAfterEnter = (el) => {
  el.style.height = 'auto';
};

// Анимация закрытия
const onLeave = (el) => {
  el.style.height = el.scrollHeight + 'px';
  void el.offsetHeight; // force reflow
  el.style.height = '0';
};

defineExpose({
  showSpoiler
});
</script>
<style lang="scss">
.spoiler {
  overflow: hidden;
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>