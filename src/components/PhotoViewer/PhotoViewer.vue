<script setup>
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

  import IconChevronLeft from '@martyrs/src/modules/icons/navigation/IconChevronLeft.vue';
  import IconChevronRight from '@martyrs/src/modules/icons/navigation/IconChevronRight.vue';

  const props = defineProps({
    photoUrl: String,
    photos: Array,
    initialIndex: Number,
    show: Boolean,
  });

  const currentIndex = ref(0);
  const translateX = ref(0);
  const isDragging = ref(false);
  const scale = ref(1);
  const pos = ref({ x: 0, y: 0 });
  const image = ref(null);
  const thumbnailsRef = ref(null);

  let startX = 0, startDist = 0, startScale = 1, dragX = 0, wheelTimer, dragTimer;

  const photos = computed(() => props.photos?.length ? props.photos : props.photoUrl ? [props.photoUrl] : []);

  const sliderStyle = computed(() => ({
    transform: `translate3d(${translateX.value}px, 0, 0)`,
    transition: isDragging.value ? 'none' : 'transform 0.3s',
    backfaceVisibility: 'hidden'
  }));

  const imgStyle = computed(() => ({
    transform: `scale3d(${scale.value}, ${scale.value}, 1) translate3d(${pos.value.x}px, ${pos.value.y}px, 0)`,
    backfaceVisibility: 'hidden'
  }));

  const reset = () => {
    scale.value = 1;
    pos.value = { x: 0, y: 0 };
  };

  const goTo = (index) => {
    currentIndex.value = index;
    translateX.value = -index * window.innerWidth;
    reset();
  };

  const jumpTo = (index) => {
    isDragging.value = true;
    goTo(index);
    requestAnimationFrame(() => isDragging.value = false);
  };

  const scrollToThumb = (el) => {
    if (el && thumbnailsRef.value) {
      const container = thumbnailsRef.value;
      const thumb = el;
      const left = thumb.offsetLeft - container.offsetWidth / 2 + thumb.offsetWidth / 2;
      container.scrollTo({ left, behavior: 'smooth' });
    }
  };

  const getXY = (e) => {
    const t = e.touches?.[0] || e;
    return [t.clientX, t.clientY];
  };

  const constrain = () => {
    if (scale.value <= 1 || !image.value) return reset();
    
    const { naturalWidth: nw, naturalHeight: nh } = image.value;
    const [cw, ch] = [window.innerWidth, window.innerHeight];
    const r = Math.min(cw / nw, ch / nh, 1);
    
    const maxX = Math.max(0, (nw * r * scale.value - cw) / 2 / scale.value);
    const maxY = Math.max(0, (nh * r * scale.value - ch) / 2 / scale.value);
    
    pos.value.x = Math.max(-maxX, Math.min(maxX, pos.value.x));
    pos.value.y = Math.max(-maxY, Math.min(maxY, pos.value.y));
  };

  const zoom = (newScale, fx, fy) => {
    if (!image.value) return;
    
    newScale = Math.max(1, Math.min(3, newScale));
    const rect = image.value.getBoundingClientRect();
    const [mx, my] = [fx - rect.left - rect.width / 2, fy - rect.top - rect.height / 2];
    const change = newScale / scale.value;
    
    pos.value.x -= (mx / scale.value) * (change - 1);
    pos.value.y -= (my / scale.value) * (change - 1);
    scale.value = newScale;
    constrain();
  };

  const startDrag = (e) => {
    if (e.type === 'mousedown') e.preventDefault();
    isDragging.value = true;
    let [x, y] = getXY(e);
    
    const handleMove = scale.value > 1
      ? (e) => {
          if (!isDragging.value) return;
          if (e.type === 'touchmove') e.preventDefault();
          const [cx, cy] = getXY(e);
          pos.value.x += (cx - x) / scale.value;
          pos.value.y += (cy - y) / scale.value;
          constrain();
          [x, y] = [cx, cy];
        }
      : (e) => {
          if (!isDragging.value) return;
          if (e.type === 'touchmove') e.preventDefault();
          dragX = getXY(e)[0] - startX;
          translateX.value = dragX - currentIndex.value * window.innerWidth;
        };
    
    const handleEnd = () => {
      isDragging.value = false;
      if (scale.value <= 1 && Math.abs(dragX) > window.innerWidth / 4) {
        goTo(Math.max(0, Math.min(photos.value.length - 1, currentIndex.value + (dragX > 0 ? -1 : 1))));
      } else if (scale.value <= 1) {
        goTo(currentIndex.value);
      }
      dragX = 0;
      document.removeEventListener('mousemove', handleMove, { passive: true });
      document.removeEventListener('mouseup', handleEnd, { passive: true });
      document.removeEventListener('touchmove', handleMove, { passive: false });
      document.removeEventListener('touchend', handleEnd, { passive: true });
    };
    
    if (scale.value <= 1) startX = x;
    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseup', handleEnd, { passive: true });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd, { passive: true });
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      clearTimeout(dragTimer);
      const [t1, t2] = e.touches;
      startDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      startScale = scale.value;
    } else {
      dragTimer = setTimeout(() => startDrag(e), 50);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && !isDragging.value) {
      clearTimeout(dragTimer);
      e.preventDefault();
      const [t1, t2] = e.touches;
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      zoom(startScale * (dist / startDist), (t1.clientX + t2.clientX) / 2, (t1.clientY + t2.clientY) / 2);
    }
  };

  const handleTouchEnd = () => {
    clearTimeout(dragTimer);
    startDist = 0;
  };

  const handleWheel = (e) => {
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => zoom(scale.value + (e.deltaY > 0 ? -0.1 : 0.1), e.clientX, e.clientY), 10);
  };

  const handleKey = (e) => {
    const dir = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (dir) goTo(Math.max(0, Math.min(photos.value.length - 1, currentIndex.value + dir)));
  };

  watch(() => props.initialIndex, (i) => i != null && jumpTo(i));

  onMounted(() => {
    window.addEventListener('keydown', handleKey, { passive: true });
    jumpTo(props.initialIndex || 0);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKey);
    clearTimeout(wheelTimer);
    clearTimeout(dragTimer);
  });
