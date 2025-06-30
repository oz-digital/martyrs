<!-- components/navigation/MusicSidebar.vue -->
<template>
  <Sidebar 
    :stateSidebar="stateSidebar"
    :theme="'dark'"
    :width="'w-15r'"
    :widthHidden="'w-3r'"
    @closeSidebar="$emit('closeSidebar')"
    class="flex-child-shrink-0"
  >
    <div class="pd-thin">
      <div class="music-logo mn-b-medium">
        <h3 class=" mn-b-small">Music</h3>
      </div>
      
      <nav class="music-nav mn-b-medium">
        <ul class="flex flex-column gap-small">
          <li>
            <router-link :to="{ name: 'music-home' }" 
              class="flex-v-center flex gap-small pd-thin radius-small" 
              :class="$route.name === 'music-home' ? 'bg-dark' : 'hover-bg-dark'"
            >
              <IconHome class="i-medium" :fill="$route.name === 'music-home' ? 'rgb(var(--main))' : 'rgb(var(--white))'"/>
              <span class="t-medium" :class="$route.name === 'music-home' ? 't-main' : ''">Home</span>
            </router-link>
          </li>
          <li>
            <router-link :to="{ name: 'music-search' }" 
              class="flex-v-center flex gap-small pd-thin radius-small"
              :class="$route.name === 'music-search' ? 'bg-dark' : 'hover-bg-dark'"
            >
              <IconSearch class="i-medium" :fill="$route.name === 'music-search' ? 'rgb(var(--main))' : 'rgb(var(--white))'"/>
              <span class="t-medium" :class="$route.name === 'music-search' ? 't-main' : ''">Search</span>
            </router-link>
          </li>
          <li>
            <router-link :to="{ name: 'music-library' }" 
              class="flex-v-center flex gap-small pd-thin radius-small"
              :class="$route.name === 'music-library' ? 'bg-dark' : 'hover-bg-dark'"
            >
              <IconLibrary class="i-medium" :fill="$route.name === 'music-library' ? 'rgb(var(--main))' : 'rgb(var(--white))'"/>
              <span class="t-medium" :class="$route.name === 'music-library' ? 't-main' : ''">Your Library</span>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <div class="music-playlists" v-if="isAuthenticated">
        <div class="flex-between flex mn-b-small">
          <h4 class="t-grey t-medium">YOUR PLAYLISTS</h4>
          <Button 
            @click="showCreatePlaylistModal = true" 
            class="bg-transparent cursor-pointer pd-micro radius-small hover-bg-dark"
            :showLoader="false"
            :showSucces="false"
          >
            <IconPlus class="i-small" fill="rgb(var(--white))"/>
          </Button>
        </div>
        
        <Feed
          v-if="userPlaylists.length"
          class="mn-t-thin"
          :skeleton="{
            hide: true
          }"
          :states="{
            empty: {
              title: 'No playlists yet',
              description: 'Create your first playlist to see it here'
            }
          }"
          :items="userPlaylists"
        >
          <template #default="{ items }">
            <li v-for="playlist in items" :key="playlist._id" class="mn-b-thin">
              <router-link 
                :to="{ name: 'playlist-detail', params: { url: playlist.url } }" 
                class=" t-truncate d-block pd-thin radius-small hover-bg-dark"
                :class="$route.params.url === playlist.url ? 'bg-dark t-main' : ''"
              >
                {{ playlist.title }}
              </router-link>
            </li>
          </template>
        </Feed>
      </div>
    </div>
    
    <!-- Create Playlist Modal -->
    <Popup 
      v-if="showCreatePlaylistModal" 
      @close-popup="showCreatePlaylistModal = false" 
      class="bg-dark pd-small w-m-25r radius-medium "
    >
      <h3 class="mn-b-medium">Create Playlist</h3>
      <PlaylistForm @created="onPlaylistCreated" />
    </Popup>
  </Sidebar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Import components from Martyrs framework
import Sidebar from '@martyrs/src/modules/globals/views/components/partials/Sidebar.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import Feed from '@martyrs/src/components/Feed/Feed.vue';
import PlaylistForm from '../forms/PlaylistForm.vue';

// Icons 
import IconHome from '@martyrs/src/modules/icons/navigation/IconHome.vue';
import IconSearch from '@martyrs/src/modules/icons/navigation/IconSearch.vue';
import IconLibrary from '@martyrs/src/modules/icons/entities/IconFolder.vue';
import IconPlus from '@martyrs/src/modules/icons/navigation/IconPlus.vue';

// Store
import { state as authState } from '@martyrs/src/modules/auth/views/store/auth.js';
import { state as playlistsState, actions as playlistsActions } from '../../store/playlists.js';

const props = defineProps({
  stateSidebar: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['closeSidebar']);

const router = useRouter();
const showCreatePlaylistModal = ref(false);

// Auth computed property
const isAuthenticated = computed(() => {
  return authState.access.status === true;
});

// User playlists
const userPlaylists = computed(() => {
  return playlistsState.userPlaylists;
});

const onPlaylistCreated = (playlist) => {
  showCreatePlaylistModal.value = false;
  router.push({ name: 'playlist-detail', params: { url: playlist.url } });
};

// Fetch user playlists on component mount
onMounted(async () => {
  if (isAuthenticated.value && authState.user) {
    await playlistsActions.fetchUserPlaylists();
  }
});
</script>