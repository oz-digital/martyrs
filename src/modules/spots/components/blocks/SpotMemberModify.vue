<template>
  <div>
    <div class="br-grey-transp-25 radius-small mn-b-small">
      <VueSelect 
        v-if="props.spot === null"
        v-model="spotForm.subspot"
        :options="filteredSpots"
        :get-option-label='option => option.name' 
        class="w-100 mn-b-small"
      /> 
      <div v-else class="pd-small br-grey-transp-25 br-1px br-solid">
        {{ spotForm.name ? spotForm.name : 'Безымянный' }}
      </div>
    </div>

    <button :disabled="!spotForm.subspot" v-if="props.spot === null" @click="submitForm" class="w-100 button bg-second t-white">
      Добавить отдел
    </button>

    <button v-if="props.spot !== null" @click="removeMember" class="w-100 button bg-fourth t-white">
      Удалить отдел
    </button> 
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

import Field from "@martyrs/src/components/Field/Field.vue";
import Select from "@martyrs/src/components/Select/Select.vue";
const props = defineProps({
  isPopupOpen: Boolean,
  spot: Number,
  spots: Array,
  mainspot: Object,
  allspots: Array,
});

const emits = defineEmits(['callback', 'remove']);

const spotForm = ref({
  subspot: null,
});

if (props.spot !== null) {
  spotForm.value = props.spots[props.spot];
}

function filterSpots(allSpots, spots, editingSpot) {
  return allSpots.filter((spot) => {
    if (spots.some((dept) => dept._id === spot._id)) {
      return false;
    }
    if (editingSpot._id === spot._id) {
      return false;
    }
    return true;
  });
}

const filteredSpots = computed(() => {
  return filterSpots(props.allspots, props.spots, props.mainspot);
});

async function submitForm() {
  props.spots.push(spotForm.value.subspot);
  emits("callback");
}

async function removeMember() {
  props.spots.splice(props.spot, 1);
  emits("callback");
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
