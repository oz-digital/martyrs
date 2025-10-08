<template>
  <section>
    <h5 class="mn-b-small">{{ title }}</h5>
    <p class="t-transp p-regular">{{ description }}</p>

    <button v-if="action" @click="callback" class="mn-t-small t-white bg-second w-100 button">
      {{ action }}
    </button>
  </section>
</template>

<script setup>

const props = defineProps({
  title: {
    type: String,
    default: 'Sorry, nothing found.',
  },
  description: {
    type: String,
    default: 'No items to display. Try changing your search criteria.',
  },
  action: {
    type: String,
  },
  callback: {
    type: Function,
    default: () => {},
  },
})


</script>