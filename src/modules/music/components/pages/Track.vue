<!-- components/pages/Track.vue -->
<template>
  <div class="track-page pd-small">
    <!-- Loading -->
    <div v-if="isLoading" class="w-100 h-25r flex-center flex">
      <Loader />
    </div>

    <!-- Not Found -->
    <div v-if="hasLoaded && !track" class="t-center pd-big">
      <h2 class="">Track not found</h2>
      <p class="t-transp t-medium">The track you're looking for doesn't exist or has been removed.</p>
    </div>

    <!-- Track Content -->
    <div v-if="track" class="track-content cols-2-fit-content mobile:cols-1 gap-big">
      <!-- Left Column - Cover & Stats -->
      <div class="pos-sticky pos-t-0 mobile:pos-relative track-cover-section">
        <!-- Cover with Play Overlay -->
        <div class="cover-container pos-relative mn-b-medium radius-big o-hidden">
          <Media 
            :url="track.coverUrl || (track.album && track.album.coverUrl) || '/logo/logo-placeholder.jpg'" 
            :alt="track.title"
            class="aspect-1x1 w-100 radius-medium o-hidden"
          />
          <div class="cover-overlay w-100 h-100 pos-absolute pos-t-0 pos-r-0 bg-black-transp-40 flex flex-center">
            <Button
              @click="playTrack"
              color="white"
              size="big"
              class="w-5r h-5r radius-big bg-main shadow-big hover-scale-110"
            >
              <IconPlay v-if="!isPlaying" fill="rgb(var(--white))" class="i-medium" />
              <IconPause v-else fill="rgb(var(--white))" class="i-medium" />
            </Button>
          </div>
        </div>

          

        <!-- Quick Stats -->
        <div class="stats-grid grid cols-2 gap-small">
          <div class="stat-card bg-light pd-medium radius-medium t-center">
            <div class=" mn-b-thin">{{ formatNumber(track.playCount) }}</div>
            <div class="t-small t-transp t-uppercase">Plays</div>
          </div>
          <div class="stat-card bg-light pd-medium radius-medium t-center">
            <div class=" mn-b-thin">{{ formatNumber(track.views) }}</div>
            <div class="t-small t-transp t-uppercase">Views</div>
          </div>
        </div>
      </div>

      <!-- Right Column - Track Details -->
      <div class="track-details-section">
        <!-- Track Type Badge -->
        <div class="flex items-center gap-small mn-b-small">
           <span class="bg-light t-medium pd-thin radius-thin uppercase t-small t-uppercase">Single</span>
           <span class="bg-light t-medium pd-thin radius-thin uppercase t-small t-uppercase">Explicit</span>
        </div>

        <!-- Track Title -->
        <h1 class="h1 mn-b-medium">{{ track.title }}</h1>
        <!-- Action Buttons -->
        <div class="flex gap-small mn-b-medium">
          <Button
            @click="playTrack"
            color="primary"
            size="medium"
            class="flex-1 t-white bg-black radius-thin flex-center gap-thin"
          >
            <IconPlay v-if="!isPlaying" fill="rgb(var(--white))" class="i-medium" />
            <IconPause v-else fill="rgb(var(--white))" class="i-medium" />
            {{ !isPlaying ? 'Play' : 'Pause'}}
          </Button>

          <Button
            @click="addToQueue"
            color="primary"
            size="medium"
            class="flex-1 bg-light radius-thin flex-center gap-thin"
          >
            <IconAdd class="i-medium" />
            Add to Queue
          </Button>

          <Button
            @click="toggleFavorite"
            color="primary"
            size="medium"
            class="flex-1 bg-light radius-thin flex-center gap-thin"
          >
            <IconLike class="i-medium" :fill="isFavorite ? 'rgb(var(--main)':'rgb(var(--black)'" />
            {{isFavorite ? 'Liked' : 'Like'}}
          </Button>

          <Dropdown :label="{component: IconEllipsis, class: 'bg-light radius-thin pd-thin i-big' }" v-model="showDropdown" class="relative">
            <template #trigger>
              <Button color="transp" size="medium" class="w-3r h-3r radius-full">
                <IconEllipsis class="w-1-25r h-1-25r" />
              </Button>
            </template>
            <template #default>
              <div class="dropdown-menu bg-dark pd-small radius-medium shadow-big mn-t-thin">
                <Button @click="showAddToPlaylistModal = true" color="transp" size="small" class="w-100 justify-start">
                  Add to Playlist
                </Button>
                <Button @click="copyLink" color="transp" size="small" class="w-100 justify-start">
                  Copy Link
                </Button>
                <template v-if="isOwner">
                  <hr class="mn-v-thin border-dark-transp-10" />
                  <Button @click="editTrack" color="transp" size="small" class="w-100 justify-start">
                    Edit Track
                  </Button>
                  <Button @click="deleteTrack" color="danger" size="small" class="w-100 justify-start">
                    Delete Track
                  </Button>
                </template>
              </div>
            </template>
          </Dropdown>
        </div>

        <!-- Artist Card -->
        <div class="artists-section mn-b-medium">
          <h3 class="t-medium mn-b-small" v-if="track.artist">Artist</h3>
          <div class="flex flex-col gap-small">
            <ArtistCardSmall 
              :key="track.artist._id"
              :artist="track.artist"
              :is-following="isFollowingArtist"
              :show-follow-button="!isOwner"
              @toggle-follow="toggleFollowArtist"
            />
          </div>
        </div>

        <!-- Metadata Cards -->
        <h3 class="t-medium mn-b-small">Metadata</h3>
        <div class="metadata-grid grid cols-2 gap-small mn-b-medium">
          <!-- Release Date -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
            <IconCalendar class="i-regular t-primary" />
            <div>
              <div class="t-small t-transp t-uppercase">Released</div>
              <div class="t-medium ">{{ formatDate(track.releaseDate) }}</div>
            </div>
          </div>

          <!-- Total Duration -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
            <IconClock class="i-regular t-primary" />
            <div>
              <div class="t-small t-transp t-uppercase">Duration</div>
              <div class="t-medium ">{{ formatDuration(track.duration) }}</div>
            </div>
          </div>

          <!-- Label -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
            <IconCheck class="i-regular t-primary" />
            <div>
              <div class="t-small t-transp t-uppercase">Status</div>
              <div class="t-medium ">{{ track.status }}</div>
            </div>
          </div>

          <!-- Visibility -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
            <IconEye class="i-regular t-primary" />
            <div>
              <div class="t-small t-transp t-uppercase">Visibility</div>
              <div class="t-medium ">{{ track.isPublic ? 'Public' : 'Private' }}</div>
            </div>
          </div>
        </div>


        <!-- Album Info -->
        <h3 v-if="track.album" class="t-medium mn-b-small">From Album</h3>
        <div v-if="track.album" class="album-card bg-light pd-medium radius-medium mn-b-medium">
         
          <router-link 
            :to="`/album/${track.album.url}`"
            class="flex flex-v-center gap-thin hover-opacity"
          >
            <Media 
              :url="track.album.coverArt || '/logo/logo-placeholder.jpg'"
              :alt="track.album.title"
              class="w-3r h-3r radius-thin o-hidden object-cover"
            />
            <span class="t-medium ">{{ track.album.title }}</span>
          </router-link>
        </div>

        <!-- Genres & Tags -->
        <div v-if="(track.genre && track.genre.length) || (track.tags && track.tags.length)" class="tags-section mn-b-medium">
          <h3 class="t-medium mn-b-small">Genres & Tags</h3>
          <div class="flex gap-thin flex-wrap">
            <span 
              v-for="genre in track.genre" 
              :key="genre"
              class="tag bg-main t-medium pd-thin radius-thin t-small cursor-pointer"
            >
              {{ genre.name || genre }}
            </span>
            <span 
              v-for="tag in track.tags" 
              :key="tag"
              class="tag bg-light t-transp pd-thin-big radius-small t-small hover-bg-light cursor-pointer"
            >
              #{{ tag.name || tag }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <div v-if="track.description" class="description-section bg-light pd-medium radius-medium mn-b-medium">
          <h3 class="t-medium mn-b-small">About</h3>
          <p class="t-transp">{{ track.description }}</p>
        </div>

        <!-- Lyrics -->
        <div v-if="track.lyrics" class="lyrics-section bg-light pd-medium radius-medium">
          <h3 class="t-medium mn-b-small">Lyrics</h3>
          <pre class="t-transp t-small">{{ track.lyrics }}</pre>
        </div>
      </div>
    </div>

    <!-- Related Tracks -->
    <section v-if="track && relatedTracks && relatedTracks.length" class="related-section mn-t-big">
      <h2 class="h2 mn-b-medium">Related Tracks</h2>
      <Feed
        :store="{
          read: () => new Promise(resolve => resolve(relatedTracks || [])),
          state: { isLoading: false }
        }"
        :external="true"
        :items="relatedTracks"
        :states="{
          empty: {
            title: 'No related tracks',
            description: 'Check back later for recommendations',
            class: 'pd-medium bg-light radius-medium'
          }
        }"
        class="grid cols-2 cols-m-3 cols-l-4 gap-medium"
      >
        <template #default="{ items }">
          <div class="bg-light radius-medium o-hidden">
            <TrackListCard
              v-for="(relatedTrack, index) in items"
              :key="relatedTrack._id"
              :track="relatedTrack"
              :index="index"
              :showAlbum="true"
              :showCover="true"
            />
          </div>
        </template>
      </Feed>
    </section>

    <!-- Add to Playlist Modal -->
    <Popup 
      v-if="showAddToPlaylistModal" 
      @close-popup="showAddToPlaylistModal = false" 
      class="bg-white pd-medium w-m-25r radius-medium"
    >
      <h3 class="h3 mn-b-medium">Add to Playlist</h3>
      <!-- <PlaylistSelector 
        :trackId="track._id" 
        @added="showAddToPlaylistModal = false"
      /> -->
      <p class="t-transp">Playlist selector coming soon...</p>
    </Popup>
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
import Feed from '@martyrs/src/components/Feed/Feed.vue';

