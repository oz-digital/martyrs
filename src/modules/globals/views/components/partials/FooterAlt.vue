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
      
      // Subscribe
      subscribe: 'Subscribe',
      subscribe_text: 'Get updates on new equipment and special offers',
      email_placeholder: 'Enter your email',
      follow: 'Follow Us',
      
      // Footer
      year: '2025 ',
      heart: "❤",
      copyright: 'Three Steps Studio Ltd. ',
      ozdao: 'Builded with love in',
      
      // Contact info
      phoneNumber: '+44 77 7878 4893',
      emailAddress: 'info@3stepsprod.com',
      
      // Navigation columns
      navigationColumns: [
        {
          sections: [
            {
              title: 'Equipment',
              items: [
                { name: 'Cameras', url: 'cameras' },
                { name: 'Lighting', url: 'lighting' },
                { name: 'Stabilizers', url: 'stabilizers' },
                { name: 'Accessories', url: 'accessories' }
              ]
            },
            {
              title: 'Services',
              items: [
                { name: 'Kits & Packages', url: 'kits-packages' },
                { name: 'Studio Hire', url: 'studio-hire' },
                { name: 'Delivery', url: 'delivery' },
                { name: 'Production Help', url: 'production-help' }
              ]
            }
          ]
        },
        {
          sections: [
            {
              title: 'Company',
              items: [
                { name: 'About Us', url: 'about' },
                { name: 'Contact', url: 'contact' },
                { name: 'FAQ', url: 'faq' },
                { name: 'Blog', url: 'blog' }
              ]
            },
            {
              title: 'Legal',
              items: [
                { name: 'Privacy Policy', url: 'privacy-policy' },
                { name: 'Cookie Policy', url: 'cookie-policy' },
                { name: 'Terms of Use', url: 'terms-of-use' },
                { name: 'EULA', url: 'eula' }
              ]
            }
          ]
        }
      ],
      
      // Social links
      socialLinks: [
        { 
          name: 'Instagram',
          url: 'https://www.instagram.com/3stepsprod',
          icon: instagram
        },
        { 
          name: 'Youtube',
          url: 'https://www.youtube.com/@threestepsproduction',
          icon: youtube
        },
        { 
          name: 'WhatsApp',
          url: 'https://api.whatsapp.com/send/?phone=447778784893&text&type=phone_number&app_absent=0',
          icon: whatsapp
        }
      ]
    }
  }
}

const { t, te, tm } = useI18n(text)

// Get columns and social links from translations
const navigationColumns = computed(() => tm('navigationColumns'))
const socialLinks = computed(() => tm('socialLinks'))
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
      <component
        v-if="logotype"
        :is="logotype"
        @click="router.push({ path: '/' })" 
        :theme="theme"
        class="cursor-pointer h-3r mn-b-medium"
      />

      <div class="grid cols-4-footer tablet:cols-2 mobile:cols-1 gap-extra mn-b-big">
        
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
        <div v-for="(column, colIndex) in navigationColumns" :key="colIndex" class="col">
          <div v-for="(section, sectionIndex) in column.sections" :key="sectionIndex">
            <h4 class="h5 t-medium mn-b-regular" :class="sectionIndex > 0 ? 'mn-t-medium' : ''">{{ section.title }}</h4>
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

        <!-- Subscribe Block -->
        <div class="col">
          <h4 class="h5 t-medium mn-b-regular">{{ t('subscribe') }}</h4>
          <p class="t-small mn-b-small t-transp">{{ t('subscribe_text') }}</p>
          
          <FieldSubscribeNewsletter
            :action="false"
            fieldName="footer-newsletter"
            fieldId="footer-newsletter-email"
            class="d-inline-flex mn-b-medium bg-light t-black w-100"
          />

          <h4 class="h5 t-medium mn-b-regular">{{ t('follow') }}</h4>
          <!-- Social Links -->
          <div class="flex gap-small mn-b-medium">
            <a 
              v-for="social in socialLinks"
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
                :is="social.icon"
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
          <a href="https://ozdao.dev" class="t-main" target="_blank" rel="noopener">OZ DAO.</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.cols-4-footer {
  grid-template-columns: 5fr 3fr 3fr 4fr;
}
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