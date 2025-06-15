<template>
  <div 
    class="pd-small"
    :class="{'bg-main-nano': message.username === 'Support'}"
  >
    <p class="flex-v-center gap-thin flex-nowrap flex w-100 p-small">
      <!-- <img loading="lazy" v-if="message.username === 'Weeder Support'" src="/logo/logo.png" class="i-medium"> -->
      <strong class="mn-r-auto"><span class="t-semi">{{ message.username }}</span> <span class="t-transp">{{formatDate(message.createdAt)}}</span></strong>
    </p>
    <p>{{ message.text }}</p>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: Object,
      required: true
    }
  }
};
</script>

<style>
</style>
