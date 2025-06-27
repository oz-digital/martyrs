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
  <Slider :showDots="true" :slideCount="features.length">
    <div class="carousel__slide pd-nano" v-for="(feature, index) in features" :key="index">
      <div class="parent-div" :style="`background-image: url(/assets/images/features/${index}.png); background-size:cover; background-position: center center;`">
        <div class="background-div"></div>
        <h4 class="mn-b-small">{{ feature.title }}</h4>
        <p class='mn-b-big mn-r-small mn-l-small'>{{ feature.description }}</p>
      </div>
    </div>
  </Slider>
</template>

<style lang="scss">
.parent-div {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.background-div {
  flex-grow: 1; // Занимает все оставшееся пространство
}
</style>