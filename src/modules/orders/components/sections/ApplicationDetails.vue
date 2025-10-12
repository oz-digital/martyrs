<template>
  <div class="gap-small cols-1">
    <Block title="Application Information">
      <div class="gap-small">
        <div class="flex">
          <strong class="mn-r-auto">Name:</strong>
          <span>{{ application.contacts?.name || 'Not specified' }}</span>
        </div>
        <div class="flex">
          <strong class="mn-r-auto">Email:</strong>
          <span>{{ application.contacts?.email || 'Not specified' }}</span>
        </div>
        <div class="flex">
          <strong class="mn-r-auto">Phone:</strong>
          <span>{{ application.contacts?.phone || 'Not specified' }}</span>
        </div>
        <div class="flex">
          <strong class="mn-r-auto">Status:</strong>
          <StatusBadge :value="{
            text: application.status,
            color: application.status === 'completed' ? '#22c55e' : application.status === 'in_progress' ? '#f59e0b' : '#6b7280'
          }" />
        </div>
        <div class="flex">
          <strong class="mn-r-auto">Type:</strong>
          <span>{{ application.type || 'Unknown' }}</span>
        </div>
      </div>
    </Block>

    <Block title="Additional Information">
      <div class="gap-small">
        <div class="flex">
          <strong class="mn-r-auto">Created:</strong>
          <span>{{ formatDate(application.createdAt) }}</span>
        </div>
        <div class="flex">
          <strong class="mn-r-auto">Updated:</strong>
          <span>{{ formatDate(application.updatedAt) }}</span>
        </div>
        <div v-if="application.text">
          <strong>Message:</strong>
          <p class="mn-t-thin">{{ application.text }}</p>
        </div>
        <div v-if="application.chat">
          <strong>Chat ID:</strong>
          <p class="mn-t-thin">{{ application.chat }}</p>
        </div>
      </div>
    </Block>

    <div class="gap-thin flex mn-t-small">
      <Button 
        @click="$emit('edit')"
        class="w-100 pd-small radius-big bg-main t-black uppercase t-medium"
      >
        Edit
      </Button>
      <Button 
        @click="$emit('delete')"
        class="w-100 pd-small radius-big bg-danger t-white uppercase t-medium"
      >
        Delete
      </Button>
    </div>
  </div>
</template>

<script setup>
import Block from '@martyrs/src/components/Block/Block.vue';
import StatusBadge from '@martyrs/src/components/Table/StatusBadge.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js';

const { formatDate } = useGlobalMixins();

defineProps({
  application: {
    type: Object,
    required: true
  }
});

defineEmits(['edit', 'delete']);
</script>

<style scoped>
.bg-danger {
  background-color: #ef4444;
}
</style>