<template>
	<section id="account" class="cols-2-1_3 gap-medium pd-big">
    <!-- ---------------------------------------------------------------- -->
    <!-- 02. Page Tabs  -->
    <!-- ---------------------------------------------------------------- -->
    <div class="pd-medium menu-tabs">
      123
      <!-- {{store.auth.state.access.roles}} -->
       <!-- <button v-if="store.auth.state.access.roles.includes('ROLE_ADMIN')" @click="$router.push('/account/community')" :class="{'product-tab-active': $route.path === '/account/community'}" class="mn-b-small product-tab"> -->
        <!-- Blog -->
      <!-- </button> -->

      <!-- <button v-if="store.auth.state.access.roles.includes('ROLE_ADMIN')" @click="$router.push('/account/gallery')" :class="{'product-tab-active': $route.path === '/account/gallery'}" class="mn-b-medium product-tab"> -->
        <!-- Gallery -->
      <!-- </button> -->
      <button @click="logout()" class="w-100 mn-t-semi bg-main button">Выйти</button>
    </div>
    

    <div class="w-100">
      <router-view  v-slot="{ Component, route }">
        <transition  name="scaleIn" mode="out-in">
          <component ref="page" :key="route.path" :is="Component" />
        </transition>
      </router-view>
    </div>
 
  </section>
</template>


<script setup>
import { computed, onMounted,reactive,toRefs } from 'vue'

import { useRoute,useRouter } from 'vue-router'
import { useStore } from '@/store';

const store = useStore()

const route = useRoute()
const router = useRouter()

let data = reactive({currentTab: 'user'})
let reactiveData = toRefs(data)
function changeTab (tab) {data.currentTab = tab; console.log(data.currentTab) }


function logout () {
  store.auth.actions.logout()
  router.push({name: 'Sign In'})
}

</script>

<style lang="scss">

</style>
