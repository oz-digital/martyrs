<template>
  <div class="playlist-page pd-small">
    <!-- Not Found -->
    <div v-if="hasLoaded && !playlist" class="t-center pd-big">
      <h2 class="">Playlist not found</h2>
      <p class="t-transp t-medium">The playlist you're looking for doesn't exist or has been removed.</p>
    </div>
    
    <!-- Playlist Content -->
    <div v-if="playlist" class="playlist-content cols-2-fit-content mobile:cols-1 gap-big">
      <!-- Left Column - Cover & Stats -->
      <div class="pos-sticky pos-t-0 mobile:pos-relative playlist-cover-section">
        <!-- Cover -->
        <div class="cover-container relative mn-b-medium radius-big overflow-hidden shadow-big">
          <Media 
            :url="playlist.coverUrl || '/assets/placeholder-playlist.jpg'"
            :alt="playlist.title"
            class="aspect-1x1 w-100 radius-medium o-hidden"
          />
        </div>

        <!-- Quick Stats -->
        <div class="stats-grid grid cols-2 gap-small">
          <div class="stat-card bg-light pd-medium radius-medium t-center">
            <div class=" mn-b-thin">{{ playlistTracks.length }}</div>
            <div class="t-small t-transp t-uppercase">Tracks</div>
          </div>
          <div class="stat-card bg-light pd-medium radius-medium t-center">
            <div class=" mn-b-thin">{{ formatNumber(playlist.followers || 0) }}</div>
            <div class="t-small t-transp t-uppercase">Followers</div>
          </div>
        </div>
      </div>

      <!-- Right Column - Playlist Details -->
      <div class="playlist-details-section">
        <!-- Playlist Type Badge -->
        <div class="flex items-center gap-small mn-b-small">
          <span class="badge bg-primary-transp-20 t-primary pd-thin-big radius-small t-small t-uppercase">
            Playlist
          </span>
          <span v-if="playlist.isCollaborative" class="badge bg-secondary-transp-20 t-secondary pd-thin-big radius-small t-small">
            Collaborative
          </span>
          <span v-if="playlist.status === 'published'" class="badge bg-success-transp-20 t-success pd-thin-big radius-small t-small">
            Published
          </span>
        </div>

        <!-- Playlist Title -->
        <h1 class="h1 mn-b-medium">{{ playlist.title }}</h1>

        <!-- Action Buttons -->
        <div class="flex gap-small mn-b-medium">
          <Button
            @click="playPlaylist"
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
            class="flex-1   bg-light radius-thin flex-center gap-thin"
          >
            <IconShuffle class="i-medium" />
            Shuffle
          </Button>

          <Button
            @click="toggleFollow"
            color="primary"
            size="medium"
            class="flex-1  bg-light radius-thin flex-center gap-thin"
          >
            {{isFollowing ? 'Follow' : 'Unfollow'}}
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
                <template v-if="isOwner || isCollaborator">
                  <hr class="mn-v-thin border-dark-transp-10" />
                  <Button @click="editPlaylist" color="transp" size="small" class="w-100 justify-start">
                    Edit Playlist
                  </Button>
                  <Button v-if="isOwner" @click="toggleCollaborative" color="transp" size="small" class="w-100 justify-start">
                    {{ playlist.isCollaborative ? 'Make Private' : 'Make Collaborative' }}
                  </Button>
                  <Button v-if="isOwner" @click="deletePlaylist" color="danger" size="small" class="w-100 justify-start">
                    Delete Playlist
                  </Button>
                </template>
              </div>
            </template>
          </Dropdown>
        </div>

        <!-- Owner/Creator Card -->
        <div class="owner-section mn-b-big">
          <h3 class="t-medium mn-b-small">Created by</h3>
          <div class="owner-card bg-light pd-medium radius-medium flex items-center gap-medium">
            <router-link 
              :to="getOwnerProfileLink(playlist.creator || playlist.owner)"
              class="flex items-center gap-medium flex-1 hover-opacity"
            >
              <div class="owner-avatar">
                <Media 
                  v-if="getOwnerData(playlist)?.photoUrl"
                  :url="getOwnerData(playlist).photoUrl"
                  :alt="getOwnerData(playlist)?.name"
                  class="w-4r h-4r radius-full object-cover"
                />
                <div v-else class="w-4r h-4r radius-full bg-primary flex-center ">
                  {{ getPlaylistOwnerName(playlist).charAt(0) }}
                </div>
              </div>
              <div>
                <div class="flex items-center gap-thin">
                  <span class="t-large ">{{ getPlaylistOwnerName(playlist) }}</span>
                  <IconVerified v-if="getOwnerData(playlist)?.isVerified" class="w-1r h-1r t-primary" />
                </div>
                <span class="t-small t-transp">{{ playlist.creator?.type || 'User' }}</span>
              </div>
            </router-link>
            <Button 
              v-if="!isOwner && authState.user"
              @click="() => toggleFollowUser(getOwnerId(playlist))"
              :color="followedUsers.includes(getOwnerId(playlist)) ? 'primary' : 'transp'"
              size="small"
            >
              {{ followedUsers.includes(getOwnerId(playlist)) ? 'Following' : 'Follow' }}
            </Button>
          </div>
        </div>

        <!-- Collaborators -->
        <div v-if="playlist.collaborators && playlist.collaborators.length > 0" class="collaborators-section mn-b-big">
          <h3 class="t-medium mn-b-small">Collaborators</h3>
          <div class="flex flex-wrap gap-small">
            <div 
              v-for="collaborator in playlist.collaborators"
              :key="collaborator._id || collaborator"
              class="collaborator-chip bg-light pd-thin-big radius-full flex items-center gap-thin"
            >
              <Media 
                v-if="collaborator.photoUrl"
                :url="collaborator.photoUrl"
                class="i-regular radius-full object-cover"
              />
              <span class="t-small">{{ collaborator.name || collaborator.profile?.name || 'User' }}</span>
            </div>
          </div>
        </div>

        <!-- Metadata Cards -->
        <div class="metadata-grid grid cols-2 gap-small mn-b-big">
          <!-- Created Date -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
              <IconCalendar class="i-medium t-primary" />
            <div>
              <div class="t-small t-transp t-uppercase">Created</div>
              <div class="t-medium ">{{ formatDate(playlist.createdAt) }}</div>
            </div>
          </div>

          <!-- Total Duration -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
              <IconClock class="i-medium t-primary" />
            <div>
              <div class="t-small t-transp t-uppercase">Duration</div>
              <div class="t-medium ">{{ totalDuration }}</div>
            </div>
          </div>

          <!-- Updated Date -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
              <IconRefresh class="i-medium t-primary" />
            <div>
              <div class="t-small t-transp t-uppercase">Updated</div>
              <div class="t-medium ">{{ formatDate(playlist.updatedAt) }}</div>
            </div>
          </div>

          <!-- Visibility -->
          <div class="metadata-card bg-light pd-medium radius-medium flex items-center gap-medium">
              <IconEye class="i-medium t-primary" />
            <div>
              <div class="t-small t-transp t-uppercase">Visibility</div>
              <div class="t-medium ">{{ playlist.isPublic ? 'Public' : 'Private' }}</div>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="playlist.tags && playlist.tags.length" class="tags-section mn-b-medium">
          <h3 class="t-medium mn-b-small">Tags</h3>
          <div class="flex gap-thin flex-wrap">
            <span 
              v-for="tag in playlist.tags" 
              :key="tag"
              class="tag bg-light t-transp pd-thin-big radius-small t-small hover-bg-light cursor-pointer"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <div v-if="playlist.description" class="description-section bg-light pd-medium radius-medium mn-b-medium">
          <h3 class="t-medium mn-b-small">About</h3>
          <p class="t-transp">{{ playlist.description }}</p>
        </div>
      </div>
    </div>

    <!-- Playlist Tracks -->
    <section v-if="!isLoading && playlist && playlistTracks.length" class="tracks-section mn-t-big">
      <h2 class="h2 mn-b-medium">Tracklist</h2>
      <Feed
        :store="{
          read: () => Promise.resolve(playlistTracks),
          state: { isLoading: false }
        }"
        :external="true"
        :items="playlistTracks"
        :states="{
          empty: {
            title: 'No tracks in playlist',
            description: 'Add some tracks to get started',
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
              :showAlbum="true"
              :showCover="true"
              :canRemove="isOwner || isCollaborator"
              @remove="() => removeTrack(track._id)"
            />
          </div>
        </template>
      </Feed>
    </section>

    <!-- Empty State -->
    <section v-else-if="!isLoading && playlist && !playlistTracks.length" class="empty-section mn-t-big">
      <div class="empty-tracks t-center pd-big bg-light radius-medium">
        <h3 class=" mn-b-small">This playlist is empty</h3>
        <p class="t-transp t-medium mn-b-medium">Add some tracks to get started</p>
        
        <Button 
          v-if="isOwner || isCollaborator"
          @click="$router.push({ name: 'music-search' })"
          color="primary"
          size="medium"
        >
          Find Tracks
        </Button>
      </div>
    </section>

    <!-- More Playlists -->
    <section v-if="!isLoading && playlist && morePlaylists.length" class="more-playlists-section mn-t-big">
      <div class="flex justify-between items-center mn-b-medium">
        <h2 class="h2">More Playlists</h2>
        <router-link 
          v-if="playlist.creator"
          :to="getOwnerProfileLink(playlist.creator)" 
          class="t-primary hover-opacity"
        >
          See all
        </router-link>
      </div>
      <div class="flex flex-nowrap gap-small o-x-scroll overscroll-behavior-x-contain scroll-behavior-smooth scroll-snap-type-x-mandatory scroll-hide">
        <li v-for="relatedPlaylist in morePlaylists" :key="relatedPlaylist._id" class="flex-none scroll-snap-align-start">
          <PlaylistCard :playlist="relatedPlaylist" class="w-min-15r transition-cubic-in-out" />
        </li>
      </div>
    </section>

    <!-- Edit Playlist Modal -->
    <Popup 
      :isPopupOpen="showEditModal && (isOwner || isCollaborator)"
      @close-popup="showEditModal = false" 
      class="bg-white pd-medium w-m-30r radius-medium"
    >
      <PlaylistForm 
        :editMode="true"
        :url="playlist.url"
        @cancel="showEditModal = false"
        @updated="handlePlaylistUpdated"
      />
    </Popup>

    <!-- Delete Confirmation Modal -->
    <Popup 
      :isPopupOpen="showDeleteModal"
      @close-popup="showDeleteModal = false" 
      class="bg-white pd-medium w-m-25r radius-medium"
    >
      <h3 class="mn-b-medium">Delete Playlist</h3>
      <p class="t-transp mn-b-medium">Are you sure you want to delete "{{ playlist.title }}"? This action cannot be undone.</p>
      
      <div class="flex justify-end gap-small">
        <Button 
          @click="showDeleteModal = false"
          color="transp"
          size="medium"
        >
          Cancel
        </Button>
        
        <Button 
          @click="confirmDelete"
          color="danger"
          size="medium"
        >
          Delete Playlist
        </Button>
      </div>
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
import Feed from '@martyrs/src/components/Feed/Feed.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';

// Icons
import IconPlay from '@martyrs/src/modules/icons/navigation/IconPlay.vue';
import IconLike from '@martyrs/src/modules/icons/navigation/IconLike.vue';
import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue';
import IconShuffle from '@martyrs/src/modules/icons/navigation/IconShuffle.vue';
import IconCalendar from '@martyrs/src/modules/icons/entities/IconCalendar.vue';
import IconClock from '@martyrs/src/modules/icons/entities/IconTime.vue';
import IconEye from '@martyrs/src/modules/icons/actions/IconShow.vue';
import IconRefresh from '@martyrs/src/modules/icons/navigation/IconRefresh.vue';
import IconVerified from '@martyrs/src/modules/icons/navigation/IconCheckmark.vue';

// Components
import TrackListCard from '../cards/TrackListCard.vue';
import PlaylistCard from '../cards/PlaylistCard.vue';
import PlaylistForm from '../forms/PlaylistForm.vue';

// Store
import { state as playlistsState, actions as playlistsActions } from '../../store/playlists.js';
import { state as tracksState, actions as tracksActions } from '../../store/tracks.js';
import { actions as playerActions } from '../../store/player.js';
import { state as authState } from '@martyrs/src/modules/auth/views/store/auth.js';
import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';

const route = useRoute();
const router = useRouter();

// Emits
const emits = defineEmits(['page-loading', 'page-loaded']);

// State
const hasLoaded = ref(false);
const isFollowing = ref(false);
const showDropdown = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const followedUsers = ref([]);
const morePlaylists = ref([]);

// Clear state
playlistsState.currentPlaylist = null;
playlistsState.currentPlaylistTracks = [];

// Computed
const playlist = computed(() => playlistsState.currentPlaylist);
const playlistTracks = computed(() => playlistsState.currentPlaylistTracks || []);

const isOwner = computed(() => {
  if (!playlist.value || !authState.user) return false;
  
  const ownerId = playlist.value.owner?.target?._id || playlist.value.owner?.target;
  return ownerId === authState.user._id;
});

const isCollaborator = computed(() => {
  if (!playlist.value || !authState.user) return false;
  
  return playlist.value.collaborators?.some(collab => 
    (collab._id || collab) === authState.user._id
  );
});

const totalDuration = computed(() => {
  if (!playlistTracks.value.length) return '0:00';
  const totalSeconds = playlistTracks.value.reduce((sum, track) => sum + (track.duration || 0), 0);
  return formatDuration(totalSeconds);
});

// Helper functions
const getOwnerData = (playlist) => {
  if (!playlist) return null;
  const owner = playlist.creator?.target || playlist.owner?.target;
  return typeof owner === 'object' ? owner : null;
};

const getOwnerId = (playlist) => {
  if (!playlist) return null;
  const owner = playlist.creator?.target || playlist.owner?.target;
  return typeof owner === 'object' ? owner._id : owner;
};

const getPlaylistOwnerName = (playlist) => {
  if (!playlist) return 'Unknown';
  
  const owner = getOwnerData(playlist);
  if (owner) {
    return owner.profile?.name || owner.name || 'Unknown';
  }
  
  return 'Unknown';
};

const getOwnerProfileLink = (owner) => {
  if (!owner || !owner.target) return { name: 'music-home' };
  
  const targetId = typeof owner.target === 'object' ? owner.target._id : owner.target;
  
 if (owner.type === 'user' || owner.type === 'User') {
    return { name: 'User Profile', params: { _id: targetId } };
  } else if (owner.type === 'organization' || owner.type === 'Organization') {
    return { name: 'Organizatio', params: { _id: targetId } };
  }
  
  return { name: 'music-home' };
};

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
const playPlaylist = () => {
  if (playlistTracks.value && playlistTracks.value.length > 0) {
    playerActions.setQueue(playlistTracks.value);
  }
};

const shufflePlay = () => {
  if (playlistTracks.value && playlistTracks.value.length > 0) {
    const shuffled = [...playlistTracks.value].sort(() => Math.random() - 0.5);
    playerActions.setQueue(shuffled);
  }
};

const toggleFollow = async () => {
  isFollowing.value = !isFollowing.value;
  // TODO: Implement actual following
  try {
    if (isFollowing.value) {
      await playlistsActions.followPlaylist(playlist.value._id);
    } else {
      await playlistsActions.unfollowPlaylist(playlist.value._id);
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    isFollowing.value = !isFollowing.value; // Revert on error
  }
};

const toggleFollowUser = (userId) => {
  const index = followedUsers.value.indexOf(userId);
  if (index > -1) {
    followedUsers.value.splice(index, 1);
  } else {
    followedUsers.value.push(userId);
  }
  // TODO: Implement actual following
};

const addToQueue = () => {
  if (playlistTracks.value && playlistTracks.value.length > 0) {
    playlistTracks.value.forEach(track => {
      playerActions.addToQueue(track);
    });
    showDropdown.value = false;
  }
};

const editPlaylist = () => {
  showEditModal.value = true;
  showDropdown.value = false;
};

const toggleCollaborative = async () => {
  try {
    const updatedData = {
      _id: playlist.value._id,
      isCollaborative: !playlist.value.isCollaborative
    };
    
    await playlistsActions.updatePlaylist(updatedData);
    showDropdown.value = false;
  } catch (error) {
    console.error('Error updating playlist:', error);
  }
};

const deletePlaylist = () => {
  showDeleteModal.value = true;
  showDropdown.value = false;
};

const confirmDelete = async () => {
  try {
    await playlistsActions.deletePlaylist(playlist.value._id);
    router.push({ name: 'music-library' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    globals.actions.setError({
      message: 'Failed to delete playlist'
    });
  }
};

const removeTrack = async (trackId) => {
  try {
    await playlistsActions.removeTrackFromPlaylist(playlist.value._id, trackId);
    // Refresh playlist data
    await fetchPlaylistData();
  } catch (error) {
    console.error('Error removing track:', error);
    globals.actions.setError({
      message: 'Failed to remove track'
    });
  }
};

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href);
  showDropdown.value = false;
};

const handlePlaylistUpdated = () => {
  showEditModal.value = false;
  fetchPlaylistData();
};

// Data fetching
const fetchPlaylistData = async () => {
  try {
    await playlistsActions.fetchPlaylistByUrl(route.params.url);
    
    // Check if following
    if (authState.user && playlist.value) {
      // TODO: Check if user is following this playlist
    }
    
    // Fetch more playlists from the same creator
    if (playlist.value?.creator?.target) {
      const creatorId = typeof playlist.value.creator.target === 'object' 
        ? playlist.value.creator.target._id 
        : playlist.value.creator.target;
        
      const playlists = await playlistsActions.fetchPlaylists({
        'creator.target': creatorId,
        isPublic: true,
        limit: 6
      });
      
      // Filter out current playlist
      morePlaylists.value = playlists.filter(p => p._id !== playlist.value._id).slice(0, 5);
    }
  } catch (error) {
    console.error('Error fetching playlist data:', error);
  }
};

// Lifecycle
onMounted(async () => {
  emits('page-loading');
  
  await fetchPlaylistData();
  
  hasLoaded.value = true;
  emits('page-loaded');
});
</script>