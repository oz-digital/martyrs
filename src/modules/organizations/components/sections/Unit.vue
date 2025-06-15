<template>
  <div class="bg-white o-hidden radius-small pd-medium">
    <div class="mn-b-small">
      <h5 class="mn-b-small">Название отдела:</h5>
      <input type="text" class="h3" v-model="unit.name" />

    </div>
    <hr class="mn-b-small">
    <div class="mn-b-small">
      <h5 class="mn-b-small">Команда: </h5>

      <ul class="mn-b-thin">
        <li v-if="unit.participants.length < 1">В отделе еще нет участников</li>
        <li v-for="(participant, index) in unit.participants" :key="index" class="mn-b-thin flex-v-center flex-nowrap flex">
          <p class="mn-r-small">{{ participant }}</p>
          <button @click="removeParticipant(index)" class="button-small button">x</button>
        </li>
      </ul>

      <button @click="addParticipant" class="button-small button">Добавить</button>
    </div>

     <hr class="mn-b-small">
         <h5 class="mn-b-small">Подотделы:</h5>
    <div class=" o-hidden mn-b-small radius-small subunit" v-for="(subunit, index) in unit.subunits" :key="index">


      <Unit  :unit="subunit" @removeUnit="removeSubunit(index)" @addParticipant="addParticipantToSubunit(index, $event)" @addSubunit="addSubunitToSubunit(index)"/>
    

    </div>
    <button @click="addSubunit" class="button-small mn-b-small button">Добавить отдел</button>

      <hr class="mn-b-small">

     <button @click="emitRemoveUnit" class="w-100 br-dark bg-transp button-small button">Удалить отдел</button>

    
  
  </div>
</template>

<script setup>
import Unit   from '@martyrs/src/modules/organizations/components/sections/Unit.vue'

const props = defineProps({
  unit: Object,
});

const emits = defineEmits(['removeUnit', 'addParticipant', 'addSubunit']);

function addParticipant(index) {
  const participant = prompt('Enter participant name:');

  if (participant) {
    emits('addParticipant',participant)
  }
}

function removeParticipant(index) {
  props.unit.participants.splice(index, 1);
}

function addSubunit(index) {
  emits('addSubunit',index);
}

function emitRemoveUnit(index) {
  emits('removeUnit',index)
}

function removeSubunit(index) {
  props.unit.subunits.splice(index, 1);
}

function addParticipantToSubunit(subunitIndex, participant) {
  props.unit.subunits[subunitIndex].participants.push(participant);
}

function addSubunitToSubunit(subunitIndex) {
  props.unit.subunits[subunitIndex].subunits.push({
    name: 'Безымянный подотдел',
    participants: [],
    subunits: [],
  });
}

</script>

<style scoped>
.subunit {
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
}
</style>