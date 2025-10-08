<script setup>
import { ref } from 'vue';

const emit = defineEmits(['submit']);

const selectedVote = ref(null);
const comment = ref('');

const handleSubmit = (e) => {
  e.preventDefault();
  if (selectedVote.value) {
    emit('submit', selectedVote.value, comment.value);
    selectedVote.value = null;
    comment.value = '';
  }
};
</script>

<template>
  <form @submit="handleSubmit" class="flex flex-column gap-semi">
    <div>
      <h4 class="p-small t-medium mn-b-small">Cast Your Vote</h4>
      <div class="cols-3 gap-regular">
        <button
          type="button"
          @click="selectedVote = 'yes'"
          :class="`flex flex-column flex-align-center flex-justify-center pd-semi radius-medium br-2px transition-cubic-in-out ${
            selectedVote === 'yes'
              ? 'br-green-nice bg-green-small'
              : 'br-light hover-br-green-nice'
          }`"
        >
          <svg :class="`w-8r h-8r mn-b-thin ${selectedVote === 'yes' ? 'fill-green-nice' : 'fill-grey'}`" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
          <span :class="`t-medium ${selectedVote === 'yes' ? 't-green-nice' : 't-grey'}`">
            Yes
          </span>
        </button>

        <button
          type="button"
          @click="selectedVote = 'no'"
          :class="`flex flex-column flex-align-center flex-justify-center pd-semi radius-medium br-2px transition-cubic-in-out ${
            selectedVote === 'no'
              ? 'br-red-nice bg-red-small'
              : 'br-light hover-br-red-nice'
          }`"
        >
          <svg :class="`w-8r h-8r mn-b-thin ${selectedVote === 'no' ? 'fill-red-nice' : 'fill-grey'}`" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
          </svg>
          <span :class="`t-medium ${selectedVote === 'no' ? 't-red-nice' : 't-grey'}`">
            No
          </span>
        </button>

        <button
          type="button"
          @click="selectedVote = 'abstain'"
          :class="`flex flex-column flex-align-center flex-justify-center pd-semi radius-medium br-2px transition-cubic-in-out ${
            selectedVote === 'abstain'
              ? 'br-grey bg-light'
              : 'br-light hover-br-grey'
          }`"
        >
          <svg :class="`w-8r h-8r mn-b-thin ${selectedVote === 'abstain' ? 'fill-grey' : 'fill-grey'}`" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span :class="`t-medium ${selectedVote === 'abstain' ? 't-grey' : 't-grey'}`">
            Abstain
          </span>
        </button>
      </div>
    </div>

    <div>
      <label for="comment" class="d-block p-small t-medium mn-b-thin">
        Comment (Optional)
      </label>
      <textarea
        id="comment"
        v-model="comment"
        rows="4"
        class="w-100 pd-small br-1px br-light radius-medium"
        style="outline: none; resize: vertical;"
        placeholder="Share your thoughts on this proposal..."
      />
    </div>

    <button
      type="submit"
      :disabled="!selectedVote"
      class="w-100 bg-main hover-bg-main-semi t-white t-medium pd-small radius-medium transition-cubic-in-out"
      :class="{ 'bg-grey cursor-not-allowed': !selectedVote }"
    >
      Submit Vote
    </button>
  </form>
</template>
