<template>
  <div>
    <FieldTags
      v-model="selectedTags"
      :autocomplete-items="filteredItems"
      :add-on-key="[13, ':', ';', ',']"
      :separators="[';', ',']"
      :max-tags="20"
      :maxlength="20"
      :placeholder="'Please add tags'"
      @tags-changed="handleTagsChanged"
      class="mn-b-thin bg-light radius-medium pd-small"
    />
    
    <input
      v-model="tag"
      @keydown.enter="addTagFromInput"
      placeholder="Type to filter suggestions"
      class="hidden-input"
      style="position: absolute; left: -9999px;"
    />

    <p class="p-small mn-b-thin">Suggested:</p>

    <span 
      v-if="filteredSuggestedItems.length > 0" 
      v-for="(tag,index) in filteredSuggestedItems" 
      @click="addTag(tag)"
      class="cursor-pointer t-medium ti-tag-toDefactor"
      :class="{'mn-r-micro':index !== filteredSuggestedItems.length - 1}"
    >
      {{ tag.text }}
    </span>
    <span v-else>You added all suggested tags</span> 
  </div>
</template>

<script setup>
import FieldTags from '@martyrs/src/components/FieldTags/FieldTags.vue'
import { ref, computed, onMounted } from 'vue';

const emits = defineEmits(['tags-changed']);
const props = defineProps({
  tags: {
    type: Array
  },
  tagsSuggested: {
    type: Array,
    default: [
      { text: 'story' },
      { text: 'news' },
      { text: 'guide' },
      { text: 'discussion' },
      { text: 'photos' },
    ]
  }
});

const tag = ref('');
const selectedTags = ref([]);
const autocompleteItems = ref(props.tagsSuggested);

// Initialize tags
if (props.tags) {
  selectedTags.value = props.tags.map(tag => 
    typeof tag === 'string' ? { text: tag } : tag
  );
}

// Filter autocomplete items based on current input
const filteredItems = computed(() => {
  return autocompleteItems.value;
});

const filteredSuggestedItems = computed(() => {
    return autocompleteItems.value.filter(item => {
      return !selectedTags.value.some(tag => tag.text === item.text);
    });
  })

function addTag (tagToAdd) {
  selectedTags.value.push(tagToAdd)
  emits('tags-changed', selectedTags.value.map(t => t.text));
}

function addTagFromInput() {
  if (tag.value) {
    addTag({ text: tag.value });
    tag.value = '';
  }
}

function handleTagsChanged(newTags) {
  selectedTags.value = newTags;
  emits('tags-changed', newTags.map(t => typeof t === 'string' ? t : t.text));
}



</script>

<style>
  .ti-tag-toDefactor {
    background-color: rgb(var(--main));
    color: rgb(var(--black));
    border-radius: 4rem;
    padding: 1px 8px 2px;
    margin: 2px;
    font-size: .85em;
  }
</style>