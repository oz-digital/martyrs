<template>
  <section class="mobile-menu-section  pd-r-zero pd-t-thin pd-b-thin pd-medium radius-medium">
    <slot></slot>
  </section>
</template>

<script setup>
import { ref, } from 'vue';

</script>

<style  lang="scss">
  .mobile-menu-section {
    > div {
      &:last-of-type {
          border-bottom: none !important;
      }
    }
    
  }
</style>