// Icons
import IconPlay from '@martyrs/src/modules/icons/navigation/IconPlay.vue';
import IconPause from '@martyrs/src/modules/icons/navigation/IconPause.vue';
import IconLike from '@martyrs/src/modules/icons/navigation/IconLike.vue';
import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue';
import IconAdd from '@martyrs/src/modules/icons/navigation/IconAdd.vue';
import IconClock from '@martyrs/src/modules/icons/entities/IconTime.vue';
import IconCalendar from '@martyrs/src/modules/icons/entities/IconCalendar.vue';
import IconCheck from '@martyrs/src/modules/icons/navigation/IconCheckmark.vue';
import IconEye from '@martyrs/src/modules/icons/actions/IconShow.vue';
import IconVerified from '@martyrs/src/modules/icons/navigation/IconCheckmark.vue';

// Components
import TrackListCard from '../cards/TrackListCard.vue';
import ArtistCardSmall from '../cards/ArtistCardSmall.vue';
// import PlaylistSelector from '../forms/PlaylistSelector.vue';

// Store
import { state as tracksState, actions as tracksActions } from '../../store/tracks.js';
import { state as playerState, actions as playerActions } from '../../store/player.js';
import { state as authState } from '@martyrs/src/modules/auth/views/store/auth.js';

