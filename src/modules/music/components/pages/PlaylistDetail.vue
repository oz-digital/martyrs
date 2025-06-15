<!-- components/pages/PlaylistDetail.vue -->
<template>
  <div class="playlist-detail-page">
    <div v-if="isLoading" class="w-100 h-25r flex-center flex">
      <Loader />
    </div>
    
    <div v-else-if="!playlist" class="t-center pd-big">
      <h2 class="t-white">Playlist not found</h2>
      <p class="t-grey t-medium">The playlist you're looking for doesn't exist or has been removed.</p>
    </div>
    
    <div v-else>
      <!-- Playlist Header -->
      <div class="playlist-header mn-b-medium flex flex-v-center gap-medium">
        <div class="playlist-cover">
          <Media 
            :url="playlist.coverUrl || '/assets/placeholder-playlist.jpg'" 
            class="w-15r h-15r object-fit-cover shadow-lg radius-small"
          />
        </div>
        
        <div class="playlist-info">
          <div class="t-small t-uppercase t-white">Playlist</div>
          <h1 class="t-white">{{ playlist.title }}</h1>
          
          <div v-if="playlist.description" class="playlist-description t-grey mn-t-thin mn-b-small">
            {{ playlist.description }}
          </div>
          
          <div class="playlist-meta flex flex-v-center">
            <router-link 
              v-if="playlist.owner && playlist.owner.target"
              :to="getOwnerProfileLink(playlist.owner)"
              class="t-white t-medium hover-t-main"
            >
              {{ getPlaylistOwnerName(playlist) }}
            </router-link>
            <span v-else class="t-white t-medium">{{ getPlaylistOwnerName(playlist) }}</span>
            
            <span class="t-grey mn-l-small mn-r-small">•</span>
            
            <span class="t-grey">{{ playlistTracks.length }} {{ playlistTracks.length === 1 ? 'song' : 'songs' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Playlist Actions -->
      <div class="playlist-actions mn-b-medium flex flex-v-center gap-small">
        <Button 
          @click="playPlaylist"
          class="play-button bg-main radius-round pd-small flex-v-center flex gap-small hover-scale-1"
          :showLoader="false" 
          :showSucces="false"
        >
          <IconPlay class="i-small" fill="rgb(var(--black))"/>
          <span class="t-black t-medium">Play</span>
        </Button>
        
        <Button 
          @click="toggleFavorite"
          class="bg-transparent border-none pd-zero"
          :showLoader="false" 
          :showSucces="false"
        >
          <IconHeart class="i-medium" :fill="isFavorite ? 'rgb(var(--main))' : 'rgb(var(--white))'"/>
        </Button>
        
        <Dropdown class="pos-relative">
          <Button 
            @click="showDropdown = !showDropdown"
            class="bg-transparent border-none pd-zero"
            :showLoader="false" 
            :showSucces="false"
          >
            <IconEllipsis class="i-medium" fill="rgb(var(--white))"/>
          </Button>
          
          <template #content>
            <ul v-if="showDropdown" class="pd-small bg-dark radius-small pos-absolute pos-t-100 pos-r-0 z-index-3 w-max-15r mn-t-thin">
              <li v-if="isOwner" class="mn-b-thin">
                <Button 
                  @click="editPlaylist"
                  class="bg-transparent border-none pd-thin t-white w-100 t-left hover-bg-dark radius-small"
                  :showLoader="false" 
                  :showSucces="false"
                >
                  <span>Edit Details</span>
                </Button>
              </li>
              <li class="mn-b-thin">
                <Button 
                  @click="addToQueue"
                  class="bg-transparent border-none pd-thin t-white w-100 t-left hover-bg-dark radius-small"
                  :showLoader="false" 
                  :showSucces="false"
                >
                  <span>Add to Queue</span>
                </Button>
              </li>
              <li v-if="isOwner" class="mn-b-thin">
                <Button 
                  @click="toggleCollaborative"
                  class="bg-transparent border-none pd-thin t-white w-100 t-left hover-bg-dark radius-small"
                  :showLoader="false" 
                  :showSucces="false"
                >
                  <span>{{ playlist.isCollaborative ? 'Make Private' : 'Make Collaborative' }}</span>
                </Button>
              </li>
              <li v-if="isOwner" class="mn-b-thin">
                <Button 
                  @click="deletePlaylist"
                  class="bg-transparent border-none pd-thin t-fourth w-100 t-left hover-bg-dark radius-small"
                  :showLoader="false" 
                  :showSucces="false"
                >
                  <span>Delete</span>
                </Button>
              </li>
              <li>
                <Button 
                  @click="copyLink"
                  class="bg-transparent border-none pd-thin t-white w-100 t-left hover-bg-dark radius-small"
                  :showLoader="false" 
                  :showSucces="false"
                >
                  <span>Copy Link</span>
                </Button>
              </li>
            </ul>
          </template>
        </Dropdown>
      </div>
      
      <!-- Playlist Tracks -->
      <div class="playlist-tracks">
        <div v-if="playlistTracks.length === 0" class="empty-tracks t-center pd-big bg-dark-transp-10 radius-medium">
          <h3 class="t-white mn-b-small">This playlist is empty</h3>
          <p class="t-grey t-medium">Add some tracks to get started</p>
          
          <Button 
            v-if="isOwner || isCollaborator"
            @click="$router.push({ name: 'music-search' })"
            class="bg-main t-white radius-small pd-small mn-t-medium hover-scale-1"
            :showLoader="false" 
            :showSucces="false"
          >
            Find Tracks
          </Button>
        </div>
        
        <TrackList 
          v-else
          :tracks="playlistTracks"
          :showAlbum="true" 
          :showCover="true"
          class="bg-dark-transp-10 radius-medium o-hidden"
        />
      </div>
      
      <!-- Edit Playlist Modal -->
      <Popup 
        v-if="showEditModal && isOwner" 
        @close-popup="showEditModal = false" 
        class="bg-dark pd-small w-m-25r radius-medium t-white"
      >
        <h3 class="mn-b-medium">Edit Playlist</h3>
        
        <form @submit.prevent="updatePlaylist">
          <div class="form-group mn-b-medium">
            <label for="title" class="t-white t-medium mn-b-thin d-block">Playlist Name</label>
            <Field 
              v-model:field="editForm.title"
              id="title"
              type="text"
              placeholder="Playlist Name"
              :validation="validationErrors.title"
              class="w-100 pd-small bg-dark-transp-25 radius-small t-white"
            />
          </div>
          
          <div class="form-group mn-b-medium">
            <label for="description" class="t-white t-medium mn-b-thin d-block">Description</label>
            <Field 
              v-model:field="editForm.description"
              id="description"
              type="textarea"
              placeholder="Add an optional description"
              class="w-100 pd-small bg-dark-transp-25 radius-small t-white"
            />
          </div>
          
          <div class="form-group mn-b-medium">
            <label class="t-white t-medium mn-b-thin d-block">Privacy</label>
            <div class="flex gap-small">
              <Radio 
                v-model:radio="editForm.isPublic"
                :value="true"
                name="privacy"
                label="Public"
                class="t-white"
              />
              <Radio 
                v-model:radio="editForm.isPublic"
                :value="false"
                name="privacy"
                label="Private"
                class="t-white"
              />
            </div>
          </div>
          
          <div class="form-group mn-b-medium">
            <label class="t-white t-medium mn-b-thin d-block">Cover Image</label>
            <div class="playlist-cover-upload flex gap-medium">
              <div class="playlist-cover-preview bg-dark-transp-25 radius-small o-hidden">
                <Media 
                  v-if="editForm.coverUrl"
                  :url="editForm.coverUrl"
                  class="w-10r h-10r object-fit-cover"
                />
                <div v-else class="w-10r h-10r flex-center flex">
                  <IconMusic class="i-big" fill="rgb(var(--grey))"/>
                </div>
              </div>
              
              <UploadImage
                v-model:photo="editForm.coverUrl"
                uploadPath="playlists"
                class="flex-1 h-10r bg-dark-transp-25 radius-small"
              />
            </div>
          </div>
          
          <div class="form-actions t-right">
            <Button 
              @click="showEditModal = false"
              type="button"
              class="bg-dark-transp-25 t-white pd-small radius-small mn-r-small hover-bg-dark"
              :showLoader="false" 
              :showSucces="false"
            >
              Cancel
            </Button>
            
            <Button 
              type="submit"
              class="bg-main t-white pd-small radius-small hover-scale-1"
              :submit="updatePlaylist"
              :showLoader="true" 
              :showSucces="true"
              :validation="!!Object.keys(validationErrors).length"
            >
              Save
            </Button>
          </div>
        </form>
      </Popup>
      
      <!-- Delete Confirmation Modal -->
      <Popup 
        v-if="showDeleteModal" 
        @close-popup="showDeleteModal = false" 
        class="bg-dark pd-small w-m-25r radius-medium t-white"
      >
        <h3 class="mn-b-medium">Delete Playlist</h3>
        <p class="t-grey mn-b-medium">Are you sure you want to delete this playlist? This action cannot be undone.</p>
        
        <div class="t-right">
          <Button 
            @click="showDeleteModal = false"
            class="bg-dark-transp-25 t-white pd-small radius-small mn-r-small hover-bg-dark"
            :showLoader="false" 
            :showSucces="false"
          >
            Cancel
          </Button>
          
          <Button 
            @click="confirmDelete"
            class="bg-fourth t-white pd-small radius-small hover-scale-1"
            :showLoader="true" 
            :showSucces="true"
          >
            Delete
          </Button>
        </div>
      </Popup>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TrackList from '../lists/TrackList.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Loader from '@martyrs/src/components/Loader/Loader.vue';
import Media from '@martyrs/src/components/Media/Media.vue';
import Dropdown from '@martyrs/src/components/Dropdown/Dropdown.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import Field from '@martyrs/src/components/Field/Field.vue';
import Radio from '@martyrs/src/components/Radio/Radio.vue';
import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';

// Import icons
import IconPlay from '@martyrs/src/modules/icons/navigation/IconPlay.vue';
import IconHeart from '@martyrs/src/modules/icons/navigation/IconHeart.vue';
import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue';
import IconMusic from '@martyrs/src/modules/icons/entities/IconMusic.vue';

// Import store modules
import { state as authState } from '@martyrs/src/modules/auth/views/store/auth.js';
import { state as playlistsState, actions as playlistsActions } from '../../store/playlists.js';
import { actions as playerActions } from '../../store/player.js';

const route = useRoute();
const router = useRouter();

// State
const isLoading = ref(true);
const isFavorite = ref(false);
const showDropdown = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);

// Validation
const validationErrors = reactive({});

// Edit form
const editForm = reactive({
  title: '',
  description: '',
  isPublic: true,
  coverUrl: ''
});

// Computed properties
const playlist = computed(() => playlistsState.currentPlaylist);
const playlistTracks = computed(() => playlistsState.currentPlaylistTracks);

const isOwner = computed(() => {
  if (!playlist.value || !authState.user) return false;
  
  return (
    playlist.value.owner?.target?._id === authState.user._id ||
    playlist.value.owner?.target === authState.user._id
  );
});

const isCollaborator = computed(() => {
  if (!playlist.value || !authState.user) return false;
  
  return playlist.value.collaborators?.some(collab => 
    collab._id === authState.user._id || collab === authState.user._id
  );
});

// Methods
const getPlaylistOwnerName = (playlist) => {
  if (!playlist || !playlist.owner) return 'Unknown';
  
  const owner = playlist.owner.target;
  if (typeof owner === 'object') {
    if (owner.profile?.name) {
      return owner.profile.name;
    }
    return owner.name || 'Unknown';
  }
  
  return 'Unknown';
};

const getOwnerProfileLink = (owner) => {
  if (!owner || !owner.target) return { name: 'music-home' };
  
  if (owner.type === 'User') {
    return { name: 'user-profile', params: { _id: owner.target._id || owner.target } };
  } else if (owner.type === 'Organization') {
    return { name: 'organization-profile', params: { _id: owner.target._id || owner.target } };
  }
  
  return { name: 'music-home' };
};

const playPlaylist = () => {
  if (playlistTracks.value && playlistTracks.value.length > 0) {
    playerActions.setQueue(playlistTracks.value);
  }
};

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
  // Implement favorite playlist logic here
};

