<template>
  <div class="o-hidden container-joinus">
    <div class="content">
      <span style="font-size: 8rem" class="t-main font-main t-semi">
        {{ userCount }}
      </span>
      <p class="w-m-33r t-center mn-b-small p-big">
        {{t('description')}}
    
      </p>
      <router-link :to="{ name: 'Sign In' }" class="bg-black t-medium t-white button">
        {{t('action')}}
      </router-link>
    </div>
    <FloatingImages 
      :container="'.container-joinus'"
      :images="options.images" 
      :config="{
          size: '5rem',
          square: true,
          minDuration: 5,
          maxDuration: 15,
          spawnPoints: [10, 90],
          animation: {
            startOpacity: 0.1,
            midOpacity: 1,
            endOpacity: 0.0,
            translateY: '-33vh'
          },
          class: 'my-custom-class'
      }"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import FloatingImages from '@martyrs/src/modules/landing/components/elements/FloatingImages.vue';

const props = defineProps({
  content: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({
      count: 1230,
      images: [
        '/landing/avatars/01.png',
        '/landing/avatars/02.png',
        '/landing/avatars/03.png',
        '/landing/avatars/04.png',
        '/landing/avatars/05.png',
        '/landing/avatars/06.png'
      ]
    })
  }
})

const { t, te } = useI18n({
  messages: props.content
})

const userCount = ref(props.options.count);

const increaseUserCount = () => {
  setInterval(() => {
    userCount.value += Math.floor(Math.random() * 2) + 1;
  }, 1330);
};

onMounted(() => {
  increaseUserCount();
});
</script>

<style lang="scss">
.container-joinus {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 66%;
  position: relative;

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
  }
}
</style>
