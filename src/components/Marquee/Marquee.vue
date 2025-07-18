<template>
  <div
    v-if="ready"
    class="vue3-marquee"
    :class="{ vertical: vertical, horizontal: !vertical }"
    :style="getCurrentStyle"
    :key="componentKey"
    @mouseenter="hoverStarted"
    @mouseleave="hoverEnded"
    @mousedown="mouseDown"
    @mouseup="mouseUp"
  >
    <div
      class="transparent-overlay"
      ref="marqueeOverlayContainer"
      :aria-hidden="true"
      :class="{ vertical: vertical, horizontal: !vertical, overlay: gradient }"
    />

    <div 
      class="marquee"
      ref="marqueeContent">
      <slot></slot>
    </div>

    <div 
      class="marquee" 
      :aria-hidden="true"
    >
      <slot></slot>
    </div>

    <div
      v-for="num in cloneAmount"
      :key="num"
      :aria-hidden="true"
      class="marquee cloned"
    >
      <slot></slot>
    </div
    >
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'

const props = defineProps({
  vertical: { type: Boolean, default: false },
  direction: { type: String, default: 'normal' },
  duration: { type: Number, default: 20 },
  delay: { type: Number, default: 0 },
  loop: { type: Number, default: 0 },
  clone: { type: Boolean, default: false },
  gradient: { type: Boolean, default: false },
  gradientColor: { type: [Array,String], default: () => [255, 255, 255] },
  gradientLength: { type: String },
  pauseOnHover: { type: Boolean, default: false },
  pauseOnClick: { type: Boolean, default: false },
  pause: { type: Boolean, default: false }
})

const emits = defineEmits(['onComplete', 'onLoopComplete', 'onPause', 'onResume'])

const ready = ref(false)

const componentKey = ref(0)
const cloneAmount = ref(0)
const loopCounter = ref(0)
const loopInterval = ref(null)

const widthMin = ref('100%')
const widthContainer = ref(0)
const widthContent = ref(0)
const heightMin = ref('100%')
const heightContainer = ref(0)
const heightContent = ref(0)

const gradientLength = ref('200px')

const verticalAnimationPause = ref(false)
const marqueeContent = ref(null)
const marqueeOverlayContainer = ref(null)

const ForcesUpdate = async () => {
  await checkForClone()
  componentKey.value++
}

const checkForClone = async () => {
  if (props.vertical) {
    verticalAnimationPause.value = true
  }

  setInterval(() => {
    widthMin.value = '0%'
    heightMin.value = '0%'

    if (marqueeContent.value !== null && marqueeOverlayContainer.value !== null) {
      if (marqueeContent.value && marqueeOverlayContainer.value) {
        if (
          props.vertical &&
          'clientHeight' in marqueeContent.value &&
          'clientHeight' in marqueeOverlayContainer.value
        ) {
          heightContent.value = marqueeContent.value.clientHeight
          heightContainer.value = marqueeOverlayContainer.value.clientHeight

          const localCloneAmount = Math.ceil(heightContainer.value / heightContent.value)

          cloneAmount.value = isFinite(localCloneAmount) ? localCloneAmount : 0

          verticalAnimationPause.value = false

          return cloneAmount.value
        } else if (
          !props.vertical &&
          'clientWidth' in marqueeContent.value &&
          'clientWidth' in marqueeOverlayContainer.value
        ) {
          widthContent.value = marqueeContent.value.clientWidth
          widthContainer.value = marqueeOverlayContainer.value.clientWidth

          const localCloneAmount = Math.ceil(widthContainer.value / widthContent.value)

          cloneAmount.value = isFinite(localCloneAmount) ? localCloneAmount : 0

          return cloneAmount.value
        } else {
          widthMin.value = '100%'
          heightMin.value = '100%'
          return 0
        }
      } else {
        widthMin.value = '100%'
        heightMin.value = '100%'
        return 0
      }
    } else {
      widthMin.value = '100%'
      heightMin.value = '100%'
      return 0
    }
  }, 100)
}

const hoverStarted = () => { if (props.pauseOnHover) emits('onPause') }
const hoverEnded = () => { if (props.pauseOnHover) emits('onResume') }
const mouseDown = () => { if (props.pauseOnClick) emits('onPause') }
const mouseUp = () => { if (props.pauseOnClick) emits('onResume') }

