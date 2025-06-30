<!-- components/pages/Track.vue -->
<template>
  <div class="track-page">
    <!-- Loading -->
    <div v-if="isLoading" class="w-100 h-25r flex-center flex">
      <Loader />
    </div>

    <!-- Not Found -->
    <div v-else-if="!track" class="t-center pd-big">
      <h2 class="">Track not found</h2>
      <p class="t-grey t-medium">The track you're looking for doesn't exist or has been removed.</p>
    </div>

    <!-- Track Content -->
    <div v-else>
      <!-- ... [HEADER + ACTIONS as you posted] -->

      <!-- Track Lyrics -->
      <div v-if="track.lyrics" class="track-lyrics mn-b-medium pd-medium bg-dark-transp-10 radius-medium">
        <h2 class=" mn-b-small">Lyrics</h2>
        <pre class="t-grey">{{ track.lyrics }}</pre>
      </div>

      <!-- Related Tracks -->
      <section v-if="relatedTracks.length" class="related-tracks mn-b-medium">
        <h2 class=" mn-b-small">Related Tracks</h2>
        <Feed
          :store="{
            read: () => Promise.resolve(relatedTracks.value),
            state: { isLoading: false }
          }"
          :external="true"
          :items="relatedTracks"
          :states="{
            empty: {
              title: 'No related tracks',
              description: 'Check back later for recommendations',
              class: 'pd-medium bg-dark-transp-10 radius-medium'
            }
          }"
          class="gap-thin"
        >
          <template #default="{ items }">
            <TrackCard
              v-for="relatedTrack in items"
              :key="relatedTrack._id"
              :track="relatedTrack"
              :showAlbum="true"
              :showCover="true"
              class="w-100 bg-dark-transp-10 radius-medium"
            />
          </template>
        </Feed>
      </section>

      <!-- Add to Playlist Modal -->
      <!-- <Popup 
        v-if="showAddToPlaylistModal" 
        @close-popup="showAddToPlaylistModal = false" 
        class="bg-dark pd-small w-m-25r radius-medium "
      >
        <h3 class="mn-b-medium">Add to Playlist</h3>
        <PlaylistSelector 
          :trackId="track._id" 
          @added="showAddToPlaylistModal = false"
        />
      </Popup> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from '@martyrs/src/components/Button/Button.vue';
import Loader from '@martyrs/src/components/Loader/Loader.vue';
import Media from '@martyrs/src/components/Media/Media.vue';
import Dropdown from '@martyrs/src/components/Dropdown/Dropdown.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import IconPlay from '@martyrs/src/modules/icons/navigation/IconPlay.vue';
import IconLike from '@martyrs/src/modules/icons/navigation/IconLike.vue';
import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue';
import Feed from '@martyrs/src/components/Feed/Feed.vue';
import TrackCard from '../cards/TrackCard.vue';
// import PlaylistSelector from '../forms/PlaylistSelector.vue';

import { state as tracksState, actions as tracksActions } from '../../store/tracks.js';
import { actions as playerActions } from '../../store/player.js';
import { state as authState } from '@martyrs/src/modules/auth/views/store/auth.js';

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const showDropdown = ref(false);
const showAddToPlaylistModal = ref(false);
const isFavorite = ref(false);

const track = computed(() => tracksState.currentTrack);
const relatedTracks = computed(() => tracksState.relatedTracks);

const isOwner = computed(() => {
  return track.value?.owner?.target === authState.user?._id;
});

const getArtistName = (track) => {
  if (!track || !track.artist) return 'Unknown';
  return typeof track.artist === 'object' ? track.artist.name : 'Unknown';
};

const formatReleaseYear = (date) => {
  return date ? new Date(date).getFullYear() : 'Unknown';
};

const playTrack = () => {
  if (track.value) {
    playerActions.setQueue([track.value]);
  }
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // You can implement actual saving here
};

const addToQueue = () => {
  if (track.value) {
    playerActions.addToQueue(track.value);
  }
};

const editTrack = () => {
  router.push({ name: 'track-edit', params: { url: track.value.url } });
};

const deleteTrack = async () => {
  try {
    await tracksActions.deleteTrack(track.value._id);
    router.push({ name: 'music-library' });
  } catch (error) {
    console.error('Failed to delete track:', error);
  }
};

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href);
  showDropdown.value = false;
};

const fetchTrackData = async () => {
  isLoading.value = true;
  try {
    await tracksActions.fetchTrackByUrl(route.params.url);
    await tracksActions.fetchRelatedTracks(route.params.url);
  } catch (error) {
    console.error('Error loading track:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchTrackData);
watch(() => route.params.url, fetchTrackData);
</script>
