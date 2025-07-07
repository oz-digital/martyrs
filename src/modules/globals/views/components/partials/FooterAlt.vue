<script setup="props">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

// Martyrs Components
import FieldBig from "@martyrs/src/components/FieldBig/FieldBig.vue";


import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
import * as applications from '@martyrs/src/modules/orders/store/applications.js';


import LabelGooglePlay from '@martyrs/src/modules/icons/labels/LabelGooglePlay.vue';
import LabelAppStore from '@martyrs/src/modules/icons/labels/LabelAppStore.vue';

import IconPhone from '@martyrs/src/modules/icons/entities/IconPhone.vue';
import IconEmail from '@martyrs/src/modules/icons/entities/IconEmail.vue';
import IconAddress from '@martyrs/src/modules/icons/entities/IconAddress.vue';
import IconTime from '@martyrs/src/modules/icons/entities/IconTime.vue';

import IconInfo from '@martyrs/src/modules/icons/navigation/IconInfo.vue'
import instagram from '@martyrs/src/modules/icons/socials/instagram.vue';
import facebook from '@martyrs/src/modules/icons/socials/facebook.vue';
import linkedin from '@martyrs/src/modules/icons/socials/linkedin.vue'
import youtube from '@martyrs/src/modules/icons/socials/youtube.vue'
import whatsapp from '@martyrs/src/modules/icons/socials/whatsapp.vue'

// Props
const props = defineProps({
  theme: {
    type: String,
    default: "light"
  },
  logotype: {
    type: Object
  }
})

// State
const router = useRouter()
const route = useRoute()
const email = ref('')

// Localization
const text = {
  locale: 'en',
  messages: {
    en: {
      linkAppStore: '2',
      linkGooglePlay: '1',
      // Contact
      description: "3SR – Premium Video Gear Rentals for Filmmakers and Content Creators",
      contact: 'Contact',
      phone: 'Phone / WhatsApp',
      email: 'Email',
      hours: 'Hours',
      hours_text: 'Mon–Sun, 10:00–19:00',
       app: 'Get Our App',
      
      // Navigation
      equipment: 'Equipment',
      cameras: 'Cameras',
      lighting: 'Lighting',
      stabilizers: 'Stabilizers',
      accessories: 'Accessories',
      
      services: 'Services',
      kits: 'Kits & Packages',
      studio: 'Studio Hire',
      delivery: 'Delivery',
      production: 'Production Help',
      
      company: 'Company',
      about: 'About Us',
      contact_us: 'Contact',
      faq: 'FAQ',
      blog: 'Blog',
      
      legal: 'Legal',
      privacy: 'Privacy Policy',
      cookies: 'Cookie Policy',
      terms: 'Terms of Use',
      gdpr: 'GDPR / CCPA',
      
      // Subscribe
      subscribe: 'Subscribe',
      subscribe_text: 'Get updates on new equipment and special offers',
      email_placeholder: 'Enter your email',
      follow: 'Follow Us',
      
      // Footer
      year: '2025 ',
      heart: "❤",
      copyright: 'Three Steps Studio Ltd. ',
      ozdao: 'Builded with love in'
    }
  }
}

const { t, te } = useI18n(text)

// Methods
const handleSubscribe = () => {
  if (email.value) {
    console.log('Subscribe:', email.value)
    email.value = ''
  }
}
</script>

