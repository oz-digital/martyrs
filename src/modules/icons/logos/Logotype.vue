<template>
  <svg class="h-2r w-auto" width="270" height="300" viewBox="0 0 270 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0)">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M264.626 52.2791C265.531 57.2858 266 62.4066 266 67.6155C266 125.882 207.349 173.116 135 173.116C62.6507 173.116 4 125.882 4 67.6155C4 62.4066 4.46875 57.2858 5.37413 52.2791C11.0997 32.6306 21.1714 14.8341 34.4789 0C34.1621 2.17658 34 4.38345 34 6.61562C34 43.8948 79.2192 74.1156 135 74.1156C190.781 74.1156 236 43.8948 236 6.61562C236 4.38345 235.838 2.17659 235.521 5.29254e-06C248.829 14.8341 258.9 32.6306 264.626 52.2791Z" fill="#00FF88"/>
      <path d="M270 165C270 239.558 209.558 300 135 300C60.4416 300 0 239.558 0 165C0 90.4416 60.4416 30 135 30C209.558 30 270 90.4416 270 165Z" fill="#00FF88"/>
      <ellipse class="eye" cx="143" cy="155.5" rx="37" ry="37.5" stroke="white" fill="white" stroke-width="1.48515"/>
      <g class="eye"> 
      <path  d="M215 166C215 210.849 179.07 247 135 247C90.9303 247 55 210.849 55 166C55 121.151 90.9303 85 135 85C179.07 85 215 121.151 215 166Z" stroke="white" stroke-width="11"/>

   			</g>
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="269.333" height="300" fill="white"/>
      </clipPath>
    </defs>
  </svg>
</template>

<script setup>
// Здесь нет необходимости в дополнительном JavaScript
</script>

<style lang="scss" scoped>
.eye {
  animation: rotateEye 10s linear infinite;
  transform-origin: center 55%;
}

.mouth {
  animation: rotateMouth 20s ease-in-out infinite;
  transform-origin: center 55%;
}

@keyframes rotateEye {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes rotateMouth {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>