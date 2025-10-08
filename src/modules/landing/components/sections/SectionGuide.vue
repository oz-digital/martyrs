<template>
  <div class="">
    <div class="mn-b-big d-inline-block">
      <h2 class="mn-b-semi">{{t('title')}}</h2>
      <p v-if="te('subtitle')" class="t-transp p-medium w-m-60r">{{t('subtitle')}}</p>
    </div>
    <div class="cols-1">
      <Spoiler v-for="item in tm('FAQ')" :key="item.title" class="br-grey-transp-10 br-solid br-1px radius-small o-hidden pd-big mn-b-thin">
        <template #header="{ isOpen }">
          <div class="cursor-pointer w-100 flex-v-center flex-nowrap flex">
            <h3 class="w-100">{{item.title}}</h3>
            <IconChevronBottom :class="{ 'rotate-180': isOpen }" fill="rgba(var(--grey),0.5)" class="i-medium"/>
          </div>
        </template>
        <template #content>
          <div class="mn-t-semi">
            <p class="t-transp" v-html="item.description"></p>
          </div>
        </template>
      </Spoiler>
    </div>
  </div>
</template>
<script setup>
import Spoiler from '@martyrs/src/components/Spoiler/Spoiler.vue'
import { useI18n } from 'vue-i18n'
import IconChevronBottom from '@martyrs/src/modules/icons/navigation/IconChevronBottom.vue'

const props = defineProps({
  content: {
    type: Object,
    required: true
  }
});

const { t, tm, te } = useI18n({
  messages: props.content
});
</script>
<style lang="scss">
</style>