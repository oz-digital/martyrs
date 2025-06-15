<script setup>
import { defineProps, h } from 'vue'

const props = defineProps({
  value: {
    type: [String, Number, Object, Array],
    required: true
  },
  column: {
    type: Object,
    required: true
  }
})

const renderContent = () => {
  // If component is specified, use it
  if (props.column.component) {
    return h(props.column.component, { value: props.value })
  }
  
  // If formatter is specified, use it
  if (props.column.formatter) {
    return props.column.formatter(props.value)
  }
  
  // If value is object, format it safely
  if (typeof props.value === 'object' && props.value !== null) {
    try {
      // Only display enumerable properties
      const safeObj = Object.keys(props.value).reduce((acc, key) => {
        // Skip functions and complex objects to prevent circular refs
        const val = props.value[key]
        if (typeof val !== 'function' && typeof val !== 'object') {
          acc[key] = val
        }
        return acc
      }, {})
      return JSON.stringify(safeObj)
    } catch (e) {
      return '[Complex Object]'
    }
  }
  
  // Default rendering
  return props.value
}
</script>

<template>
  <component 
    :is="column.wrapper || 'div'" 
    class="table-cell-content"
  >
    <component 
      v-if="column.component" 
      :is="column.component" 
      :value="value" 
    />
    <template v-else>
      {{ renderContent() }}
    </template>
  </component>
</template>

<style scoped>
.table-cell-content {
  width: 100%;
  height: 100%;
}
</style>