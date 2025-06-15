<template>
  <div class="pd-thin h-min-100">
    <router-view v-slot="{ Component, route }">
      <transition name="scaleIn" mode="out-in">
        <component ref="page" :key="route.query" :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup="props">
  import { computed,onMounted, toRefs,ref, watch } from 'vue'
  import { useRoute,useRouter } from 'vue-router';
  // Router
  const route = useRoute();
  const router = useRouter()
</script>

<style lang="scss">
  
</style>
