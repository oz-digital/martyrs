<template>
  <section id="howtobuy" class="section">

    <div class="mn-b-big t-center title">
      <h2 class="mn-b-small">{{t('title')}}</h2>
      <p class="w-m-60r mn-b-big mn-auto t-transp p-big">
        {{t('subtitle')}}
      </p>
    </div>

    <div class="cols-3 mobile:cols-1 gap-thin">

      <div 
        v-for="feature in tm('features')" 
        :key="feature.title" 
        class="w-100 pd-medium bg-light radius-medium"
      >
        <img loading="lazy" 
          class="radius-medium bg-light h-max-20r object-fit-cover w-100 mn-b-medium" 
          :src="feature.image"
        > 
        <h3 class="mn-b-medium">{{feature.title}}</h3>
        <p class="t-transp">{{feature.text}}</p>
      </div>

    </div>

  </section>
</template>


<script setup>
import { useI18n }    from 'vue-i18n'
  
const props = defineProps({
    title: String,
    textData: {
      type: Object,
      default: () => ({
        messages: {
          en: {
            title: 'What is Weeder Token?',
            subtitle: 'WDT – the foundation of the Weeder community. It serves as a currency, a DAO instrument, and for many other purposes:',
            features: [
              {
                image: '/images/howitworks/step1.png',
                title: 'Currency',
                text: 'WDT can be used as a digital currency within the Weeder ecosystem, allowing users to purchase products such as cannabis, advertising spaces, and other premium features on the platform.',
              },
              {
                image: '/images/howitworks/step2.png',
                title: 'Instument',
                text: 'As a DAO (Decentralized Autonomous Organization) instrument, WDT enables community governance and decision-making, allowing token holders to propose, discuss, and vote on various initiatives and developments within the Weeder ecosystem.',
              },
              {
                image: '/images/howitworks/step3.png',
                title: 'Invesment',
                text: 'Holding WDT tokens can provide potential investment returns as the Weeder ecosystem grows and gains value. Additionally, WDT serves for dividend distribution – those who stake their tokens earn income from the platform.'
              },
            ]
          },
          ru: {
            title: 'Что такое Weeder Token?',
            subtitle: 'WDT – основа сообщества Weeder. Он выступает в качестве валюты, инструмента DAO и многих других целей:',
            features: [
              {
                image: '/images/howitworks/step1.png',
                title: 'Валюта',
                text: 'WDT можно использовать как цифровую валюту в экосистеме Weeder, позволяя пользователям покупать товары, такие как марихуана, рекламные места и другие премиальные возможности на платформе.',
              },
              {
                image: '/images/howitworks/step2.png',
                title: 'Инструмент',
                text: 'В качестве инструмента DAO (Децентрализованной Автономной Организации), WDT позволяет управлять сообществом и принимать решения, давая держателям токенов возможность предлагать, обсуждать и голосовать за различные инициативы и развитие в рамках экосистемы Weeder.',
              },
              {
                image: '/images/howitworks/step3.png',
                title: 'Инвестиции',
                text: 'Хранение токенов WDT может обеспечить потенциальный инвестиционный доход по мере роста и увеличения стоимости экосистемы Weeder. Кроме того, WDT служит для распределения дивидендов – те, кто стейкают свои токены, получают доход с платформы.',
              },
            ]
          }
        }
      })
    }
  })
  const { t, tm } = useI18n(props.textData)
</script>

<style lang="scss" scoped> 

#grid2 {
  transition: 500ms;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 3px;
  background: crimson;
}

:where(.left, .center, .right) {
  background: navajowhite;
  transition: 300ms;
}

:where(.left, .center, .right):hover {
  background: crimson;
}

#grid2:has(.left:hover) {
  grid-template-columns: 2fr 0.5fr 0.5fr;
  padding: 3rem;
}

#grid2:has(.center:hover) {
  grid-template-columns: 0.5fr 2fr 0.5fr;
  padding: 3rem;
}
#grid2:has(.right:hover) {
  grid-template-columns: 0.5fr 0.5fr 2fr;
  padding: 3rem;
}
</style>
