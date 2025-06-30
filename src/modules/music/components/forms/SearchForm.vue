<!-- components/forms/SearchForm.vue -->
<template>
  <div class="search-form flex-v-center flex bg-dark-transp-50 pd-thin radius-extra">
    <IconSearch class="i-small mn-r-small" fill="rgb(var(--grey))"/>
    <input 
      ref="searchInput"
      v-model="searchQuery"
      type="text"
      :placeholder="placeholder"
      class="bg-transparent border-none  flex-1"
      @keydown.enter="handleSearch"
    />
    <Button 
      v-if="searchQuery.length > 0"
      @click="clearSearch"
      class="bg-transparent border-none pd-zero"
      :showLoader="false" 
      :showSucces="false"
    >
      <IconCross class="i-small" fill="rgb(var(--grey))"/>
    </Button>
  </div>
</template>

<script setup>
import { ref, watchEffect, defineEmits } from 'vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import IconSearch from '@martyrs/src/modules/icons/navigation/IconSearch.vue';
import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search...'
  },
  initialQuery: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['search']);

const searchInput = ref(null);
const searchQuery = ref(props.initialQuery);

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim());
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  searchInput.value.focus();
};

watchEffect(() => {
  // Update search query when initialQuery prop changes
  if (props.initialQuery !== searchQuery.value) {
    searchQuery.value = props.initialQuery;
  }
});
</script>

<style scoped>
.search-form {
  transition: background-color 0.2s ease;
}

.search-form:focus-within {
  background-color: rgba(var(--dark), 0.8);
}

input::placeholder {
  color: rgba(var(--grey), 0.8);
}

input:focus {
  outline: none;
}
</style>