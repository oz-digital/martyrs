<!-- components/cards/ArtistCard.vue -->
<template>
  <div class="artist-card bg-light pd-medium radius-medium flex flex-center gap-big">
    <router-link 
      :to="artist.url ? { name: 'artist', params: { url: artist.url } } : artist.to"
      class="flex flex-v-center gap-thin flex-1 hover-opacity"
    >
      <div class="artist-avatar">
        <Media 
          v-if="artist.photoUrl"
          :url="artist.photoUrl"
          :alt="artist.name"
          class="w-4r h-4r radius-full object-fit-cover"
        />
        <div v-else class="w-4r h-4r flex flex center radius-extra radius-full bg-main flex-center">
          {{ artist.name.charAt(0) }}
        </div>
      </div>

      <div>
        <div class="flex items-center gap-thin">
          <span class="mn-b-thin">{{ artist.name }}</span>
          <IconVerified v-if="artist.isVerified" class="w-1r h-1r t-primary" />
        </div>
        <span class="t-small t-transp">{{ artistType }}</span>
      </div>
    </router-link>

    <Button 
      v-if="showFollowButton"
      @click="handleFollowClick"
      :color="isFollowing ? 'primary' : 'transp'"
      size="small"
      class="bg-main"
    >
      {{ isFollowing ? 'Following' : 'Follow' }}
    </Button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Media from '@martyrs/src/components/Media/Media.vue';
import IconVerified from '@martyrs/src/modules/icons/navigation/IconCheckmark.vue';

const props = defineProps({
  artist: {
    type: Object,
    required: true,
    validator: (value) => {
      return value._id && value.name && value.url;
    }
  },
  isFollowing: {
    type: Boolean,
    default: false
  },
  showFollowButton: {
    type: Boolean,
    default: true
  },
  artistType: {
    type: String,
    default: 'Artist'
  }
});

const emit = defineEmits(['toggle-follow']);

const handleFollowClick = () => {
  emit('toggle-follow', props.artist._id);
};
</script>

<style scoped>
.artist-card {
  transition: all 0.2s ease;
}

.artist-card:hover {
  transform: translateY(-5px);
}

.artist-avatar img {
  transition: transform 0.2s ease;
}

.artist-card:hover .artist-avatar img {
  transform: scale(1.05);
}
</style>