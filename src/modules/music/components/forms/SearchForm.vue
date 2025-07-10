<!-- components/forms/SearchForm.vue -->
<template>
  <div class="search-form flex-v-center flex bg-white-transp-50 pd-thin radius-extra">
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
import { ref, watch, onMounted, defineEmits } from 'vue';
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
let searchTimeout = null;

const handleSearch = () => {
  emit('search', searchQuery.value.trim());
};

const clearSearch = () => {
  searchQuery.value = '';
  emit('search', '');
  searchInput.value?.focus();
};

// Watch for changes in search query and emit search with debounce
watch(searchQuery, (newQuery) => {
  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  if (newQuery.trim().length >= 2) {
    // Set new timeout for debounce
    searchTimeout = setTimeout(() => {
      handleSearch();
    }, 300);
  } else if (newQuery.trim().length === 0) {
    emit('search', '');
  }
});

// Watch for changes in initialQuery prop
watch(() => props.initialQuery, (newQuery) => {
  if (newQuery !== searchQuery.value) {
    searchQuery.value = newQuery;
  }
});

onMounted(() => {
  if (props.initialQuery) {
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