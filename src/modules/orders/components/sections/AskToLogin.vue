<template>
	<div 
    v-if="isOpen === true" 
    class="
      bg-black 
      t-white 
      pd-big 
      mobile:pd-medium
      radius-medium
      flex-v-center
      flex-nowrap 
      flex
      mobile:flex-column
    "
  >
    <!-- <img loading="lazy" 
      @click="isOpen = false" 
      class="
        i-base 
        button-close-popup 
        button
      "
      src="@/assets/icons/cross-white.svg"
    > -->

    <div class="mn-r-auto">
      <h3 class="t-semi mn-b-small">Already registered?</h3>
      <span class="p-regular t-transp">Sign in to your account to checkout faster.</span>
    </div>

    <button 
      @click="toggleSignInPopup()" 
      class="button mobile:w-100 mobile:mn-t-small h-4r bg-main"
    >
      Sign In
    </button>
  </div>
</template>


<script setup>
	import { ref } from 'vue'

	let isOpen = ref(true);
</script>

<style lang="scss">
</style>


