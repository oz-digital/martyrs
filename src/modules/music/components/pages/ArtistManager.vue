<template>
  <div class="pd-medium">
    <div class="flex flex-justify-between flex-v-center mn-b-medium">
      <h2 class="h2">Manage Artists</h2>
      <Button
        :submit="() => router.push({ name: 'artist-create' })"
        class="bg-main "
        :showSucces="false"
        :showLoader="false"
      >
        Create Artist
      </Button>
    </div>
    
    <div class="mn-b-medium">
      <Field
        v-model:field="search"
        placeholder="Search artists..."
        class="w-m-40r"
        @update:field="handleSearch"
      >
        <IconSearch class="i-medium mn-r-small" />
      </Field>
    </div>
    
    <!-- Loading state -->
    <div v-if="isLoading" class="flex-center flex mn-medium">
      <Loader />
    </div>
    
    <!-- Empty state -->
    <div v-else-if="userArtists.length === 0" class="bg-light pd-medium radius-medium t-center">
      <p class="mn-b-small p-medium">You haven't created any artists yet</p>
      <p class="p-small t-transp mn-b-medium">Start by creating your first artist profile</p>
      <Button
        :submit="() => router.push({ name: 'artist-create' })"
        class="bg-main "
        :showSucces="false"
        :showLoader="false"
      >
        Create Artist
      </Button>
    </div>
    
    <!-- Artist list -->
    <div v-else class="cols-1 gap-small">
      <div
        v-for="artist in userArtists"
        :key="artist._id"
        class="bg-light pd-medium radius-medium flex-v-center flex flex-justify-between hover-bg-light mobile:flex-column"
      >
        <div class="flex-v-center flex mobile:w-100 mobile:mn-b-small">
          <div class="w-4r h-4r radius-medium o-hidden mn-r-medium mobile:mn-r-small">
            <img
              v-if="artist.photoUrl"
              :src="FILE_SERVER_URL + artist.photoUrl"
              alt="Artist photo"
              class="w-100 h-100 object-fit-cover"
            />
            <div v-else class="w-100 h-100 bg-second-nano flex-center flex">
              <span>{{ artist.name }}</span>
            </div>
          </div>
          
          <div>
            <h3 class="h5 mn-b-thin">{{ artist.name }}</h3>
            <p class="p-small t-transp">
              {{getStatusLabel(artist.status)}}
              <span v-if="artist.isVerified" class="bg-second-nano pd-micro radius-small">
                Verified
              </span>
            </p>
          </div>
        </div>
        
        <div class="flex flex-nowrap gap-small mobile:w-100 mobile:flex-justify-between">
          <Button
            :submit="() => viewArtist(artist)"
            class="bg-grey-nano t-black"
            :showSucces="false"
            :showLoader="false"
          >
            View
          </Button>
          
          <Button
            :submit="() => editArtist(artist)"
            class="bg-main "
            :showSucces="false"
            :showLoader="false"
          >
            Edit
          </Button>
          
          <Button
            :submit="() => confirmDelete(artist)"
            class="bg-fourth "
            :showSucces="false"
            :showLoader="false"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Confirmation popup -->
    <Popup
      :isPopupOpen="showDeleteConfirm"
      @close-popup="showDeleteConfirm = false"
      class="bg-white pd-medium radius-medium w-m-33r"
    >
      <h3 class="h3 mn-b-medium">Delete Artist</h3>
      <p class="p-medium mn-b-medium">
        Are you sure you want to delete <b>{{ selectedArtist?.name }}</b>?
      </p>
      <p class="p-small t-transp mn-b-medium">
        This action cannot be undone and will remove all artist data.
      </p>
      
      <div class="flex flex-justify-between">
        <Button
          :submit="() => showDeleteConfirm = false"
          class="bg-grey-nano t-black"
          :showSucces="false"
          :showLoader="false"
        >
          Cancel
        </Button>
        
        <Button
          :submit="deleteArtist"
          class="bg-fourth "
        >
          Confirm Delete
        </Button>
      </div>
    </Popup>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

// Import Martyrs components
import Field from '@martyrs/src/components/Field/Field.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Loader from '@martyrs/src/components/Loader/Loader.vue';
import Status from '@martyrs/src/components/Status/Status.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import IconSearch from '@martyrs/src/modules/icons/navigation/IconSearch.vue';

// Import store
import * as artistsStore from '../../store/artists';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';

// Router
const router = useRouter();

// State
const search = ref('');
const isLoading = ref(false);
const showDeleteConfirm = ref(false);
const selectedArtist = ref(null);

// Computed
const userArtists = computed(() => {
  return artistsStore.state.userArtists;
});

// Methods
const loadUserArtists = async () => {
  isLoading.value = true;
  try {
    await artistsStore.actions.fetchUserArtists(auth.state.user._id);
  } catch (error) {
    console.error('Error loading artists:', error);
    globals.actions.setError({
      message: 'Failed to load your artists'
    });
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = async (value) => {
  if (!value.trim()) {
    // If search is empty, load all user artists
    await loadUserArtists();
    return;
  }
  
  isLoading.value = true;
  try {
    // Search only within user's artists
    const options = {
      creator: auth.state.user._id,
      search: value
    };
    await artistsStore.actions.fetchArtists(options);
    // Update userArtists (assuming the store is correctly updating userArtists)
  } catch (error) {
    console.error('Error searching artists:', error);
  } finally {
    isLoading.value = false;
  }
};

const viewArtist = (artist) => {
  router.push({
    name: 'artist-detail',
    params: { url: artist.url }
  });
};

const editArtist = (artist) => {
  router.push({
    name: 'artist-edit',
    params: { url: artist.url }
  });
};

const confirmDelete = (artist) => {
  selectedArtist.value = artist;
  showDeleteConfirm.value = true;
};

const deleteArtist = async () => {
  if (!selectedArtist.value) return;
  
  try {
    await artistsStore.actions.deleteArtist(selectedArtist.value._id);
    showDeleteConfirm.value = false;
    selectedArtist.value = null;
    
    // Show success message
    globals.actions.setError({
      message: 'Artist deleted successfully',
      status: 'success'
    });
  } catch (error) {
    console.error('Error deleting artist:', error);
    globals.actions.setError({
      message: 'Failed to delete artist'
    });
  }
};

const getStatusLabel = (status) => {
  const statusMap = {
    'draft': {
      text: 'Draft',
      color: '#888888'
    },
    'published': {
      text: 'Published',
      color: '#10FA7D' // main color
    },
    'archived': {
      text: 'Archived',
      color: '#FF0A54' // fourth color
    }
  };
  
  return statusMap[status] || {
    text: status,
    color: '#888888'
  };
};

// Lifecycle hooks
onMounted(async () => {
  await loadUserArtists();
});
</script>