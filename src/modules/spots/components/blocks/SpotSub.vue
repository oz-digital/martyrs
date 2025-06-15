<template>
  <div class="pd-small flex-nowrap flex">
    <!-- <img loading="lazy" :src="(FILE_SERVER_URL || '') + avatar" :alt="`${name} avatar`" class="user-card__avatar" /> -->
    <div class="user-card__info">
      <p class="user-card__name">{{ department.name ? department.name : 'Безымянный' }}</p>
      <p class="user-card__position">{{ department.members ? department.members.length : '0' }} человек</p>
      <!-- Render other properties here -->
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    department: {
      type: Object,
      required: true
    },
    // Define other props here
  });
</script>

<style scoped>
  /* Add styles for the user card component here */
</style>