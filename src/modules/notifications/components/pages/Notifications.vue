<template>
  <div class="notifications-page pd-small">
    <Tab
      v-model:selected="activeTab"
      :tabs="[
        { label: `All Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`, value: 'all' },
        { label: 'Notification Settings', value: 'preferences' }
      ]"
      class="flex-child-default gap-micro scroll-hide bg-light radius-medium h-max pd-thin mn-b-thin o-x-scroll"
      classTab="bg-white"
    />
    
    <div class="tab-content">
      <notifications-list v-if="activeTab === 'all'" />
      <notification-preferences v-else-if="activeTab === 'preferences'" />
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useRoute } from 'vue-router';
import Tab from "@martyrs/src/components/Tab/Tab.vue";
import NotificationsList from '../sections/NotificationsList.vue';
import NotificationPreferences from '../sections/NotificationPreferences.vue';

// Get route and notification state
const route = useRoute();
const { unreadCount } = inject('useNotifications')();

// Set initial active tab based on route query param or default to 'all'
const activeTab = ref(route.query.tab || 'all');
</script>

<style scoped>
</style>