<template>
  <section class="mn-b-big radius-medium pd-big bg-white">
    <h3 class="mn-b-regular">{{ title }}</h3>
    <p class="mn-b-small t-transp p-medium">{{ description }}</p>

    <button @click="callback" class="t-white bg-second w-100 button">
      {{ action }}
    </button>
  </section>
</template>

<script setup>

const props = defineProps({
  title: {
    type: String,
    default: 'У вас еще нет организации',
  },
  description: {
    type: String,
    default: 'Для использования сервиса, вам необходимо добавить вашу организацию.',
  },
  action: {
    type: String,
    default: 'Создать организацию',
  },
  callback: {
    type: Function,
    default: () => {},
  },
})


</script>