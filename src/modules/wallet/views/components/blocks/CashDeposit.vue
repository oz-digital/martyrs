<template>
  <h2 class="mn-b-small t-center t-bold">Deposit with cash</h2>

  <p class="t-transp t-center">
    You need to go to casse to topup balance
  </p>

  <div
    class="w-100 bg-grey radius-medium mn-t-medium mn-b-medium"
    style="height: 152px"
  />

  <button
      class="w-100 bg-main t-black pd-thin radius-medium t-center br-solid br-2px br-black-transp-10 mn-t-small"
      @click="backSelection">Back to selection
  </button>
</template>

<script setup>
  const emits = defineEmits(['back-selection'])

  function backSelection() {
    emits("back-selection");
  }
</script>

<style scoped>
</style>