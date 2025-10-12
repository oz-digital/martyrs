<template>
  <div class="profile-card bg-light radius-small pd-small mn-small mn-b-zero">
    <div class="flex flex-v-center gap-small">
      <img
        loading="lazy"
        v-if="store.users?.state?.current?.profile?.photo && store.users.state.current.profile.photo.length > 0"
        :src="(FILE_SERVER_URL || '') + store.users.state.current.profile.photo"
        class="avatar radius-100 bg-white object-fit-cover i-semi"
      />

      <PlaceholderUserpic
        v-else
        class="avatar radius-100 i-semi"
      />

      <div class="profile-info flex-child-default">
        <div class="profile-name mn-b-micro t-medium">{{ store.users?.state?.current?.profile?.name || 'Anonymous' }}</div>
        <div class="lex-nowrap flex gap-micro">
          <div
            v-for="(role, index) in store.users?.state?.current?.roles"
            :key="index"
            class="pd-thin radius-small t-small t-semi bg-white"
          >
            {{ role.icon }}
            {{ role.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import PlaceholderUserpic from '@martyrs/src/modules/icons/placeholders/PlaceholderUserpic.vue';

const store = inject('store');
</script>

<style scoped>
</style>