const getCurrentStyle = computed(() => {
  return {
    '--loops': `${props.loop === 0 ? 'infinite' : props.loop}`,
    '--duration': `${props.duration}s`,
    '--delay': `${props.delay}s`,
    '--direction': `${props.direction}`,
    '--pauseOnHover': `${props.pauseOnHover ? 'paused' : 'running'}`,
    '--pauseOnClick': `${props.pauseOnClick ? 'paused' : 'running'}`,
    '--pauseAnimation': `${(props.vertical && verticalAnimationPause.value) || props.pause ? 'paused' : 'running'}`,
    '--gradient-color': `rgba(${props.gradientColor}, 1), rgba(${props.gradientColor}, 0)`,
    '--gradient-length': `${gradientLength.value}`,
    '--min-width': `${widthMin.value}`,
    '--min-height': `${heightMin.value}`,
    '--orientation': props.vertical ? 'scrollY' : 'scrollX'
  }
})

const setupMarquee = async () => {
  if (props.vertical) {
    heightMin.value = '100%'
    widthMin.value = 'auto'
  } else {
    heightMin.value = 'auto'
    widthMin.value = '100%'
  }

  if (props.gradient && props.gradientLength) {
    gradientLength.value = props.gradientLength
  }

  if (props.clone) {
    await checkForClone()
    ForcesUpdate()
    ready.value = true
  } else {
    ready.value = true
  }
}

onMounted(async () => {
  setupMarquee()

  loopInterval.value = setInterval(() => {
    loopCounter.value++

    if (props.loop !== 0 && loopCounter.value === props.loop) {
      emits('onComplete')
      clearInterval(loopInterval.value)
    }

    emits('onLoopComplete')
  }, props.duration * 1000)
})

onBeforeUnmount(() => {
  clearInterval(loopInterval.value)
})

watch(widthContent, async () => {
  if (props.clone) {
    ForcesUpdate()
  }
})

watch(widthContainer, async () => {
  if (props.clone) {
    ForcesUpdate()
  }
})

watch(
  () => props.pause,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      if (newVal) {
        emits('onResume')
      } else {
        emits('onPause')
      }
    }
  }
)
</script>

<style lang="scss">
.vue3-marquee {
  display: flex !important;
  position: relative;

  .marquee {
    flex: 0 0 auto;
    min-width: var(--min-width);
    min-height: var(--min-height);
    z-index: 1;

    animation: var(--orientation) var(--duration) linear var(--delay) var(--loops);
    animation-play-state: var(--pauseAnimation);
    animation-direction: var(--direction);
  }

  .overlay {
    position: absolute;
    width: 100%;
    height: 100%;

    &:before {
      left: 0;
      top: 0;
    }

    &:before, &:after {
      content: '';
      position: absolute;
      z-index: 2;
    }
  }

  .transparent-overlay {
    position: absolute;
    width: 100.5%;
    height: 100.5%;
  }


  &.horizontal {
    overflow-x: hidden !important;
    flex-direction: row !important;
    width: 100%;
    height: max-content;

    .marquee {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .overlay::before,.overlay::after {
      background: linear-gradient(to right, var(--gradient-color));
      height: 100%;
      width: var(--gradient-length);
    }

    .overlay::after {
      transform: rotateZ(180deg);
      right: 0;
      top: 0;
    }
  }

  &.vertical {
    overflow-y: hidden !important;
    flex-direction: column !important;
    height: 100%;
    width: max-content;

    .marquee {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .overlay::before, .overlay::after {
      background: linear-gradient(to bottom, var(--gradient-color));
      height: var(--gradient-length);
      width: 100%;
    }

    .overlay::after {
      transform: rotateZ(-180deg);
      left: 0;
      bottom: 0;
    }
  }

  &:hover {
    div {
      animation-play-state: var(--pauseOnHover);
    }
  }

  &:active {
    div {
      animation-play-state: var(--pauseOnClick);
    } 
  }
}

@keyframes scrollX {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}

@keyframes scrollY {
  0% {
    transform: translateY(0%);
  }
  100% {
    transform: translateY(-100%);
  }
}
</style>