<template>
  <!-- Toolbar -->
  <section class="pageheader section">
    
    <div class="mn-b-big title">
      <h1>Категории товаров</h1>
      <div class="round-stat">{{categories.length}}</div>
    </div>
    <router-link :to="'/admin/categories/add'" class="button">Добавить категорию</router-link>
  </section>

  <CategoriesSection />
</template>


<script setup>


  import { computed, onMounted } from 'vue'
  
  import { useRoute } from 'vue-router'
 

  import CategoriesSection from '@/components/sections/CategoriesSection.vue'

  const store = useStore()
  const route = useRoute()
  store.dispatch('categories/read')
  const categories = computed(() => store.state.categories)
  
  </script>

<style lang="scss">
  
</style>
