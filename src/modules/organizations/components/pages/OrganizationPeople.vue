<template>
  <div class="pd-medium bg-light">
    <h2 class="mn-b-small">Структура организации</h2>
 
  
      <Unit 
        v-for="(unit, index) in units" 
        :key="index" 
        :unit="unit" 
        @removeUnit="removeUnit(index)" 
        @addSubunit="addSubunit(index)"
        @addParticipant="addParticipant(index, $event)" 
        
        class="mn-b-small"
      />
   
    <button @click="addUnit" class="mn-b-small bg-white button w-100">Добавить отдел</button>

       <section class="mn-b-big radius-medium pd-big bg-white">
      <p>После создания организации приглашения будут отправлены по электронной почте или по телефону людям, которых вы добавили в вашу организацию.</p>
    </section>


    <Button :submit="onSubmit" :callback="redirectTo" class="mn-b-thin">Создать организацию</Button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'

import Button   from '@martyrs/src/components/Button/Button.vue'

import Unit   from '@martyrs/src/modules/organizations/components/sections/Unit.vue'

import * as organization from '@martyrs/src/modules/organizations/store/organizations.js'

const router  = useRouter()
const route   = useRoute()

const units = ref(organization.state.structure);

function addUnit() {
  units.value.push({
    name: 'Безымянный отдел',
    participants: [],
    subunits: [],
  });
}

function removeUnit(index) {
  units.value.splice(index, 1);
}

function addParticipant(unitIndex, participant) {
  units.value[unitIndex].participants.push(participant);
}

function addSubunit(unitIndex) {
  units.value[unitIndex].subunits.push({
    name: 'Безымянный подотдел',
    participants: [],
    subunits: [],
  });
}

async function onSubmit() {
  await organization.create(organization.state)
}

function redirectTo () {
  router.push({ name: 'Organization'})
  // Store.auth.toggleSignInPopup()
}
</script>

<style scoped>
.unit {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
}
</style>