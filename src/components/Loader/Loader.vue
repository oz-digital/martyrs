<template>
  <div class="circular-loader pos-relative z-index-1 w-100 h-100 w-max-2r h-max-2r h-min-1r w-min-1r" :class="{ 'circular-loader-centered': centered }">
    <svg viewBox="25 25 50 50">
      <circle class="circular-loader-fill" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10" />
      <circle class="circular-loader-circle" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10" />
    </svg>
    <div v-if="progress" class="progress-text">{{ progress }}</div>
    <div v-if="status" class="uppercase t-semi w-m-10r status-text">{{ status }}</div>
  </div>
</template>

<script>
export default {
  props: {
    progress: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      default: null,
    },
    centered: {
      type: Boolean,
      default: true, // По умолчанию лоадер центрирован (для обратной совместимости)
    },
  },
};
</script>

<style>
.circular-loader-centered {
  top: calc(50% - 1rem);
  left: calc(50% - 1rem);
}

.circular-loader svg {
  animation: rotate 2s linear infinite;
}

.circular-loader-circle {
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  stroke: rgb(var(--main));
  animation: dash 1.5s ease-in-out infinite;
}

.circular-loader-fill {
  stroke-linecap: round;
  stroke: rgba(var(--black),0.2);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  color: rgb(var(--main));;
}

.status-text {
  position: absolute;
  top: 120%;
  left: calc(50% - 5rem);
  font-size: 0.8rem;
  width: 10rem !important;
  text-align: center;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: -124;
  }
}
</style>