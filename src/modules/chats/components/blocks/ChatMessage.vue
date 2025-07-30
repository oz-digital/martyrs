<template>
  <div 
    class="pd-small"
    :class="{'bg-main-nano': message.username === 'Support'}"
    :data-message-id="message._id"
  >
    <p class="flex-v-center gap-thin flex-nowrap flex w-100 p-small">
      <!-- <img loading="lazy" v-if="message.username === 'Weeder Support'" src="/logo/logo.png" class="i-medium"> -->
      <strong class="mn-r-auto"><span class="t-semi">{{ message.username }}</span> <span class="t-transp">{{formatDate(message.createdAt)}}</span></strong>
      <IconCheckmark v-if="isMessageRead" class="i-small t-main" />
    </p>
    <p>{{ message.text }}</p>
  </div>
</template>

<script>
import IconCheckmark from '@martyrs/src/modules/icons/navigation/IconCheckmark.vue';

export default {
  components: {
    IconCheckmark
  },
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  computed: {
    isMessageRead() {
      return this.message.readBy && this.message.readBy.length > 0;
    }
  }
};
</script>

<style>
</style>
