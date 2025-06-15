<script setup>
import { ref } from 'vue';

import Checkbox from "@martyrs/src/components/Checkbox/Checkbox.vue";
import Spoiler from "@martyrs/src/components/Spoiler/Spoiler.vue"

import IconChevronBottom from '@martyrs/src/modules/icons/navigation/IconChevronBottom.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Sorting Options'
  },
  options: {
    type: Array
  }
});

const emits = defineEmits([
  'click_filter'
])

const filter = defineModel('filter')
</script>

<template>
  <div class="w-100 o-scroll">
    <Spoiler 
      v-for="filterOption in options"
      class="o-hidden"
      :status="true"
    >
      <template  #header="{ isOpen }">
        <div class="cursor-pointer w-100 flex-v-center flex-nowrap flex">
          <h4 class="w-100" >{{ filterOption.title }}</h4>
          <div class="h-2r w-2r flex-child-auto aspect-1x1 flex-center flex bg-light radius-extra">
             <IconChevronBottom :class="{ 'rotate-180 mn-t-micro-negative': isOpen }" fill="rgb(var(--black))" class="i-regular"/>
          </div>
         
        </div>
      </template>

      <template #content>
        <Checkbox 
          v-for="(checkbox, index) in  filterOption.options"
          :key="index"
          :label="checkbox.label"
          :value="checkbox.value"
          class="w-100 mn-t-small mn-b-small br-1px br-solid br-light  radius-small pd-small"
          :radio="filter.selected[filterOption.value]"
          @update:radio="event =>  { filter.selected[filterOption.value] = event; emits('click_filter', filterOption.value) } "
        />
      </template>

      
    </Spoiler>

    <button @click="() => filter.selected = {}"  class="bg-main w-100 button">Reset Filters</button>
  </div>
</template>
