<template>
  <footer 
    class="pd-thin pd-t-zero"
    :class="{
      't-black bg-white': route.meta.footer_theme === 'light',
      't-white bg-black': route.meta.footer_theme === 'dark'  
    }"
  >
<!-- 
    <div id="top-footer" class="cols-3 mobile:cols-1 section">
     
    <a href="mailto:hello@weeder.delivery" class="w-100 radius-small contact col">
      <img loading="lazy" class="mn-b-small h-3r" src="/logo/logotype.svg">  
      <p class="t-transp ">{{t('description')}}</p>
    </a>

      <div @click="this.$router.push({ name: 'Home' } )" class="flex-v-center flex logo-link col">
         <p class="h4 mn-b-small">{{t('app')}}</p>
        <div class="store-buttons">
        <img loading="lazy" class="h-3r" src="/assets/images/landing/appsvg" alt="Download on App Store">
        <img loading="lazy" class="h-3r"  src="/assets/images/landing/googleplay.svg" alt="Download on Google Play">
        </div>
      </div>
      
      <a href="https://t.me/weeder_support" target="_blank" class="w-100 radius-small contact col">
        <p class="h4 mn-b-small">{{t('socials')}}</p>

        <div class="socials flex-nojustify flex">
          <a class="mn-r-small" href="https://t.me/weederdelivery" target="_blank"> 
            <img loading="lazy" src="@/assets/icons/Telegram_blue.svg">
          </a> 
          <a class="mn-r-small" href="https://t.me/weederdelivery" target="_blank"> 
            <img loading="lazy" src="@/assets/icons/Telegram_blue.svg">
          </a> 
          <a class="mn-r-small" href="https://t.me/weederdelivery" target="_blank"> 
            <img loading="lazy" src="@/assets/icons/Telegram_blue.svg">
          </a> 
        </div>
      </a>
      
    </div>

    <div class="cols-3 mobile:cols-1 section">
      
      <ul class="lh-semi nav-footer col">
        <li class="mn-b-small t-semi h5">
          {{t('store')}}
        </li>

        <div class="mn-b-medium ol">
          <li v-for="(category,index) in categories.state.all">
            <router-link :to="getMarketplaceLink([category.url])">
              <span v-html="t('categories[' + index + ']')"></span>
            </router-link>  
          </li>
        </div>

        <a href="https://ozdao.dev" target="_blank">
          <img loading="lazy" src="/icons/ozdao.svg">
        </a>
      </ul>
      

      <ul class="lh-semi nav-footer col">
        <li class="mn-b-small t-semi h5">
          {{t('information')}}
        </li>
       
      </ul>
      
      <ul class="lh-semi col">
        <li class="mn-b-small t-semi h5">{{t('email')}}</li>
        <div class="mn-b-medium">
          <li>Phuket,</li>
          <li>43 283 Soi Boathouse,</li>
          <li>Rawai</li>
        </div>
        
        

      </ul>

    </div>  -->
 <!-- <li  v-for="(page,index) in pages"> -->

          <!-- <router-link :to="{ name: 'Page', params: { url: page.url}}" class="col nav-link"> -->
             <!-- <span v-html="t('pages[' + index + ']')"></span> -->
          <!-- </router-link> -->
        <!-- </li> -->
    
    <p class="t-semi uppercase t-center">
      {{ t('year') }} 
      <span class="t-main copyleft">{{ t('heart') }}</span> 
      {{ t('name') }}, {{ t('tagline') }} 
      <a href="https://ozdao.dev" class="t-main" target="_blank" rel="noopener" >OZ DAO.</a>
    </p>
  </footer>
</template>

<script setup="props">
  import { computed,onMounted, toRefs,ref } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n }    from 'vue-i18n'
  
  import * as categories from '@martyrs/src/modules/products/store/categories.js';

  // Props
  const props = defineProps({
    theme: {
      type: String,
      default: "light"
    }
  });

  const router = useRouter()
  const route = useRoute()
    
  const text = {
    locale: 'en',
    messages: {
      en: {
        store: 'Online Store',
        information: "Information",
        description: "Weeder Delivery stocks a wide range of quality!",
        app: 'Get Our App',
        adress: 'Adress',
        support: 'Get Online Support',
        socials: 'Find Us in Socials',
        email: 'Contact by email',
        // request: 'hello@weeder.delivery',
        time: "24 / 7 Seven days a week",
        copyright: "2024 © Weeder Delivery. Proudly created with OZ DAO.",
        pages: [],
        categories: [],
        year: "2024",
        heart: "❤",
        name: "Weeder",
        tagline: "Builded with love in"
      },
      ru: {
        store: 'Онлайн Каталог',
        information: "Информация",
        description: "Weeder Delivery предлагает широкий ассортимент качественных!",
        app: 'Скачайте Наше Приложение',
        adress: 'Адрес',
        support: 'Онлайн Поддержка',
        socials: 'Найдите Нас в Социальных Сетях',
        email: 'Связаться по email',
        // request: 'hello@weeder.delivery',
        time: "24 / 7 без перерывов",
        copyright: "2024 © Weeder Delivery. С гордостью создано OZ DAO.",
        pages: [],
        categories: []
      }
    }
  };

  categories.state.all.forEach( category => {
    category.localization.forEach( localization => {
      text.messages[localization.locale].categories.push(localization.text)
    })
  })

  onMounted(async() => {

    await categories.actions.read()

  })


  // state.pages.all.forEach( page => {
  //   page.localization.forEach( localization => {
  //     text.messages[localization.locale].pages.push(localization.text)
  //   })
  // })

  const { t } = useI18n(text)
  // const pages = computed(() => state.pages.all.filter(page => (page.groups.includes('all') || page.groups.includes('footer'))))
</script>

<style lang="scss">
</style>