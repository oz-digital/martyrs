<template>
  <div class="field-tags-new">
    <!-- Tags container -->
    <div class="tags-container">
      <span 
        v-for="(tag, index) in tags" 
        :key="index"
        class="tag"
      >
        {{ getTagText(tag) }}
        <button 
          @click="removeTag(index)" 
          class="tag-remove"
          type="button"
        >
          ×
        </button>
      </span>
      
      <input
        ref="inputRef"
        v-model="newTag"
        @keydown="handleKeyDown"
        @paste="handlePaste"
        @focus="focused = true"
        @blur="handleBlur"
        :placeholder="placeholder || 'Add tags'"
        :maxlength="maxlength"
        :disabled="disabled"
        class="tag-input"
      />
    </div>
    
    <!-- Autocomplete dropdown -->
    <div 
      v-if="showAutocomplete && filteredAutocomplete.length > 0"
      class="autocomplete"
    >
      <div 
        v-for="(item, index) in filteredAutocomplete"
        :key="getTagText(item)"
        @click="addTag(item)"
        @mouseenter="selectedIndex = index"
        :class="['autocomplete-item', { selected: selectedIndex === index }]"
      >
        {{ getTagText(item) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Array,
  textField: {
    type: String,
    default: 'text'
  },
  autocompleteItems: Array,
  separators: {
    type: Array,
    default: () => [',', ';']
  },
  addOnKey: {
    type: Array,
    default: () => [13] // Enter key
  },
  maxTags: {
    type: Number,
    default: 20
  },
  maxlength: {
    type: Number,
    default: 50
  },
  placeholder: String,
  disabled: Boolean,
  addOnBlur: {
    type: Boolean,
    default: true
  },
  autocompleteMinLength: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['update:modelValue', 'tags-changed'])

// State
const newTag = ref('')
const focused = ref(false)
const selectedIndex = ref(-1)
const inputRef = ref(null)

// Computed
const tags = computed({
  get: () => props.modelValue || [],
  set: (value) => {
    emit('update:modelValue', value)
    emit('tags-changed', value)
  }
})

const showAutocomplete = computed(() => {
  return focused.value && 
         props.autocompleteItems?.length > 0 &&
         newTag.value.length >= props.autocompleteMinLength
})

const filteredAutocomplete = computed(() => {
  if (!props.autocompleteItems) return []
  
  const searchText = newTag.value.toLowerCase()
  
  return props.autocompleteItems.filter(item => {
    const itemText = getTagText(item).toLowerCase()
    
    // Filter by search text
    if (!itemText.includes(searchText)) return false
    
    // Filter out duplicates
    return !isDuplicate(itemText)
  })
})

// Methods
function getTagText(tag) {
  if (tag === null || tag === undefined) return ''
  if (typeof tag === 'string') return tag
  return tag[props.textField] || ''
}

function createTag(text) {
  // Preserve format based on existing data
  if (tags.value.length > 0) {
    if (typeof tags.value[0] === 'string') {
      return text
    }
  }
  
  // Default to object with custom field
  return { [props.textField]: text }
}

function isDuplicate(text) {
  const searchText = text.toLowerCase().trim()
  return tags.value.some(tag => 
    getTagText(tag).toLowerCase().trim() === searchText
  )
}

function addTag(input) {
  let text = ''
  
  if (typeof input === 'string') {
    text = input.trim()
  } else if (typeof input === 'object') {
    // If it's an autocomplete item, preserve the whole object
    if (props.autocompleteItems?.includes(input)) {
      if (!isDuplicate(getTagText(input))) {
        tags.value = [...tags.value, input]
      }
      newTag.value = ''
      selectedIndex.value = -1
      return
    }
    text = getTagText(input).trim()
  }
  
  if (!text || tags.value.length >= props.maxTags) return
  
  if (isDuplicate(text)) return
  
  const tag = createTag(text)
  tags.value = [...tags.value, tag]
  newTag.value = ''
  selectedIndex.value = -1
}

function removeTag(index) {
  if (props.disabled) return
  
  const newTags = [...tags.value]
  newTags.splice(index, 1)
  tags.value = newTags
}

function handleKeyDown(event) {
  // Handle arrow keys for autocomplete navigation
  if (showAutocomplete.value) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      selectedIndex.value = Math.min(
        selectedIndex.value + 1, 
        filteredAutocomplete.value.length - 1
      )
      return
    }
    
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      return
    }
    
    // Add selected autocomplete item on Enter
    if (event.key === 'Enter' && selectedIndex.value >= 0) {
      event.preventDefault()
      addTag(filteredAutocomplete.value[selectedIndex.value])
      return
    }
  }
  
  // Check for add triggers
  const shouldAdd = props.addOnKey.some(key => {
    if (typeof key === 'number') {
      return event.keyCode === key
    }
    return event.key === key
  })
  
  if (shouldAdd) {
    event.preventDefault()
    addTag(newTag.value)
    return
  }
  
  // Handle backspace to delete last tag
  if (event.key === 'Backspace' && newTag.value === '' && tags.value.length > 0) {
    removeTag(tags.value.length - 1)
  }
}

function handlePaste(event) {
  event.preventDefault()
  
  const text = event.clipboardData.getData('text')
  if (!text) return
  
  // Create regex from separators
  const separatorRegex = new RegExp(
    props.separators.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  )
  
  // Split by separators and add each tag
  const parts = text.split(separatorRegex)
  
  parts.forEach(part => {
    if (tags.value.length >= props.maxTags) return
    addTag(part)
  })
}

function handleBlur() {
  // Small delay to allow click on autocomplete items
  setTimeout(() => {
    focused.value = false
    selectedIndex.value = -1
    
    if (props.addOnBlur && newTag.value) {
      addTag(newTag.value)
    }
  }, 200)
}

// Reset selected index when autocomplete items change
watch(filteredAutocomplete, () => {
  selectedIndex.value = -1
})
</script>

<style scoped>
.field-tags-new {
  position: relative;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgb(var(--gray-light, 248, 248, 248));
  border-radius: 0.5rem;
  min-height: 3rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  background: rgb(var(--main, 255, 215, 0));
  color: rgb(var(--black, 0, 0, 0));
  padding: 0.25rem 0.5rem;
  border-radius: 2rem;
  font-size: 0.875rem;
}

.tag-remove {
  margin-left: 0.25rem;
  background: none;
  border: none;
  color: inherit;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
}

.tag-remove:hover {
  opacity: 1;
}

.tag-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  min-width: 150px;
  padding: 0.25rem;
  font-size: inherit;
  font-family: inherit;
}

.tag-input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.autocomplete {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background: white;
  border: 1px solid rgb(var(--gray, 224, 224, 224));
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
}

.autocomplete-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.autocomplete-item:hover,
.autocomplete-item.selected {
  background: rgb(var(--gray-light, 248, 248, 248));
}

.autocomplete-item:first-child {
  border-radius: 0.5rem 0.5rem 0 0;
}

.autocomplete-item:last-child {
  border-radius: 0 0 0.5rem 0.5rem;
}
</style>