<template>
  <footer 
    class="
      pd-medium pd-t-large
      w-100
      br-t br-solid
    "
    :class="{
      't-black bg-white br-light': theme === 'light',
      't-white bg-black br-dark': theme === 'dark'  
    }"
  >
    <!-- Top Section -->
    <div class="container-wide">
      <div class="grid cols-4 tablet:cols-2 mobile:cols-1 gap-big mn-b-big">
        
        <!-- Contact Block -->
        <div class="col">
          <component
            v-if="logotype"
            :is="logotype"
            @click="router.push({ path: '/' })" 
            :theme="theme"
            class="cursor-pointer h-3r mn-b-medium"
          />

          <p class="p-semi t-medium mn-b-medium ">{{t('description')}}</p>
          
          <div class="mn-b-medium flex flex-column gap-small">
            <a 
              href="tel:+447778784893" 
              class="flex gap-micro flex-v-center transition-opacity hover-opacity-70"
              :class="theme === 'light' ? 't-black' : 't-white'"
            >
              <IconPhone class="i-regular" :fill="theme === 'light' ? 'rgb(var(--black))' : 'rgb(var(--white))'" />
              <span class="t-small">+44 77 7878 4893</span>
            </a>
            
            <a 
              href="mailto:info@3stepsprod.com" 
              class="flex gap-micro flex-v-center transition-opacity hover-opacity-70"
              :class="theme === 'light' ? 't-black' : 't-white'"
            >
              <IconEmail class="i-regular" :fill="theme === 'light' ? 'rgb(var(--black))' : 'rgb(var(--white))'" />
              <span class="t-small">info@3stepsprod.com</span>
            </a>
            
            <div class="flex gap-micro flex-v-center">
              <IconTime class="i-regular" :fill="theme === 'light' ? 'rgb(var(--black))' : 'rgb(var(--white))'" />
              <span class="t-small">{{ t('hours_text') }}</span>
            </div>
          </div>

           <h4 class="h5 t-medium mn-b-small">{{t('app')}}</h4>
          <div class="w-100 flex-nowrap flex gap-thin">
          <a 
             v-if="te('linkAppStore') || te('label')"
            :href="te('linkAppStore') ? t('linkAppStore') : null" 
            :target="te('linkAppStore') ? '_blank' : null" 
            class="pos-relative w-100 h-100"
          > 
            <span 
              v-if="te('label')"
              class="z-index-2 radius-medium bg-main t-medium uppercase pd-thin pos-absolute pos-r-10-negative pos-t-10-negative"
            >
              {{ t('label') }}
            </span>
            <LabelAppStore class="w-100 h-max" alt="Download on App Store"/>
          </a>

          <a 
             v-if="te('linkGooglePlay') || te('label')"
            :href="te('linkGooglePlay') ? t('linkGooglePlay') : null" 
            :target="te('linkGooglePlay') ? '_blank' : null" 
            class="pos-relative w-100 h-100"
          > 
            <span 
              v-if="te('label')"
              class="z-index-2 pd-thin radius-medium bg-main t-medium uppercase pos-absolute pos-r-10-negative pos-t-10-negative"
            >
              {{ t('label') }}
            </span>
            <LabelGooglePlay class="w-100 h-max" alt="Download on Google Play"/>
          </a>

        </div>
        </div>

        <!-- Equipment Navigation -->
        <div class="col">
           <h4 class="h5 t-medium mn-b-small">{{ t('equipment') }}</h4>
          <nav>
            <ul class="flex flex-column gap-micro">
              <li><router-link :to="{name: 'Page', params: {url: 'cameras'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('cameras') }}</router-link></li>
              <li><router-link :to="{name: 'Page', params: {url: 'lighting'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('lighting') }}</router-link></li>
              <li><router-link :to="{name: 'Page', params: {url: 'stabilizers'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('stabilizers') }}</router-link></li>
              <li><router-link :to="{name: 'Page', params: {url: 'accessories'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('accessories') }}</router-link></li>
            </ul>
          </nav>
          
          <h4 class="h5 t-medium mn-t-medium mn-b-small">{{ t('services') }}</h4>
          <nav>
            <ul class="flex flex-column gap-micro">
              <li><router-link :to="{name: 'Page', params: {url: 'kits-packages'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('kits') }}</router-link></li>
              <li><router-link :to="{name: 'Page', params: {url: 'studio-hire'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('studio') }}</router-link></li>
              <li><router-link :to="{name: 'Page', params: {url: 'delivery'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('delivery') }}</router-link></li>
              <li><router-link :to="{name: 'Page', params: {url: 'production-help'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('production') }}</router-link></li>
            </ul>
          </nav>
        </div>

        <!-- Company & Legal Navigation -->
        <div class="col">
           <h4 class="h5 t-medium mn-b-small">{{ t('company') }}</h4>
          <nav>
            <ul class="flex flex-column gap-micro">
              <li><router-link :to="{name: 'Page', params: {url: 'about'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('about') }}</router-link></li>
              <li><router-link :to="{name: 'Page', params: {url: 'contact'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('contact_us') }}</router-link></li>
              <li><router-link :to="{name: 'Page', params: {url: 'faq'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('faq') }}</router-link></li>
              <li><router-link :to="{name: 'Page', params: {url: 'blog'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('blog') }}</router-link></li>
            </ul>
          </nav>
           <h4 class="h5 t-medium mn-t-medium mn-b-small">{{ t('legal') }}</h4>
          <nav>
            <ul class="flex flex-column gap-micro">
              <li><router-link :to="{name: 'Page', params: {url: 'privacy'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('privacy') }}</router-link></li>
              <li><router-link :to="{name: 'Page', params: {url: 'cookies'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('cookies') }}</router-link></li>
              <li><router-link :to="{name: 'Page', params: {url: 'terms'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('terms') }}</router-link></li>
              <li><router-link :to="{name: 'Page', params: {url: 'gdpr-ccpa'}}" class="t-small transition-opacity hover-opacity-70" :class="theme === 'light' ? 't-black' : 't-white'">{{ t('gdpr') }}</router-link></li>
            </ul>
          </nav>
        </div>

        <!-- Subscribe Block -->
        <div class="col">
          <h4 class="h5 t-medium mn-b-small">{{ t('subscribe') }}</h4>
          <p class="t-small mn-b-small t-transp">{{ t('subscribe_text') }}</p>
          
          <FieldBig 
            :input="email" 
            :typingSpeed="75"
            :loopTyping="false"
            :enableTyping="false"
            :placeholder="t('email_placeholder')"
            @update:input="email = $event"
            @action="sendApplication"
            class="d-inline-flex mn-b-medium bg-light t-black w-100"
          />

          <h4 class="h5 t-medium mn-b-small">{{ t('follow') }}</h4>
          <!-- Social Links -->
          <div class="flex gap-small mn-b-medium">
            <a 
              href="https://instagram.com/3stepsprod" 
              target="_blank"
              class="
                w-2r h-2r 
                flex flex-center 
                radius-thin
                bg-light 
                transition-opacity
                hover-opacity-70
              "
            >
              <component
                :is="instagram"
                class="i-semi"
                :fill="theme === 'light' ? 'rgb(var(--black))' : 'rgb(var(--white))'"
              />
            </a>
            
            <a 
              href="https://linkedin.com/company/3stepsprod" 
              target="_blank"
              class="
                w-2r h-2r 
                flex flex-center 
                radius-thin
                bg-light 
                transition-opacity
                hover-opacity-70
              "
            >
              <component
                :is="linkedin"
                class="i-semi"
                :fill="theme === 'light' ? 'rgb(var(--black))' : 'rgb(var(--white))'"
              />
            </a>
            
            <a 
              href="https://youtube.com/@3stepsprod" 
              target="_blank"
              class="
                w-2r h-2r 
                flex flex-center 
                radius-thin
                bg-light 
                transition-opacity
                hover-opacity-70
              "
            >
              <component
                :is="whatsapp"
                class="i-semi"
                :fill="theme === 'light' ? 'rgb(var(--black))' : 'rgb(var(--white))'"
              />
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="
        pd-t-medium 
        br-t br-solid
        flex flex-justify-between flex-v-center
        mobile:flex-column mobile:gap-small
      "
      :class="{
        'br-light': theme === 'light',
        'br-dark': theme === 'dark'
      }"
      >
        <!-- Copyright -->
        <p class="t-small t-medium uppercase mobile:t-center">
          {{ t('year') }} 
          <span class="t-main copyleft">{{ t('heart') }}</span> 
          {{ t('copyright') }} 
          {{ t('ozdao') }}
          <a href="https://ozdao.dev" class="t-main" target="_blank" rel="noopener" >OZ DAO.</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
footer {
  transition: background-color 0.3s ease, color 0.3s ease;
  
  a {
    text-decoration: none;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
}
</style>