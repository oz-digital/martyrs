<template>
  <header class="w-100" itemprop="name">
      <h2 class="h1" itemprop="headline">
        <span class="text-fade-in">
          <span class="text-splitted">{{ text }}</span>
        </span>
      </h2>
    </header>
</template>

<script setup>
import { ref, toRefs } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: 'Dreamy Moments Captured'
  }
})

const { text } = toRefs(props)
</script>