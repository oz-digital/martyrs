<template>
  <div class="grid">
    <div class="grid-lines"></div>
  </div>
</template>

<style lang='scss' scoped>
  .grid {
    perspective: 450px;
    background-size: cover;
  }

  .grid-lines {
    width: 100%;
    height: 200%;
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 0), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 0);
    background-size: 45px 30px;
    background-repeat: repeat;
    transform-origin: 100% 0 0;
    animation: play 15s linear infinite;
  }

  @keyframes play {
    0% {
      transform: rotateX(45deg) translateY(-50%);
    }
    100% {
      transform: rotateX(45deg) translateY(0);
    }
  }
</style>