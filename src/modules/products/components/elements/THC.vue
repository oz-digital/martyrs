<template>
	<div v-if="product.attributes[1]" class="thc">
    <p class="t-bold t-white">{{product.attributes[1].value}} %</p>
    <p class="t-white h6">THC</p>
    <!-- Polygon bg -->
    <svg v-if="Number(product.attributes[1].value) >= 18" width="60" height="66" viewBox="0 0 60 66" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FF0000" stroke="rgb(var(--white))" stroke-width="3" d="M26 3.3094C28.4752 1.88034 31.5248 1.88034 34 3.3094L53.7128 14.6906C56.188 16.1197 57.7128 18.7607 57.7128 21.6188V44.3812C57.7128 47.2393 56.188 49.8803 53.7128 51.3094L34 62.6906C31.5248 64.1197 28.4752 64.1197 26 62.6906L6.28719 51.3094C3.81198 49.8803 2.28719 47.2393 2.28719 44.3812V21.6188C2.28719 18.7607 3.81198 16.1197 6.28719 14.6906L26 3.3094Z" />
    </svg>
    <svg v-if="Number(product.attributes[1].value) <= 18 && Number(product.attributes[1].value) >= 14" width="60" height="66" viewBox="0 0 60 66" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FF0099" stroke="rgb(var(--white))" stroke-width="3" d="M26 3.3094C28.4752 1.88034 31.5248 1.88034 34 3.3094L53.7128 14.6906C56.188 16.1197 57.7128 18.7607 57.7128 21.6188V44.3812C57.7128 47.2393 56.188 49.8803 53.7128 51.3094L34 62.6906C31.5248 64.1197 28.4752 64.1197 26 62.6906L6.28719 51.3094C3.81198 49.8803 2.28719 47.2393 2.28719 44.3812V21.6188C2.28719 18.7607 3.81198 16.1197 6.28719 14.6906L26 3.3094Z" />
    </svg>
    <svg v-if="Number(product.attributes[1].value) <= 14 && Number(product.attributes[1].value) >= 10" width="60" height="66" viewBox="0 0 60 66" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EB00FF" stroke="rgb(var(--white))" stroke-width="3" d="M26 3.3094C28.4752 1.88034 31.5248 1.88034 34 3.3094L53.7128 14.6906C56.188 16.1197 57.7128 18.7607 57.7128 21.6188V44.3812C57.7128 47.2393 56.188 49.8803 53.7128 51.3094L34 62.6906C31.5248 64.1197 28.4752 64.1197 26 62.6906L6.28719 51.3094C3.81198 49.8803 2.28719 47.2393 2.28719 44.3812V21.6188C2.28719 18.7607 3.81198 16.1197 6.28719 14.6906L26 3.3094Z" />
    </svg>
    <svg v-if="Number(product.attributes[1].value) <= 10" width="60" height="66" viewBox="0 0 60 66" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#00FF29" stroke="rgb(var(--white))" stroke-width="3" d="M26 3.3094C28.4752 1.88034 31.5248 1.88034 34 3.3094L53.7128 14.6906C56.188 16.1197 57.7128 18.7607 57.7128 21.6188V44.3812C57.7128 47.2393 56.188 49.8803 53.7128 51.3094L34 62.6906C31.5248 64.1197 28.4752 64.1197 26 62.6906L6.28719 51.3094C3.81198 49.8803 2.28719 47.2393 2.28719 44.3812V21.6188C2.28719 18.7607 3.81198 16.1197 6.28719 14.6906L26 3.3094Z" />
    </svg>
  </div>
</template>

<script setup="props">
/////////////////////////////
// COMPONENT DEPENDENCIES
/////////////////////////////
import { ref, } from 'vue';

/////////////////////////////
// HELPERS
/////////////////////////////

/////////////////////////////
// CREATED
/////////////////////////////

const props = defineProps({
  product: Object,
});

/////////////////////////////
// MOUNTED
/////////////////////////////
</script>

<style lang="scss">
.catalog-wrapper .thc { 
  // transform: scale(0.66);
}

.thc {
  position: absolute;

  right: 1rem;
  top: 1rem;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  width: 6rem;
  height: 6rem;
  transition: all linear 0.1s;

  p:first-of-type {
    font-size: 1.25rem;
    letter-spacing: -2px;
    z-index: 7;
  }

  p:last-of-type {
    z-index: 7;
  }

  svg {
    z-index: 6;
    position: absolute;
    width: 6rem;
    height: 6rem;
    left: 0;
    top: 0;
  }
}
   @media screen and (max-width: 1025px) {
    .thc {
      transform: scale(0.75) !important;
      transform-origin: top right !important;
    }
  }
    
</style>
