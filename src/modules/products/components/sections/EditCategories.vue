<template>
  <Block
    title="Categories"
    placeholder="No categories selected"
  >
    <SelectMulti
      v-model="selectedCategories"
      :options="availableCategories"
      :multiple="true"
      :searchable="true"
      :close-on-select="true"
      :clear-on-select="false"
      :preserve-search="true"
      :placeholder="'Add product categories...'"
      :label="'name'"
      :track-by="_id"
      :custom-label="getCategoryLabel"
      :taggable="false"
      :show-labels="false"
      @update:modelValue="handleSelectionChanged"
      class="bg-white radius-medium"
    />

    <div v-if="suggestedCategories.length > 0" class="mn-t-small">
      <p class="p-small mn-b-thin t-transp">Suggested categories:</p>
      <div class="flex flex-wrap gap-nano">
        <span 
          v-for="category in suggestedCategories" 
          :key="category._id"
          @click="addCategory(category)"
          class="cursor-pointer hover-scale-1 bg-main t-black radius-extra pd-thin"
        >
          {{ getCategoryPath(category) }}
        </span>
      </div>
    </div>
  </Block>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Block from '@martyrs/src/components/Block/Block.vue';

import SelectMulti from '@martyrs/src/components/SelectMulti/SelectMulti.vue';

const props = defineProps({
  /**
   * Array of selected category IDs (v-model)
   */
  modelValue: {
    type: Array,
    default: () => []
  },
  /**
   * Flat array of all available categories
   * Each category: { _id, name, parent, path }
   */
  categories: {
    type: Array,
    required: true
  },
  /**
   * Maximum number of categories to suggest
   */
  maxSuggestions: {
    type: Number,
    default: 5
  }
});

const emit = defineEmits(['update:modelValue']);

// State
const categoryMap = ref({});
const selectedCategories = ref([]);

// Build category map for quick lookups
function buildCategoryMap() {
  categoryMap.value = {};
  props.categories.forEach(cat => {
    categoryMap.value[cat._id] = cat;
  });
}

// Initialize category map
watch(() => props.categories, () => {
  buildCategoryMap();
}, { immediate: true });

// Sync modelValue (IDs) with selectedCategories (objects)
watch(() => props.modelValue, (newIds) => {
  selectedCategories.value = newIds.map(id => categoryMap.value[id]).filter(Boolean);
}, { immediate: true });

// Get full category path (e.g., "Electronics > Phones > Smartphones")
function getCategoryPath(category) {
  if (!category) return '';
  
  const path = [category.name];
  let current = category;
  
  while (current.parent && categoryMap.value[current.parent]) {
    current = categoryMap.value[current.parent];
    path.unshift(current.name);
  }
  
  return path.join(' › ');
}

// Custom label for multiselect display
function getCategoryLabel(category) {
  return category.name;
}

// Available categories (not selected)
const availableCategories = computed(() => {
  return props.categories.filter(cat => 
    !props.modelValue.includes(cat._id)
  );
});

// Get suggested categories (most popular or relevant)
const suggestedCategories = computed(() => {
  // Filter out already selected categories
  const available = props.categories.filter(cat => 
    !props.modelValue.includes(cat._id)
  );
  
  // You can implement your own logic here
  // For example: sort by popularity, relevance, or just take first N
  return available.slice(0, props.maxSuggestions);
});

// Handle selection changes from Multiselect
function handleSelectionChanged(newSelection) {
  const newIds = newSelection.map(cat => cat._id);
  emit('update:modelValue', newIds);
}

// Add category from suggestions
function addCategory(category) {
  if (!props.modelValue.includes(category._id)) {
    const newIds = [...props.modelValue, category._id];
    emit('update:modelValue', newIds);
    // Update selectedCategories for immediate UI update
    selectedCategories.value = [...selectedCategories.value, category];
  }
}
</script>