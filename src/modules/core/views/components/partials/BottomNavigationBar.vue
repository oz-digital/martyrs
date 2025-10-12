<template>
    <footer ref="navRef" class="pos-relative pd-medium bg-white">
        <nav class="t-black w-100 flex-justify-between flex-v-center flex">
          <!-- Home -->
          <router-link 
            class="no-hover-color t-center t-medium" 
            :class="{ 't-second': $route.path === '/', 't-transp': $route.path !== '/' }"
            to="/"
          >
            <IconHome 
              class="mn-r-auto mn-l-auto i-big mn-b-thin"
              :fill="$route.path === '/' ? 'rgb(var(--second))' : 'currentColor'"
            />
            <p class="t-semi p-small w-100">{{t('navigation.home')}}</p>
          </router-link>

          <!-- Gallery -->
          <router-link 
            class="no-hover-color t-center t-medium"
            :class="{ 't-second': $route.path === '/marketplac', 't-transp': $route.path !== '/marketplac' }"
            to="/marketplac"
          >
            <IconCatalog 
              class="mn-r-auto mn-l-auto i-big mn-b-thin"
              :fill="$route.path === '/catalog' ? 'rgb(var(--second))' : 'currentColor'"
            />
            <p class=" t-semi p-small w-100">{{t('navigation.marketplac')}}</p>
          </router-link>

          <!-- Events -->
          <router-link 
            class="no-hover-color t-center t-medium"
            :class="{ 't-second': $route.path === '/rents', 't-transp': $route.path !== '/rents' }"
            to="/rents"
          >
            <IconShopcart 
              class="mn-r-auto mn-l-auto i-big mn-b-thin"
              :fill="$route.path === '/rents' ? 'rgb(var(--second))' : 'currentColor'"
            />
            <p class=" t-semi p-small w-100">{{t('navigation.rents')}}</p>
          </router-link>

          <!-- Community -->
          <router-link 
            class="no-hover-color t-center t-medium"
            :class="{ 't-second': $route.path === '/community', 't-transp': $route.path !== '/community' }"
            to="/community"
          >
            <IconCommunity 
              class="mn-r-auto mn-l-auto i-big mn-b-thin"
              :fill="$route.path === '/community' ? 'rgb(var(--second))' : 'currentColor'"
            />
            <p class=" t-semi p-small w-100">{{t('navigation.community')}}</p>
          </router-link>

          <!-- Account -->
          <router-link 
            class="no-hover-color t-center t-medium"
            :class="{ 
              't-second': $route.path.startsWith('/auth/') || $route.path.startsWith('/users/'),
              't-transp': !$route.path.startsWith('/auth/') && !$route.path.startsWith('/users/')
            }"
            :to="auth.state.access.status === false ? {name: 'Sign In'} : { name: 'User Profile', params: { _id: auth.state.user._id }}"
          >
            <IconProfile 
              class="mn-r-auto mn-l-auto i-big mn-b-thin"
              :fill="$route.path.startsWith('/auth/') || $route.path.startsWith('/users/') ? 'rgb(var(--second))' : 'currentColor'"
            />
            <p class="t-semi p-small w-100">{{t('navigation.profile')}}</p>
          </router-link>
        </nav>
    </footer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n'

import IconHome from '@martyrs/src/modules/icons/entities/IconHome.vue'
import IconCatalog from '@martyrs/src/modules/icons/entities/IconCatalog.vue'
import IconShopcart from '@martyrs/src/modules/icons/entities/IconShopcart.vue'
import IconCommunity from '@martyrs/src/modules/icons/entities/IconCommunity.vue'
import IconProfile from '@martyrs/src/modules/icons/entities/IconProfile.vue'

import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';

const route = useRoute();
const navRef = ref(null);



const { t, te } = useI18n({ messages: {
  "en": {
    "navigation": {
      "home": "Home",
      "catalog": "Catalog",
      "rents": "My Rents",
      "community": "Community",
      "profile": "Profile"
    }
  }
}})
</script>