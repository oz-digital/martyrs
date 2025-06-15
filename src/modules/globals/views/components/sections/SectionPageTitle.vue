<template>
  <div>
    <header class="flex-v-center flex-nowrap flex">
      <h1 class="h2 mn-r-auto">{{ title }}</h1>

      <template  
        v-for="action in actions"   
        v-if="actions && actions.length > 0"
      >
        <router-link
          v-if="action.to"
          :key="action.to"
          :to="action.to"
          :class="action.class || 'radius-extra pd-small pd-r-medium pd-l-medium p-medium uppercase t-medium hover-scale-1 transition-ease cursor-pointer t-white bg-second flex-center flex'"
        >
          {{ action.label }}
        </router-link>

        <button
          v-if="action.method"
          @click="action.method"
          :class="action.class || 'radius-extra pd-thin uppercase t-medium hover-scale-1 transition-ease cursor-pointer t-white bg-second flex-center flex'"
        >
          {{ action.label }}
        </button>
      </template>
    </header>

    <Tab
      v-if="tabs"
      :selected="tabs_current"
      @update:selected="updateTabsCurrent"
      :tabs="tabs"
      class="mn-t-small pd-thin bg-light radius-small w-max t-nowrap o-scroll p-medium"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

import Tab from '@martyrs/src/components/Tab/Tab.vue'

const emits = defineEmits([
  'update:tabs_current'
])

const props = defineProps({
  title: String,
  actions: Array,
  tabs: Array,
  tabs_current: [Object, String]
});

const updateTabsCurrent = (newValue) => {
  emits('update:tabs_current', newValue); // Emitting to parent component
}
</script>

<style scoped>
</style>
