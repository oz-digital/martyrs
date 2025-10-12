<script setup>
import { ref } from 'vue';

import Radio from "@martyrs/src/components/Radio/Radio.vue";

import ButtonSort  from '@martyrs/src/modules/core/views/components/elements/ButtonSort.vue'
import IconSort from '@martyrs/src/modules/icons/navigation/IconSort.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Sorting Options'
  },
  options: {
    type: Array,
    default: [{
      label: 'Date',
      value: 'createdAt'
    },{
      label: 'Popularity',
      value: 'popularity'
    },{
      label: 'Creator',
      value: 'creator'
    }]
  }
});

const param = defineModel('param')
const order = defineModel('order')
</script>

<template>
  <div class="w-100 o-hidden">
    <h4 class="mn-b-thin">{{title}}</h4>

    <Radio 
      v-for="option in options"
      v-model:radio="param"
      :label="option.label"
      :value="option.value"
      class="w-100 mn-b-thin"
    />

    <div class="w-100 flex-nowrap flex gap-micro">
      <button 
        @click.stop="() => order = 'asc'"
        :class="{
          'bg-white t-black': order === 'asc'
        }"
        class="radius-semi flex-center w-100 uppercase p-small flex-nowrap flex gap-thin pd-thin br-solid br-1px br-grey-transp-25 w-100"
      >
        <IconSort
          :order="'asc'"
          :fill="order === 'asc' ? 'rgb(var(--black))' : 'rgb(var(--white))'"
          class="i-small"
        />
        Ascending
      </button>

      <button 
        @click.stop="() => order = 'desc'"
        :class="{
          'bg-white t-black': order === 'desc'
        }"
        class="radius-semi flex-center w-100 uppercase p-small flex-nowrap flex gap-thin pd-thin br-solid br-1px br-grey-transp-25 w-100"
      >
        <IconSort
          :order="'desc'"
          :fill="order === 'desc' ? 'rgb(var(--black))' : 'rgb(var(--white))'"
          class="i-small"
        />
        Descending
      </button>
    </div>
  </div>
</template>
