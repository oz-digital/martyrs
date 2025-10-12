<template>
  <div class="pos-relative">
    <!-- Single selected item -->
    <div
      v-if="single && modelValue"
      class="mn-b-thin"
    >
      <div
        @click="clearSelection"
        class="cursor-pointer"
        :class="classSelected"
      >
        <slot 
          name="selected" 
          :item="modelValue"
          :clear="clearSelection"
        >
          {{ getItemLabel(modelValue) }}
        </slot>
      </div>
    </div>

    <!-- Multiple selected items -->
    <div 
      v-if="multiple && modelValue?.length > 0"
      class="flex flex-wrap gap-thin mn-b-thin"
    >
      <div
        v-for="(item, index) in modelValue"
        :key="getItemKey(item)"
        @click="() => removeItem(index)"
        class="cursor-pointer"
        :class="classSelected"
      >
        <slot 
          name="selected" 
          :item="item"
          :clear="() => removeItem(index)"
        >
          {{ getItemLabel(item) }}
        </slot>
      </div>
    </div>

    <!-- Search always visible -->
    <BlockSearch 
      v-click-outside="closeDropdown" 
      v-model="searchQuery"
      :placeholder="placeholder"
      :class="classSearch"
      @focus="showDropdown = true"
    />
    
    <!-- Dropdown -->
    <div 
      v-if="showDropdown && (searchQuery || showOnFocus)" 
      class="mn-t-thin pos-absolute w-100 pos-t-100 pos-l-0 z-index-3"
      :class="classDropdown"
    >
      <Feed
        :states="states"
        :store="store"
        :skeleton="skeleton"
        :options="{
          ...options,
          search: searchQuery
        }"
        :showLoadMore="false"
        v-slot="{ items }"
        :class="classFeed"
      >
        <!-- Показываем все результаты если есть поиск, иначе фильтруем -->
        <template v-if="filteredItems(items).length > 0">
          <div
            v-for="item in filteredItems(items)"
            :key="getItemKey(item)"
            @click="selectItem(item)"
            class="cursor-pointer"
            :class="[
              classItem,
              isItemSelected(item) ? 'opacity-50' : ''
            ]"
          >
            <slot 
              name="item" 
              :item="item"
              :selected="isItemSelected(item)"
            >
              <Card
                :photo="getCardField(item, 'photo')"
                :title="getCardField(item, 'title')"
                :subtitle="getCardField(item, 'subtitle')"
              />
            </slot>
          </div>
        </template>
        <!-- Если все результаты отфильтрованы, показываем сообщение -->
        <div v-else-if="items?.length > 0" class="pd-thin text-center text-muted">
          Все найденные элементы уже выбраны
        </div>
      </Feed>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Feed from '@martyrs/src/components/Feed/Feed.vue'
import BlockSearch from '@martyrs/src/modules/core/views/components/blocks/BlockSearch.vue'
import Card from '@martyrs/src/modules/core/views/components/blocks/Card.vue'
import clickOutside from '@martyrs/src/components/FieldPhone/click-outside.js'

// Directives
const vClickOutside = clickOutside

// Props
const props = defineProps({
  // Model value - single item or array of items
  modelValue: {
    type: [Object, Array],
    default: null
  },
  // Mode
  multiple: {
    type: Boolean,
    default: false
  },
  // Search
  placeholder: {
    type: String,
    default: 'Search...'
  },
  showOnFocus: {
    type: Boolean,
    default: false
  },
  // Allow selecting already selected items in search
  allowReselect: {
    type: Boolean,
    default: false
  },
  // Transform function to modify item before saving
  transform: {
    type: Function,
    default: null
  },
  // Feed configuration
  store: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  },
  states: {
    type: Object,
    default: () => ({
      empty: {
        title: 'No items found',
        description: 'Try different search terms'
      }
    })
  },
  skeleton: {
    type: Object,
    default: () => ({
      hide: false,
      horizontal: true,
      structure: [
        { block: 'text', size: 'large' }
      ]
    })
  },
  // Item configuration
  key: {
    type: [String, Function],
    default: '_id'
  },
  label: {
    type: [String, Function],
    default: 'name'
  },
  // Card fields mapping
  labels: {
    type: Object,
    default: () => ({
      photo: 'profile.photo',
      title: 'profile.name',
      subtitle: 'profile.description'
    })
  },
  // Styling
  classSearch: {
    type: String,
    default: 'bg-white'
  },
  classSelected: {
    type: String,
    default: 'bg-white pd-thin radius-medium'
  },
  classDropdown: {
    type: String,
    default: 'bg-light pd-small radius-small'
  },
  classItem: {
    type: String,
    default: 'bg-white pd-thin radius-medium mn-b-thin'
  },
  classFeed: {
    type: String,
    default: 'h-max-20r o-scroll'
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'select', 'remove', 'clear'])

