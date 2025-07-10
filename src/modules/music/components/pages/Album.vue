<!-- components/pages/Album.vue -->
<template>
  <div class="album-page pd-small">
    <!-- Loading -->
    <div v-if="isLoading" class="w-100 h-25r flex-center flex">
      <Loader />
    </div>
    
    <!-- Not Found -->
    <div v-if="hasLoaded && !album" class="t-center pd-big">
      <h2 class="">Album not found</h2>
      <p class="t-transp t-medium">The album you're looking for doesn't exist or has been removed.</p>
    </div>
    
    <!-- Album Content -->
    <div v-if="album" class="album-content cols-2-fit-content mobile:cols-1 gap-big">
      <!-- Left Column - Cover & Stats -->
      <div class="pos-sticky pos-t-0 mobile:pos-relative album-cover-section">
        <!-- Cover -->
        <div class="cover-container relative mn-b-medium radius-big overflow-hidden shadow-big">
          <Media 
            :url="album.coverArt || '/logo/logo-placeholder.jpg'"
            :alt="album.title"
            class="aspect-1x1 w-100 radius-medium o-hidden"
          />
        </div>

        <!-- Quick Stats -->
        <div class="stats-grid grid cols-2 gap-small">
          <div class="stat-card bg-light pd-medium radius-medium t-center">
            <div class=" mn-b-thin">{{ album.totalTracks || 0 }}</div>
            <div class="t-small t-transp t-uppercase">Tracks</div>
          </div>
          <div class="stat-card bg-light pd-medium radius-medium t-center">
            <div class=" mn-b-thin">{{ formatNumber(album.views) }}</div>
            <div class="t-small t-transp t-uppercase">Views</div>
          </div>
        </div>
      </div>

      <!-- Right Column - Album Details -->
      <div class="album-details-section">
        <!-- Album Type Badge -->
        <div class="flex items-center gap-small mn-b-small">
          <span class="badge bg-primary-transp-20 t-primary pd-thin-big radius-small t-small t-uppercase">
            {{ album.type }}
          </span>
          <span v-if="album.status === 'published'" class="badge bg-success-transp-20 t-success pd-thin-big radius-small t-small">
            Published
          </span>
        </div>

        <!-- Album Title -->
        <h1 class="h1 mn-b-medium">{{ album.title }}</h1>

        <!-- Action Buttons -->
        <div class="flex gap-small mn-b-medium">
          <Button
            @click="playAlbum"
            color="primary"
            size="medium"
            class="flex-1 t-white bg-black radius-thin flex-center gap-thin"
          >
            <IconPlay fill="rgb(var(--white))" class="i-medium" />
            Play All
          </Button>

          <Button
            @click="shufflePlay"
            color="primary"
            size="medium"
            class="flex-1 bg-light radius-thin flex-center gap-thin"
          >
            <IconShuffle class="i-medium" />
            Shuffle
          </Button>

          <Button
            @click="toggleFavorite"
            color="primary"
            size="medium"
            class="flex-1 bg-light radius-thin flex-center gap-thin"
          >
            <IconLike class="i-medium" :fill="isFavorite" />
            {{isFavorite ? 'Liked' : 'Like'}}
          </Button>

          <Dropdown :label="{component: IconEllipsis, class: 'bg-light radius-thin pd-thin i-big' }" v-model="showDropdown" class="relative">
            <template #trigger>
              <Button color="transp" size="medium" class="w-3r h-3r radius-full">
                <IconEllipsis class="w-1-25r h-1-25r" />
              </Button>
            </template>
            <template #default>
              <div class="dropdown-menu bg-white pd-small radius-medium shadow-big mn-t-thin">
                <Button @click="addToQueue" color="transp" size="small" class="w-100 justify-start">
                  Add to Queue
                </Button>
                <Button @click="copyLink" color="transp" size="small" class="w-100 justify-start">
                  Copy Link
                </Button>
                <Button @click="addToPlaylist" color="transp" size="small" class="w-100 justify-start">
                  Add to Playlist
                </Button>
                <template v-if="isOwner">
                  <hr class="mn-v-thin border-dark-transp-10" />
                  <Button @click="editAlbum" color="transp" size="small" class="w-100 justify-start">
                    Edit Album
                  </Button>
                  <Button @click="deleteAlbum" color="danger" size="small" class="w-100 justify-start">
                    Delete Album
                  </Button>
                </template>
              </div>
            </template>
          </Dropdown>
        </div>

        <!-- Artists Cards -->
        <div class="artists-section mn-b-big">
          <h3 class="t-medium mn-b-small" v-if="album.artists && album.artists.length > 1">Artists</h3>
          <div class="flex flex-col gap-small">
            <div 
              v-for="artist in album.artists" 
              :key="artist._id"
              class="artist-card bg-light pd-medium radius-medium flex items-center gap-medium"
            >
              <router-link 
                :to="{ name: 'artist', params: { url: artist.url } }"
                class="flex items-center gap-medium flex-1 hover-opacity"
              >
                <div class="artist-avatar">
                  <Media 
                    v-if="artist.photoUrl"
                    :url="artist.photoUrl"
                    :alt="artist.name"
                    class="w-4r h-4r radius-full object-cover"
                  />
                  <div v-else class="w-4r h-4r radius-full bg-primary flex-center ">
                    {{ artist.name.charAt(0) }}
                  </div>
                </div>
                <div>
                  <div class="flex items-center gap-thin">
                    <span class="t-large ">{{ artist.name }}</span>
                    <IconVerified v-if="artist.isVerified" class="w-1r h-1r t-primary" />
                  </div>
                  <span class="t-small t-transp">Artist</span>
                </div>
              </router-link>
              <Button 
                v-if="!isOwner"
                @click="() => toggleFollowArtist(artist._id)"
                :color="followedArtists.includes(artist._id) ? 'primary' : 'transp'"
                size="small"
              >
                {{ followedArtists.includes(artist._id) ? 'Following' : 'Follow' }}
              </Button>
            </div>
          </div>
        </div>

        <!-- Metadata Cards -->
        <div class="metadata-grid grid cols-2 gap-small mn-b-big">
          <!-- Release Date -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
            <IconCalendar class="i-regular t-primary" />
            <div>
              <div class="t-small t-transp t-uppercase">Released</div>
              <div class="t-medium ">{{ formatDate(album.releaseDate) }}</div>
            </div>
          </div>

          <!-- Total Duration -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
            <IconClock class="i-regular t-primary" />
            <div>
              <div class="t-small t-transp t-uppercase">Duration</div>
              <div class="t-medium ">{{ totalDuration }}</div>
            </div>
          </div>

          <!-- Label -->
          <div v-if="album.label" class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
            <IconDisc class="i-regular t-primary" />
            <div>
              <div class="t-small t-transp t-uppercase">Label</div>
              <div class="t-medium ">{{ album.label }}</div>
            </div>
          </div>

          <!-- Visibility -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
            <IconEye class="i-regular t-primary" />
            <div>
              <div class="t-small t-transp t-uppercase">Visibility</div>
              <div class="t-medium ">{{ album.isPublic ? 'Public' : 'Private' }}</div>
            </div>
          </div>
        </div>

        <!-- Genres & Tags -->
        <div v-if="(album.genres && album.genres.length) || (album.tags && album.tags.length)" class="tags-section mn-b-medium">
          <h3 class="t-medium mn-b-small">Genres & Tags</h3>
          <div class="flex gap-thin flex-wrap">
            <span 
              v-for="genre in album.genres" 
              :key="genre"
              class="tag bg-primary-transp-20 t-primary pd-thin-big radius-small t-small hover-bg-primary-transp-30 cursor-pointer"
            >
              {{ genre }}
            </span>
            <span 
              v-for="tag in album.tags" 
              :key="tag"
              class="tag bg-light t-transp pd-thin-big radius-small t-small hover-bg-light cursor-pointer"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <div v-if="album.description" class="description-section bg-light pd-medium radius-medium mn-b-medium">
          <h3 class="t-medium mn-b-small">About</h3>
          <p class="t-transp">{{ album.description }}</p>
        </div>
      </div>
    </div>

    <!-- Album Tracks -->
    <section v-if="!isLoading && album && albumTracks.length" class="tracks-section mn-t-big">
      <h2 class="h2 mn-b-medium">Tracklist</h2>
      <Feed
        :store="{
          read: () => Promise.resolve(albumTracks),
          state: { isLoading: false }
        }"
        :external="true"
        :items="albumTracks"
        :states="{
          empty: {
            title: 'No tracks in album',
            description: 'This album appears to be empty',
            class: 'pd-medium t-center'
          }
        }"
      >
        <template #default="{ items }">
          <div class="bg-light radius-medium o-hidden">
            <TrackListCard
              v-for="(track, index) in items"
              :key="track._id"
              :track="track"
              :index="index + 1"
              :showAlbum="false"
              :showCover="false"
            />
          </div>
        </template>
      </Feed>
    </section>

    <!-- More from Artists -->
    <section v-if="!isLoading && album && moreAlbums.length" class="more-albums-section mn-t-big">
      <div class="flex justify-between items-center mn-b-medium">
        <h2 class="h2">More Albums</h2>
        <router-link 
          v-if="album.artists && album.artists[0]"
          :to="{ name: 'artist', params: { url: album.artists[0].url } }" 
          class="t-primary hover-opacity"
        >
          See all
        </router-link>
      </div>
      <div  class="flex flex-nowrap gap-small o-x-scroll overscroll-behavior-x-contain scroll-behavior-smooth scroll-snap-type-x-mandatory scroll-hide"
      >
        <li v-for="relatedAlbum in moreAlbums"  :key="album._id" class="flex-none scroll-snap-align-start">
          <AlbumCard :album="relatedAlbum" class="w-min-15r transition-cubic-in-out" />
        </li>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from '@martyrs/src/components/Button/Button.vue';
