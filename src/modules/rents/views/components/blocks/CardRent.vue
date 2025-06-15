<template>
  <div class="order-card">
    <div class="order-status flex-v-center flex-nojustify flex">
      <span>{{ rent.status }}</span>
      <span class="mn-l-auto">{{ totalDays }} days</span>
    </div>
    <div class="pd-small">
      <p><strong>Start:</strong> {{ formatDate(rent.startDate) }}</p>
      <p><strong>End:</strong> {{ formatDate(rent.endDate) }}</p>
      <p v-if="rent.comment"><strong>Comment:</strong> {{ rent.comment }}</p>
      <button 
        @click="$router.push({ name: 'Edit Rent', params: { _id: rent._id } })"
        class="bg-main t-white button mn-t-small"
      >
        Edit
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  rent: { type: Object, required: true },
});

const totalDays = computed(() => {
  const start = new Date(props.rent.startDate);
  const end = new Date(props.rent.endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});



function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
</script>

<style lang="scss">
.order-card {
  border-radius: 0.25rem;
  overflow: hidden;
  box-shadow: 0 8px 8px -8px rgb(36 36 36 / 10%);
  .order-status {
    color: black;
    background: #EEF2F6;
    width: 100%;
    padding: 0.75rem 1.5rem;
    margin: 0;
  }
}
</style>