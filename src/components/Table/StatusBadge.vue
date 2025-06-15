<script setup>
defineProps({
  value: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <span 
    class="status-badge"
    :style="{ backgroundColor: value.color || '#ddd' }"
  >
    {{ value }}
  </span>
</template>

<style scoped>
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
  color: white;
  display: inline-block;
}
</style>