</script>

<template>
  <div class="photo-viewer w-min-100" @wheel.prevent="handleWheel">
    <div 
      class="slider-track" 
      :style="sliderStyle"
      @mousedown="startDrag" 
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div 
        v-for="(photo, index) in photos" 
        :key="index"
        class="slide"
      >
        <img 
          :src="photo" 
          :style="index === currentIndex ? imgStyle : null"
          :ref="el => index === currentIndex && (image = el)"
          @load="() => index === currentIndex && reset()" 
        />
      </div>
    </div>
    
    <template 
      v-if="photos.length > 1"
    >

      <span class="pos-absolute pos-l-small bs-small pos-t-small radius-small pd-thin bg-white t-black t-medium">
        {{ currentIndex + 1 }} / {{ photos.length }}
      </span>
      
      <button 
        v-if="currentIndex > 0" 
        @click="goTo(currentIndex - 1)" 
        class="cursor-pointer hover-scale-1 bs-small pos-absolute pos-t-50 pos-l-small bg-white radius-small pd-thin"
      >
        <IconChevronLeft fill="rgb(var(--black)" class="i-medium"/>
      </button>

      <button 
        v-if="currentIndex < photos.length - 1" 
        @click="goTo(currentIndex + 1)" 
        class="cursor-pointer hover-scale-1 bs-small pos-absolute pos-t-50 pos-r-small bg-white radius-small pd-thin"
      >
        <IconChevronRight fill="rgb(var(--black)" class="i-medium"/>
      </button>
      
      <div class="pos-absolute pos-b-small radius-small pd-thin bg-light  thumbnails-container">
        <div class="thumbnails" ref="thumbnailsRef">
          <img 
            v-for="(photo, i) in photos" 
            :key="i"
            :src="photo"
            @click="jumpTo(i)"
            :class="['thumbnail', { active: i === currentIndex }]"
            :ref="el => i === currentIndex && scrollToThumb(el)" 
          />
        </div>
      </div>
    </template>

  </div>
</template>

<style scoped>
.photo-viewer {
  width: 100%;
  height: 100%;
  position: relative;
  background: #fff;
  overflow: hidden;
  user-select: none;
  touch-action: none;
}

.slider-track {
  display: flex;
  height: 100%;
  cursor: grab;
  backface-visibility: hidden;
}

.slider-track:active {
  cursor: grabbing;
}

.slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: scale-down;
  transform-origin: center;
  pointer-events: none;
  backface-visibility: hidden;
}

.thumbnails-container {
  left: 50%;
  transform: translateX(-50%);
  max-width: 100%;
  z-index: 1;
}

.thumbnails {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.thumbnails::-webkit-scrollbar {
  display: none;
}

.thumbnail {
  width: 4rem;
  height: 4rem;
  object-fit: cover;
  cursor: pointer;
  transition: opacity 0.2s;
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.thumbnail.active {
  opacity: 1;
  border: 1px solid rgb(var(--second));
}


@media (max-width: 768px) {
  .nav-arrow { display: none; }
  .thumbnail { width: 3rem; height: 3rem; }
}
</style>