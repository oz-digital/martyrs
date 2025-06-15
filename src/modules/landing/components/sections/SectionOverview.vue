<template>
  <div id="sections">
    <h2 class="pd-t-big pd-b-big">
      {{t('title')}}
    </h2>

    <div class="cols-4 gap-thin">
      <router-link 
        v-for="section in tm('sections')" 
        :key="section.route"
        :to="section.route" 
        class="cursor-pointer hover-scale-0 transition-ease-in pd-big bg-light t-black radius-medium"
      >
        <img 
          loading="lazy" 
          :src="section.image"
          alt="" 
          class="w-100 object-fit-cover"
        >
        <h3 class="mn-b-medium">{{ section.title }}</h3>
        <p class="t-transp">{{ section.text }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n'

  const props = defineProps({
    content: {
      type: Object,
      required: true
    }
  })

  const { t, tm } = useI18n({
    messages: props.content
  })
</script>