const isPlaying = computed(() => playerState.isPlaying);

const route = useRoute();
const router = useRouter();

// Emits
const emits = defineEmits(['page-loading', 'page-loaded']);

// State
const hasLoaded = ref(false);
const showDropdown = ref(false);
const showAddToPlaylistModal = ref(false);
const isFavorite = ref(false);
const isFollowingArtist = ref(false);

// Clear state
tracksState.currentTrack = null;
tracksState.relatedTracks = [];

// Computed
const track = computed(() => tracksState.currentTrack);
const relatedTracks = computed(() => tracksState.relatedTracks || []);

const isOwner = computed(() => {
  return track.value?.owner?.target === authState.user?._id;
});

// Format helpers
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Actions
const playTrack = () => {
  if (track.value) {
    playerActions.setQueue([track.value]);
  }
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // TODO: Implement actual saving
};

const toggleFollowArtist = () => {
  isFollowingArtist.value = !isFollowingArtist.value;
  // TODO: Implement actual following
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
  if (confirm('Are you sure you want to delete this track?')) {
    try {
      await tracksActions.deleteTrack(track.value._id);
      router.push({ name: 'music-library' });
    } catch (error) {
      console.error('Failed to delete track:', error);
    }
  }
};

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href);
  showDropdown.value = false;
};

// Data fetching
const fetchTrackData = async () => {
  try {
    await tracksActions.fetchTrackByUrl(route.params.url);
    await tracksActions.fetchRelatedTracks(route.params.url);
  } catch (error) {
    console.error('Error loading track:', error);
  }
};

// Lifecycle
onMounted(async () => {
  emits('page-loading');
  
  await fetchTrackData();
  
  hasLoaded.value = true;
  emits('page-loaded');
});
</script>

<style scoped>
</style>