import Loader from '@martyrs/src/components/Loader/Loader.vue';
import Media from '@martyrs/src/components/Media/Media.vue';
import Dropdown from '@martyrs/src/components/Dropdown/Dropdown.vue';
import Feed from '@martyrs/src/components/Feed/Feed.vue';

// Icons
import IconPlay from '@martyrs/src/modules/icons/navigation/IconPlay.vue';
import IconLike from '@martyrs/src/modules/icons/navigation/IconLike.vue';
import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue';
import IconShuffle from '@martyrs/src/modules/icons/navigation/IconShuffle.vue';
import IconCalendar from '@martyrs/src/modules/icons/entities/IconCalendar.vue';
import IconClock from '@martyrs/src/modules/icons/entities/IconTime.vue';
import IconEye from '@martyrs/src/modules/icons/actions/IconShow.vue';
import IconDisc from '@martyrs/src/modules/icons/entities/IconMusic.vue';
import IconVerified from '@martyrs/src/modules/icons/navigation/IconCheckmark.vue';

// Components
import TrackListCard from '../cards/TrackListCard.vue';
import AlbumCard from '../cards/AlbumCard.vue';

// Store
import { state as albumsState, actions as albumsActions } from '../../store/albums.js';
import { actions as playerActions } from '../../store/player.js';
import { state as authState } from '@martyrs/src/modules/auth/views/store/auth.js';

