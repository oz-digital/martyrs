<template>
  <div class="unit">
    <div class="unit-details">
      <h3>{{ unit.name }}</h3>
      <p>{{ unit.description }}</p>
      <div v-if="editMode">
        <input v-model="editedUnit.name" placeholder="Название отдела" />
        <input v-model="editedUnit.description" placeholder="Описание отдела" />
        <button @click="saveUnit">Сохранить</button>
        <button @click="addSubunit">Добавить подотдел</button>
      </div>
    </div>
    <div class="subunits">
      <unit-component
        v-for="(subunit, index) in unit.subunits"
        :key="index"
        :unit="subunit"
        :edit-mode="editMode"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  unit: {
    type: Object,
    required: true,
  },
  editMode: {
    type: Boolean,
    required: true,
  },
});

const editedUnit = ref({ ...props.unit });

watch(props.unit, () => {
  editedUnit.value = { ...props.unit };
});

async function saveUnit() {
  // Обновление данных отдела на сервере
  // TODO: отправить измененные данные на сервер
  emit("unit-updated", editedUnit.value);
}

async function addSubunit() {
  // Добавление нового подотдела
  // TODO: отправить запрос на сервер для создания нового подотдела
  emit("subunit-added", props.unit._id);
}
</script>
