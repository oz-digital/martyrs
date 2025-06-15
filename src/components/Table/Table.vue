<!-- src/components/Table/Table.vue -->
<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  // принимаем уже отформатированный набор строк
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  // массив колонок { key, label }
  columns: {
    type: Array,
    required: true,
    default: () => []
  }
})

// если вам нужен геттер для вложенных свойств
const getNestedValue = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj) 
</script>

<template>
  <div class="o-x-scroll">
    <table class="w-100 custom-table">
      <thead class="t-left bg-light t-black">
        <tr>
          <th v-for="col in columns" :key="col.key" class="pd-small t-medium">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in props.items" :key="rowIndex">
          <td v-for="col in columns" :key="col.key" class="pd-small br-t br-solid br-light t-left">
            <!-- Передаем полный объект row и текущее значение -->
            <slot :name="`cell-${col.key}`" :value="getNestedValue(row, col.key)" :row="row">
              {{ getNestedValue(row, col.key) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.custom-table {
  border-collapse: collapse;
  td {
    vertical-align: middle;
  }
}
</style>