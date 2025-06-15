<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import emblaCarouselVue from 'embla-carousel-vue';
import Autoplay from 'embla-carousel-autoplay'

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

const { tm,rt } = useI18n(text)




const selectedIndex = ref(0);
const scrollSnaps = ref([]);

const autoplayOptions = {
  delay: 2000,
  jump: false,
  stopOnInteraction: false,
  stopOnMouseEnter: false,
  stopOnFocusIn: true,
  stopOnLastSnap: false,
  rootNode: (emblaRoot) => emblaRoot.parentElement
}

const [emblaNode, emblaApi] = emblaCarouselVue({ loop: true }, [Autoplay(autoplayOptions)])

const scrollTo = (index) => emblaApi.value && emblaApi.value.scrollTo(index);
const onInit = (embla) =>  scrollSnaps.value = emblaApi.value.scrollSnapList();
const onSelect = (embla) => selectedIndex.value = emblaApi.value.selectedScrollSnap();

onMounted(async() => {
  onInit(emblaApi);
  onSelect(emblaApi);

  emblaApi.value.on('reInit', onInit);
  emblaApi.value.on('reInit', onSelect);
  emblaApi.value.on('select', onSelect);
});
</script>

<template>
  <div class="embla" ref="emblaNode">
    <div class="embla__container">
      <div class="embla__slide pd-nano" v-for="(feature, index) in tm('features')" :key="index">
        <div class="parent-div" :style="`background-image: url(/assets/images/features/${index}.png); background-size:cover; background-position: center center;`">
          <div class="background-div"></div>
          <h4 class="mn-b-small">{{ feature.title }}</h4>
          <p class='mn-b-big mn-r-small mn-l-small'>{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.carousel__track {
    height: 100%;
  }
.carousel-controls {
  position: absolute;
  top: 0;
  right: 0;
}

.carousel-indicators {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}

.carousel-indicators li {
  list-style: none;
  margin: 0 5px;
  width: 10px;
  height: 10px;
  background: gray;
  border-radius: 50%;
}

.carousel-indicators li.active {
  background: white;
}

.parent-div {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.background-div {
  flex-grow: 1 // Занимает все оставшееся пространство
}
</style>
