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
        <div class="cover-container relative mn-b-medium radius-big overflow-hidden shadow-big">
          <Media 
            :url="track.coverUrl || (track.album && track.album.coverUrl) || '/logo/logo-placeholder.jpg'" 
            :alt="track.title"
            class="aspect-1x1 w-100 radius-medium o-hidden"
          />
          <!-- <div class="cover-overlay absolute inset-0 bg-black-transp-40 flex-center opacity-0 hover-opacity-100 transition">
            <Button
              @click="playTrack"
              color="white"
              size="big"
              class="w-5r h-5r radius-full shadow-big hover-scale-110"
            >
              <IconPlay class="w-2r h-2r" />
            </Button>
          </div> -->
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
          <span class="badge bg-primary-transp-20 t-primary pd-thin-big radius-small t-small t-uppercase">Single</span>
          <span v-if="track.isExplicit" class="badge bg-danger-transp-20 t-danger pd-thin-big radius-small t-small">Explicit</span>
        </div>

        <!-- Track Title -->
        <h1 class="h1 mn-b-medium">{{ track.title }}</h1>
        <!-- Action Buttons -->
        <div class="flex gap-small mn-b-medium">
          <Button
            @click="playTrack"
            color="primary"
            size="medium"
            class="flex-1 flex-center gap-thin"
          >
            <IconPlay class="w-1r h-1r" />
            Play
          </Button>
          
          <Button
            @click="toggleFavorite"
            :color="isFavorite ? 'danger' : 'transp'"
            size="medium"
            class="w-3r h-3r radius-full"
          >
            <IconLike class="w-1-25r h-1-25r" :fill="isFavorite" />
          </Button>
          
          <Button
            @click="addToQueue"
            color="transp"
            size="medium"
            class="w-3r h-3r radius-full"
          >
            <IconAdd class="w-1-25r h-1-25r" />
          </Button>
          
          <Dropdown v-model="showDropdown" class="relative">
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
        <div class="artist-card bg-light pd-medium radius-medium flex items-center gap-medium mn-b-big">
          <router-link 
            :to="`/artist/${track.artist.url}`"
            class="flex items-center gap-medium flex-1 hover-opacity"
          >
            <div class="artist-avatar">
              <Media 
                v-if="track.artist.photoUrl"
                :src="track.artist.photoUrl"
                :alt="track.artist.name"
                class="w-4r h-4r radius-full object-cover"
              />
              <div v-else class="w-4r h-4r radius-full bg-primary flex-center ">
                {{ track.artist.name.charAt(0) }}
              </div>
            </div>
            <div>
              <div class="flex items-center gap-thin">
                <span class="t-large ">{{ track.artist.name }}</span>
                <IconVerified v-if="track.artist.isVerified" class="w-1r h-1r t-primary" />
              </div>
              <span class="t-small t-transp">Artist</span>
            </div>
          </router-link>
          <Button 
            v-if="!isOwner"
            @click="toggleFollowArtist"
            :color="isFollowingArtist ? 'primary' : 'transp'"
            size="small"
          >
            {{ isFollowingArtist ? 'Following' : 'Follow' }}
          </Button>
        </div>



        <!-- Metadata Cards -->
        <div class="metadata-grid grid cols-2 gap-small mn-b-big">
          <!-- Duration -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
            <div class="icon-wrapper bg-primary-transp-20 w-3r h-3r radius-small flex-center">
              <IconClock class="w-1-5r h-1-5r t-primary" />
            </div>
            <div>
              <div class="t-small t-transp t-uppercase">Duration</div>
              <div class="t-medium ">{{ formatDuration(track.duration) }}</div>
            </div>
          </div>

          <!-- Release Date -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
            <div class="icon-wrapper bg-primary-transp-20 w-3r h-3r radius-small flex-center">
              <IconCalendar class="w-1-5r h-1-5r t-primary" />
            </div>
            <div>
              <div class="t-small t-transp t-uppercase">Released</div>
              <div class="t-medium ">{{ formatDate(track.releaseDate) }}</div>
            </div>
          </div>

          <!-- Status -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
            <div class="icon-wrapper bg-success-transp-20 w-3r h-3r radius-small flex-center">
              <IconCheck class="w-1-5r h-1-5r t-success" />
            </div>
            <div>
              <div class="t-small t-transp t-uppercase">Status</div>
              <div class="t-medium t-success">{{ track.status }}</div>
            </div>
          </div>

          <!-- Visibility -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
            <div class="icon-wrapper bg-primary-transp-20 w-3r h-3r radius-small flex-center">
              <IconEye class="w-1-5r h-1-5r t-primary" />
            </div>
            <div>
              <div class="t-small t-transp t-uppercase">Visibility</div>
              <div class="t-medium ">{{ track.isPublic ? 'Public' : 'Private' }}</div>
            </div>
          </div>
        </div>

        <!-- Album Info -->
        <div v-if="track.album" class="album-card bg-light pd-medium radius-medium mn-b-medium">
          <div class="t-small t-transp t-uppercase mn-b-thin">From Album</div>
          <router-link 
            :to="`/album/${track.album.url}`"
            class="flex items-center gap-medium hover-opacity"
          >
            <Media 
              v-if="track.album.coverUrl"
              :src="track.album.coverUrl"
              :alt="track.album.title"
              class="w-3r h-3r radius-small object-cover"
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
              class="tag bg-primary-transp-20 t-primary pd-thin-big radius-small t-small hover-bg-primary-transp-30 cursor-pointer"
            >
              {{ genre }}
            </span>
            <span 
              v-for="tag in track.tags" 
              :key="tag"
              class="tag bg-light t-transp pd-thin-big radius-small t-small hover-bg-light cursor-pointer"
            >
              #{{ tag }}
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
      class="bg-dark pd-medium w-m-25r radius-medium"
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
// import PlaylistSelector from '../forms/PlaylistSelector.vue';

// Store
import { state as tracksState, actions as tracksActions } from '../../store/tracks.js';
import { actions as playerActions } from '../../store/player.js';
import { state as authState } from '@martyrs/src/modules/auth/views/store/auth.js';

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