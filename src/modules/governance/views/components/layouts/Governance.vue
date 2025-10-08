<template>
  <div class="bg-white">
    <section class="w-100 flex-nowrap flex gap-thin mobile:pd-zero pd-thin pos-relative">
      <div style="flex: 1 1 auto" class="w-100 h-100 pos-relative">
        <router-view v-slot="{ Component, route }">
          <transition name="scaleIn" mode="out-in">
            <component ref="page" :key="route.query" :is="Component" />
          </transition>
        </router-view>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
</script>

<style lang="scss">
</style>
