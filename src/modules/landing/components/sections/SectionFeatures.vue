<template>
  <section id="howtobuy">
    <h2 class="w-100 w-max-50r mn-b-small" v-html="t('title')"/>
   
    <div class="cols-3 mobile:cols-1 gap-thin">
      <div 
        v-for="feature in tm('features')" 
        :key="feature.title" 
        class="pd-medium  radius-medium"
      >
        <p class="h2 i-extra radius-extra bg-main flex-center d-inline-flex mn-b-medium">
          {{ feature.icon }}
        </p>
        <h3 class="mn-b-medium">
          {{ feature.title }}
        </h3>
        <p class="t-transp">
          {{ feature.description }}
        </p>
      </div>
    </div>
  </section>
</template>


<script setup>
  import { useI18n }    from 'vue-i18n'

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

<style lang="scss">
</style>
