<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Slider from '@martyrs/src/components/Slider/Slider.vue'

const text = {
  messages: {
    en: {
      features: [
        {
          title: "What's the Weeder Token, Dude?",
          description: "WDT is like, the backbone of our rad community. It's cash, it's power, it's an investment. Groovy, right?", 
        },
        {
          title: "Light Up and Level Up",
          description: "Order up, light up, and earn Weeder tokens. More tokes, more cash in your pocket, man.", 
        },
        {
          title: "Hang Ten with Our Community",
          description: "Find the dopest strains and start floating on cloud 9 with us!", 
        },
        {
          title: "Shop 'Til You Drop... Into Your Couch",
          description: "Score primo bud and gear with just a few clicks. Delivered right to your pad!", 
        },
      ]
    },
    ru: {
      features: [
        {
          title: "Что такое токен Weeder, Бро?",
          description: "WDT - это как основа нашего крутого сообщества. Это деньги, это власть, это инвестиции. Круто, а?", 
        },
        {
          title: "Зажигай и Развивайся",
          description: "Закажи шмали, курни и зарабатывай токены Weeder. Чем больше курнешь, тем больше кэша у тебя в кармане, чувак.", 
        },
        {
          title: "Веселись с Нашим Сообществом",
          description: "Найди самые крутые сорта и начни шмалить на девятом облаке вместе с нами.", 
        },
        {
          title: "Покупайте, Когда Накурились",
          description: "Закажи премиумную бошку и крутые аксессуары за пару кликов, чувак. Прямо к твоей двери!",
        },
      ]
    }
  }
}

const { tm } = useI18n(text)
const features = computed(() => tm('features'))
</script>

<template>
  <Slider :showDots="true" :slideCount="features.length" class="auth_slider h-100">
    <div class="carousel__slide" v-for="(feature, index) in features" :key="index">
      <div class="parent-div flex flex-h-center" >
        <div class="background-div" :style="`background-image: url(/features/${index}.png); background-size:contain; background-position: center center; background-repeat: no-repeat;`"></div>
        <div class="pd-big">
          <h5 class="t-center w-100 mn-b-regular">{{ feature.title }}</h5>
          <p class='t-center t-transp w-100'>{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </Slider>
</template>

<style lang="scss">
.auth_slider .carousel {
  height: 100%;
}

.auth_slider .carousel__container {
  height: 100%;
}

.parent-div {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.background-div {
  flex-grow: 1; // Занимает все оставшееся пространство
}
</style>