<!-- components/layouts/MusicLayout.vue -->
<template>
  <div class="music-layout flex flex-nowrap o-hidden w-100 h-100">
    <!-- Main Content -->
    <div class="flex-child-1 flex flex-column h-100 o-hidden">
      <!-- Header Bar -->
      <header class="flex-child-shrink-0 z-index-3 bg-dark flex-v-center flex-justify-between flex gap-small pd-small br-b br-solid br-dark-transp-20">
        <div class="flex-v-center flex gap-small">
          <div class="music-navigation-buttons flex gap-thin">
            <button @click="$router.go(-1)" class="bg-black radius-extra flex-center flex aspect-1x1 i-medium cursor-pointer hover-bg-dark pd-micro">
              <IconChevronLeft class="i-small" fill="rgb(var(--white))"/>
            </button>
            <button @click="$router.go(1)" class="bg-black radius-extra flex-center flex aspect-1x1 i-medium cursor-pointer hover-bg-dark pd-micro">
              <IconChevronRight class="i-small" fill="rgb(var(--white))"/>
            </button>
          </div>
          
          <h2 v-if="$route.meta.title" class="t-white">{{ $route.meta.title }}</h2>
        </div>
        
        <div class="music-search-bar flex-child-1 mn-l-medium mn-r-medium" v-if="$route.name !== 'music-search'">
          <SearchForm @search="handleSearch" placeholder="Search music..." />
        </div>
        
        <div class="music-user-menu flex-nowrap  flex pos-relative">
   
          <router-link :to="{ name: 'music-library' }" class="t-white pd-thin w-100 d-block hover-bg-dark radius-small">
            My Library
          </router-link>
          <router-link :to="{ name: 'music-upload' }" class="t-white pd-thin w-100 d-block hover-bg-dark radius-small">
            Upload Music
          </router-link>
          
        </div>
      </header>
      
      <!-- Main Content Area -->
      <main class="o-y-scroll o-x-hidden">
        <router-view></router-view>
      </main>
      
      <!-- Music Player Fixed at Bottom -->
      <MusicPlayer v-if="currentTrack" class="flex-child-shrink-0"/>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MusicPlayer from '../player/MusicPlayer.vue';
import SearchForm from '../forms/SearchForm.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Dropdown from '@martyrs/src/components/Dropdown/Dropdown.vue';

// Icons - Import from icons in the Martyrs framework
import IconChevronLeft from '@martyrs/src/modules/icons/navigation/IconChevronLeft.vue';
import IconChevronRight from '@martyrs/src/modules/icons/navigation/IconChevronRight.vue';
import IconProfile from '@martyrs/src/modules/icons/entities/IconProfile.vue';

// Import store modules
import { state as playerState } from '../../store/player.js';
import { state as authState, actions as authActions } from '@martyrs/src/modules/auth/views/store/auth.js';

const router = useRouter();

// UI state
const showUserMenu = ref(false);

// Auth computed properties
const isAuthenticated = computed(() => {
  return authState.access.status === true;
});

const user = computed(() => {
  return authState.user;
});

// Current track from player store
const currentTrack = computed(() => {
  return playerState.currentTrack;
});

// Methods
const handleSearch = (query) => {
  router.push({ name: 'music-search', query: { q: query } });
};

</script>