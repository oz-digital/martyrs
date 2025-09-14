<script setup="props">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

// Martyrs Components
import FieldSubscribeNewsletter from '@martyrs/src/modules/orders/components/elements/FieldSubscribeNewsletter.vue'

import LabelGooglePlay from '@martyrs/src/modules/icons/labels/LabelGooglePlay.vue';
import LabelAppStore from '@martyrs/src/modules/icons/labels/LabelAppStore.vue';

import IconPhone from '@martyrs/src/modules/icons/entities/IconPhone.vue';
import IconEmail from '@martyrs/src/modules/icons/entities/IconEmail.vue';
import IconAddress from '@martyrs/src/modules/icons/entities/IconAddress.vue';
import IconTime from '@martyrs/src/modules/icons/entities/IconTime.vue';

import IconInfo from '@martyrs/src/modules/icons/navigation/IconInfo.vue'
import IconInstagram from '@martyrs/src/modules/icons/socials/instagram.vue';
import IconFacebook from '@martyrs/src/modules/icons/socials/facebook.vue';
import IconLinkedin from '@martyrs/src/modules/icons/socials/linkedin.vue'
import IconYoutube from '@martyrs/src/modules/icons/socials/youtube.vue'
import IconWhatsapp from '@martyrs/src/modules/icons/socials/whatsapp.vue'

import Logotype from '@martyrs/src/modules/icons/logos/Logotype.vue'


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

// Localization
const text = {
  locale: 'en',
  messages: {
    en: {
      linkAppStore: 'https://play.google.com/store/apps/details?id=com.threestepsrental.app',
      linkGooglePlay: 'https://play.google.com/store/apps/details?id=com.threestepsrental.app',
      // Contact
      description: "3SR – Premium Video Gear Rentals for Filmmakers and Content Creators",
      contact: 'Contact',
      phone: 'Phone / WhatsApp',
      email: 'Email',
      hours: 'Hours',
      hours_text: 'Mon–Sun, 10:00–19:00',
      app: 'Get Our App',
      
      // Subscribe
      subscribe: 'Subscribe',
      subscribe_text: 'Get updates on new equipment and special offers',
      email_placeholder: 'Enter your email',
      follow: 'Follow Us',
      
      // Footer
      year: '2025 ',
      heart: "❤",
      copyright: 'Three Steps Studio Ltd. All Rights Reserved.',
      ozdao: 'Builded in OZ DAO',
      
      // Contact info
      phoneNumber: '+44 77 7878 4893',
      emailAddress: "info{'@'}3stepsprod.com",
      
      // Navigation columns
      navigationColumns: [
        {
          sections: [
            {
              title: 'Equipment',
              items: [
                { name: 'Cameras', url: 'products/categories/cameras' },
                { name: 'Lighting', url: 'products/categories/lighting-kits' },
                { name: 'Stabilizers', url: 'products/categories/stabilization-motion' },
                { name: 'Accessories', url: 'products/categories/accessories' }
              ]
            },
            {
              title: 'Services',
              items: [
                { name: 'Kits & Packages', url: 'products/categories/kits-packages' },
                { name: 'Studio Hire', url: 'products/categories/studio-hire' },
                { name: 'Delivery', url: 'products/categories/delivery' },
                { name: 'Production Help', url: 'products/categories/production-help' }
              ]
            }
          ]
        },
        {
          sections: [
            {
              title: 'Company',
              items: [
                { name: 'About Us', url: 'pages/about' },
                { name: 'Contact', url: 'pages/contact' },
                { name: 'FAQ', url: 'pages/faq' },
                { name: 'Blog', url: '/community' }
              ]
            },
            {
              title: 'Legal',
              items: [
                { name: 'Privacy Policy', url: 'pages/privacy-policy' },
                { name: 'Cookie Policy', url: 'pages/cookie-policy' },
                { name: 'Terms of Use', url: 'pages/terms-of-use' },
                { name: 'EULA', url: 'pages/eula' }
              ]
            }
          ]
        }
      ],
      
      // Social links
      socialLinks: [
        { 
          name: 'IconInstagram',
          url: 'https://www.instagram.com/3stepsprod'
        },
        { 
          name: 'IconYoutube',
          url: 'https://www.youtube.com/@threestepsproduction'
        },
        { 
          name: 'IconWhatsapp',
          url: 'https://api.whatsapp.com/send/?phone=447778784893&text&type=phone_number&app_absent=0'
        }
      ]
    }
  }
}

const { t, te, tm } = useI18n({
  useScope: 'global',
  messages: text.messages
})

// Component mapping for social icons
const iconComponents = {
  IconInstagram,
  IconFacebook,
  IconLinkedin,
  IconYoutube,
  IconWhatsapp
}
</script>