const addToQueue = () => {
  if (playlistTracks.value && playlistTracks.value.length > 0) {
    // Add all tracks to queue
    playlistTracks.value.forEach(track => {
      playerActions.addToQueue(track);
    });
    
    showDropdown.value = false;
  }
};

const editPlaylist = () => {
  // Populate edit form with current playlist data
  editForm.title = playlist.value.title;
  editForm.description = playlist.value.description || '';
  editForm.isPublic = playlist.value.isPublic;
  editForm.coverUrl = playlist.value.coverUrl || '';
  
  showEditModal.value = true;
  showDropdown.value = false;
};

const updatePlaylist = async () => {
  // Validate form
  validationErrors.title = !editForm.title ? { message: 'Playlist name is required' } : null;
  
  // If there are validation errors, don't submit
  if (Object.values(validationErrors).some(error => error !== null)) {
    return;
  }
  
  try {
    // Update playlist
    const updatedData = {
      _id: playlist.value._id,
      title: editForm.title,
      description: editForm.description,
      isPublic: editForm.isPublic,
      coverUrl: editForm.coverUrl
    };
    
    await playlistsActions.updatePlaylist(updatedData);
    showEditModal.value = false;
  } catch (error) {
    console.error('Error updating playlist:', error);
  }
};

const toggleCollaborative = async () => {
  try {
    // Toggle collaborative status
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
  }
};

const copyLink = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    // Could show a success notification here
    showDropdown.value = false;
  });
};

const fetchPlaylistData = async () => {
  isLoading.value = true;
  
  try {
    // Fetch playlist data
    await playlistsActions.fetchPlaylistByUrl(route.params.url);
  } catch (error) {
    console.error('Error fetching playlist data:', error);
  } finally {
    isLoading.value = false;
  }
};

// Fetch data when component mounts or URL changes
onMounted(fetchPlaylistData);

watch(() => route.params.url, (newUrl) => {
  if (newUrl) {
    fetchPlaylistData();
  }
});
</script>