<template>
  <div ref="container" class="draggable-container">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  list: {
    type: Array,
    required: true,
  },
  disabledClass: {
    type: String,
    default: 'draggable-disabled',
  },
});

const emit = defineEmits(['update:list', 'start', 'end']);
const container = ref(null);

let dragStartIndex = null;

onMounted(() => {
  const handleDragStart = (e) => {
    const target = e.target.closest('.draggable-item');
    if (!target || target.classList.contains(props.disabledClass)) {
      e.preventDefault();
      return;
    }
    dragStartIndex = Number(target.dataset.index);
    e.dataTransfer.effectAllowed = 'move';
    emit('start', dragStartIndex);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const target = e.target.closest('.draggable-item');
    if (!target || target.classList.contains(props.disabledClass)) {
      return;
    }
    const dragEndIndex = Number(target.dataset.index);
    if (dragStartIndex !== dragEndIndex && !isInvalidMove(dragStartIndex, dragEndIndex)) {
      const updatedList = [...props.list];
      const [removed] = updatedList.splice(dragStartIndex, 1);
      updatedList.splice(dragEndIndex, 0, removed);
      emit('update:list', updatedList);
    }
    emit('end', dragStartIndex, dragEndIndex);
    dragStartIndex = null;
  };

  const handleTouchStart = (e) => {
    const target = e.target.closest('.draggable-item');
    if (!target || target.classList.contains(props.disabledClass)) {
      e.preventDefault();
      return;
    }
    dragStartIndex = Number(target.dataset.index);
    emit('start', dragStartIndex);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    const target = document.elementFromPoint(
      e.changedTouches[0].clientX,
      e.changedTouches[0].clientY
    ).closest('.draggable-item');
    if (!target || target.classList.contains(props.disabledClass)) {
      return;
    }
    const dragEndIndex = Number(target.dataset.index);
    if (dragStartIndex !== dragEndIndex && !isInvalidMove(dragStartIndex, dragEndIndex)) {
      const updatedList = [...props.list];
      const [removed] = updatedList.splice(dragStartIndex, 1);
      updatedList.splice(dragEndIndex, 0, removed);
      emit('update:list', updatedList);
    }
    emit('end', dragStartIndex, dragEndIndex);
    dragStartIndex = null;
  };

  const isInvalidMove = (start, end) => {
    const disabledIndices = Array.from(container.value.children)
      .map((child, index) => (child.classList.contains(props.disabledClass) ? index : null))
      .filter(index => index !== null);
    return disabledIndices.includes(end);
  };

  container.value.addEventListener('dragstart', handleDragStart);
  container.value.addEventListener('dragover', handleDragOver);
  container.value.addEventListener('drop', handleDrop);
  container.value.addEventListener('touchstart', handleTouchStart);
  container.value.addEventListener('touchmove', handleTouchMove);
  container.value.addEventListener('touchend', handleTouchEnd);
});
</script>

<style>
.draggable-container {
  display: flex;
  flex-direction: column;
}
</style>