const route = useRoute();
const router = useRouter();

// Emits
const emits = defineEmits(['page-loading', 'page-loaded']);

// State
const hasLoaded = ref(false);
const isFavorite = ref(false);
const showDropdown = ref(false);
const followedArtists = ref([]);
const moreAlbums = ref([]);

// Clear state
albumsState.currentAlbum = null;
albumsState.currentAlbumTracks = [];

// Computed
const album = computed(() => albumsState.currentAlbum);
const albumTracks = computed(() => albumsState.currentAlbumTracks || []);

const isOwner = computed(() => {
  return album.value?.owner?.target === authState.user?._id;
});

const totalDuration = computed(() => {
  if (!albumTracks.value.length) return '0:00';
  const totalSeconds = albumTracks.value.reduce((sum, track) => sum + (track.duration || 0), 0);
  return formatDuration(totalSeconds);
});

// Format helpers
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

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
const playAlbum = () => {
  if (albumTracks.value && albumTracks.value.length > 0) {
    playerActions.setQueue(albumTracks.value);
  }
};

const shufflePlay = () => {
  if (albumTracks.value && albumTracks.value.length > 0) {
    const shuffled = [...albumTracks.value].sort(() => Math.random() - 0.5);
    playerActions.setQueue(shuffled);
  }
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // TODO: Implement actual saving
};

const toggleFollowArtist = (artistId) => {
  const index = followedArtists.value.indexOf(artistId);
  if (index > -1) {
    followedArtists.value.splice(index, 1);
  } else {
    followedArtists.value.push(artistId);
  }
  // TODO: Implement actual following
};

const addToQueue = () => {
  if (albumTracks.value.length > 0) {
    albumTracks.value.forEach(track => {
      playerActions.addToQueue(track);
    });
    showDropdown.value = false;
  }
};

const editAlbum = () => {
  router.push({ name: 'album-edit', params: { url: album.value.url } });
};

const deleteAlbum = async () => {
  if (confirm('Are you sure you want to delete this album?')) {
    try {
      await albumsActions.deleteAlbum(album.value._id);
      router.push({ name: 'music-library' });
    } catch (error) {
      console.error('Failed to delete album:', error);
    }
  }
};

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href);
  showDropdown.value = false;
};

// Data fetching
const fetchAlbumData = async () => {
  try {
    await albumsActions.fetchAlbumByUrl(route.params.url);
    
    // Fetch more albums from the same artists
    if (album.value?.artists?.length) {
      const artistIds = album.value.artists.map(a => a._id);
      const albums = await albumsActions.fetchAlbums({
        artist: { $in: artistIds },
        status: 'published',
        isPublic: true,
        limit: 6
      });
      
      // Filter out current album
      moreAlbums.value = albums.filter(a => a._id !== album.value._id).slice(0, 5);
    }
  } catch (error) {
    console.error('Error fetching album data:', error);
  }
};

// Lifecycle
onMounted(async () => {
  emits('page-loading');
  
  await fetchAlbumData();
  
  hasLoaded.value = true;
  emits('page-loaded');
});
</script>

<style scoped>
</style>