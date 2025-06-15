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
   state: Array
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
  
  const targetId = event.added ? 
    event.added.element._id : 
    props.items[event.moved.newIndex]._id;
    
  const updatedCategory = findCategoryAndUpdateParent(props.state, targetId);

  if (!updatedCategory) return;
  
  // Обновляем order для всего дерева категорий
  updateOrders(props.state);
  console.log('hi')
  // Отправляем обновленную категорию
  emits('update', updatedCategory);
}

function emitChange(event) {
  emits('update', event);
}
</script> 