// State
const searchQuery = ref('')
const showDropdown = ref(false)

// Computed
const single = computed(() => !props.multiple)

// Methods
const getItemKey = (item) => {
  if (!item) return null

  if (typeof props.key === 'function') {
    return props.key(item)
  }
  // Убедитесь, что item[props.key] существует
  return item[props.key] || item._id || null
}

const getItemLabel = (item) => {
  if (!item) return ''
  if (typeof props.label === 'function') {
    return props.label(item)
  }
  return item[props.label] || ''
}

// Get nested field value from item using dot notation
const getCardField = (item, fieldType) => {
  const path = props.labels[fieldType]
  if (!path) return null
  
  return path.split('.').reduce((obj, key) => obj?.[key], item)
}

// Transform item if transform function is provided
const transformItem = (item) => {
  if (props.transform && typeof props.transform === 'function') {
    return props.transform(item)
  }
  return item
}

// Check if item is already selected
const isItemSelected = (item) => {
  if (!item) return false
    
  const itemKey = getItemKey(item)
  
  if (props.multiple) {
    // Для множественного выбора
    if (!props.modelValue || !Array.isArray(props.modelValue)) return false
    
    return props.modelValue.some(selectedItem => {
      if (!selectedItem) return false
      const selectedKey = getItemKey(selectedItem)
      return selectedKey === itemKey
    })
  } else {
    // Для одиночного выбора
    if (!props.modelValue) return false
    const selectedKey = getItemKey(props.modelValue)
    return selectedKey === itemKey
  }
}

// Filter items - более гибкая логика
const filteredItems = (items) => {
  if (!items) return []
  
  // Фильтруем undefined элементы
  const validItems = items.filter(item => item != null)
  
  // Если есть активный поиск и allowReselect = true, показываем все результаты
  if (searchQuery.value && props.allowReselect) {
    return validItems
  }
  
  // Если есть активный поиск, показываем все результаты, но помечаем выбранные
  if (searchQuery.value) {
    return validItems
  }
  
  // Если нет поиска, исключаем уже выбранные элементы
  return validItems.filter(item => !isItemSelected(item))
}

const selectItem = (item) => {
  // Проверяем, не выбран ли уже этот элемент
  if (isItemSelected(item) && !props.allowReselect) {
    return
  }
  
  // Трансформируем элемент перед добавлением
  const transformedItem = transformItem(item)
  
  if (props.multiple) {
    // Если элемент уже выбран и allowReselect = false, не добавляем его снова
    if (isItemSelected(item)) {
      return
    }
    const newValue = props.modelValue ? [...props.modelValue, transformedItem] : [transformedItem]
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', transformedItem)
    closeDropdown()
  }
  emit('select', transformedItem)
  searchQuery.value = ''
}

const removeItem = (index) => {
  if (!props.multiple || !props.modelValue) return
  
  const newValue = [...props.modelValue]
  const removed = newValue.splice(index, 1)[0]
  emit('update:modelValue', newValue)
  emit('remove', removed)
}

const clearSelection = () => {
  emit('update:modelValue', props.multiple ? [] : null)
  emit('clear')
  searchQuery.value = ''
}

const closeDropdown = () => {
  showDropdown.value = false
}

// Reset dropdown when search changes
watch(searchQuery, (val) => {
  showDropdown.value = true
})
</script>

<style scoped>
.opacity-50 {
  opacity: 0.5;
}
.text-center {
  text-align: center;
}
.text-muted {
  color: #6c757d;
}
</style>