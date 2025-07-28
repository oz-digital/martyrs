<template>
  <div class="w-100">
    <p class="mn-b-medium t-transp">
      Customize which columns are visible in your inventory table.
    </p>

    <div class="mn-b-medium">
      <div
        v-for="col in columns"
        :key="col.key"
        class="mn-b-small"
      >
        <Checkbox
          :label="col.label"
          name="columnVisibility"
          :value="col.key"
          class="w-100 bg-light radius-small pd-small"
          :checked="selected.includes(col.key)"
          @update:checked="val => toggle(col.key, val)"
        />
      </div>
    </div>

    <div class="flex-nowrap flex gap-small">
      <Button
        :submit="() => $emit('close')"
        :showLoader="false"
        :showSucces="false"
        class="pd-small radius-small flex-center flex w-max cursor-pointer t-transp"
      >
        Cancel
      </Button>

      <Button
        :submit="saveSettings"
        :showLoader="false"
        :showSucces="false"
        class="pd-small radius-small flex-center flex w-100 cursor-pointer bg-main t-black"
      >
        Save Settings
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue'
import Button from '@martyrs/src/components/Button/Button.vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['save', 'close'])

// Локальный массив выбранных ключей
const selected = ref(props.columns.filter(c => c.visible).map(c => c.key))

// Синхронизируем, если проп изменится
watch(
  () => props.columns,
  cols => {
    selected.value = cols.filter(c => c.visible).map(c => c.key)
  }
)

// Добавление/удаление ключа
function toggle(key, checked) {
  const idx = selected.value.indexOf(key)
  if (checked && idx === -1) {
    selected.value.push(key)
  } else if (!checked && idx !== -1) {
    selected.value.splice(idx, 1)
  }
}

// Эмитим массив видимых колонок
function saveSettings() {
  emit('save', selected.value)
}
</script>
