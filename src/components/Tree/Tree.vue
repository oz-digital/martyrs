<template>
  <VueDraggableNext
    v-bind="dragOptions" 
    class="dragArea list-group w-full"
    :list="items"
    :handle="'.my-handle'"
    @change="handleChange"
  >
    <div v-for="item in items" :key="item._id" class="mn-t-thin  radius-medium mn-b-thin">
      <slot
        :item="item"
      >
      </slot>
      <Tree 
        :items="item.children"
        :state="state"
        :parent-id="item._id"
        @update="emitChange"
        class="pd-l-medium"
        v-slot="{ item }"
      >
        <slot
          :item="item"
          >
        </slot>
      </Tree>
    </div>
  </VueDraggableNext>
</template>

<script setup>
import { VueDraggableNext } from 'vue-draggable-next';

import Tree from './Tree.vue';

const props = defineProps({
  items: Array,
  state: Array,
  parentId: { type: String, default: null }
});

const emits = defineEmits(['update']);

const dragOptions = {
  animation: 200,
  group: 'category',
  ghostClass: 'ghost'
};

function findCategoryAndUpdateParent(items, targetId, parentId = null) {
  for (const item of items) {
    if (item._id === targetId) {
      item.parent = parentId;
      return item;
    }
    
    if (item.children) {
      const found = findCategoryAndUpdateParent(item.children, targetId, item._id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function updateOrders(items, startOrder = 0) {
  let currentOrder = startOrder;
  
  items.forEach(item => {
    item.order = currentOrder++;
    
    if (item.children?.length) {
      currentOrder = updateOrders(item.children, currentOrder);
    }
  });
  
  return currentOrder;
}

function handleChange(event) {
  console.log('event order is', event)
  if (!event.added && !event.moved) return;
  
  let movedItem = null;
  
  if (event.added) {
    // Элемент добавлен с другого уровня
    movedItem = event.added.element;
    // Устанавливаем правильный parent для этого уровня
    movedItem.parent = props.parentId;
  } else if (event.moved) {
    // Элемент перемещен на том же уровне (только изменение порядка)
    movedItem = props.items[event.moved.newIndex];
    // Parent не меняется при перемещении на том же уровне
  }
  
  // Обновляем order для текущего уровня
  props.items.forEach((item, index) => {
    item.order = index;
  });
  
  // Передаем полную информацию об изменении
  emits('update', {
    movedItem: movedItem,
    parentId: props.parentId,
    items: props.items
  });
}

function emitChange(event) {
  emits('update', event);
}
</script> 