<template>
  <footer 
    class="
      w-100
      br-t br-solid
    "
    :class="{
      't-black bg-white br-light': theme === 'light',
      't-white bg-black br-dark': theme === 'dark'  
    }"
  >
    <div class="pd-medium">
      <!-- Top Section -->
      <component
        v-if="logotype"
        :is="logotype"
        @click="router.push({ path: '/' })" 
        :theme="theme"
        class="cursor-pointer h-3r mn-b-medium"
      />

      <div class="grid cols-3-footer tablet:cols-2 mobile:cols-1 gap-extra mobile:gap-big">
        
        <!-- Contact Block -->
        <div class="col w-max-15r">
          <p class="p-semi t-medium mn-b-semi">{{ t('description') }}</p>
          
          <div class="mn-b-semi flex flex-column gap-small">
            <a 
              :href="`tel:${t('phoneNumber').replace(/\s/g, '')}`" 
              class="flex mn-b-micro gap-micro flex-v-center transition-opacity hover-opacity-70"
              :class="theme === 'light' ? 't-black' : 't-white'"
            >
              <IconPhone class="i-regular" :fill="theme === 'light' ? 'rgb(var(--black))' : 'rgb(var(--white))'" />
              <span class="t-small">{{ t('phoneNumber') }}</span>
            </a>
            
            <a 
              :href="`mailto:${t('emailAddress')}`" 
              class="flex mn-b-micro gap-micro flex-v-center transition-opacity hover-opacity-70"
              :class="theme === 'light' ? 't-black' : 't-white'"
            >
              <IconEmail class="i-regular" :fill="theme === 'light' ? 'rgb(var(--black))' : 'rgb(var(--white))'" />
              <span class="t-small">{{ t('emailAddress') }}</span>
            </a>
            
            <div class="flex mn-b-micro gap-micro flex-v-center">
              <IconTime class="i-regular" :fill="theme === 'light' ? 'rgb(var(--black))' : 'rgb(var(--white))'" />
              <span class="t-small">{{ t('hours_text') }}</span>
            </div>
          </div>

          <h4 class="h5 t-medium mn-b-regular">{{ t('app') }}</h4>
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

        <!-- Navigation Columns -->
        <div class="cols-2 gap-big">
          <div v-for="(column, colIndex) in tm('navigationColumns')" :key="colIndex" class="flex flex-column gap-medium">
            <div v-for="(section, sectionIndex) in column.sections" :key="sectionIndex" class="">
              <h4 class="h5 t-medium mn-b-regular">{{ section.title }}</h4>
              <nav>
                <ul class="flex flex-column gap-thin">
                  <li v-for="item in section.items" :key="item.url">
                    <router-link 
                      :to="`/${item.url}`" 
                      class="t-small transition-opacity hover-opacity-70" 
                      :class="theme === 'light' ? 't-black' : 't-white'"
                    >
                      {{ item.name }}
                    </router-link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <!-- Subscribe Block -->
        <div class="col">
          <h4 class="h5 t-medium mn-b-regular">{{ t('subscribe') }}</h4>
          <p class="t-small mn-b-small t-transp">{{ t('subscribe_text') }}</p>
          
          <FieldSubscribeNewsletter
            :action="''"
            fieldName="footer-newsletter"
            fieldId="footer-newsletter-email"
            class="d-inline-flex mn-b-medium bg-light t-black w-100"
          />

          <h4 class="h5 t-medium mn-b-regular">{{ t('follow') }}</h4>
          <!-- Social Links -->
          <div class="flex gap-thin">
            <a 
              v-for="social in tm('socialLinks')"
              :key="social.name"
              :href="social.url" 
              target="_blank"
              class="
                w-3r h-3r 
                flex flex-center 
                radius-small
                bg-light 
                transition-opacity
                hover-opacity-70
              "
            >
              <component
                :is="iconComponents[social.name]"
                class="i-semi"
                :fill="theme === 'light' ? 'rgb(var(--black))' : 'rgb(var(--white))'"
              />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="
      pd-medium 
      br-t 
      br-solid
      flex 
      flex-justify-between 
      flex-v-center
      flex-nowrap
      mobile:flex-column 
      mobile:flex-align-start
      mobile:gap-small
    "
    :class="{
      'br-light': theme === 'light',
      'br-dark': theme === 'dark'
    }"
    >
      <!-- Copyright -->
      <p class="t-small t-medium uppercase">
        {{ t('year') }} 
        <span class="t-main copyleft">{{ t('heart') }}</span> 
        {{ t('copyright') }} 
      </p>

      <a href="https://ozdao.dev" target="_blank" rel="noopener" class="flex-nowrap flex-v-center flex t-medium gap-thin br-1px br-light pd-thin radius-thin">
        <Logotype class="h-1r w-auto"/>
        <span>{{ t('ozdao') }}</span>
      </a>
    </div>
  </footer>
</template>

<style lang="scss">
.cols-3-footer {
  grid-template-columns: 5fr 7fr 4fr;
}
</style>