<template>
  <div class="photo-container" @wheel="handleWheel" @mousedown="startDrag" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <img loading="lazy" :src="photoUrl" :style="imgStyle" ref="image" @load="initialize" />
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
const props = defineProps({
  photoUrl: String,
  show: Boolean,
});
const scale = ref(1);
const position = reactive({ x: 0, y: 0 });
const dragging = ref(false);
const startPosition = reactive({ x: 0, y: 0 });
const startScale = ref(1);
const startDistance = ref(0);
const image = ref(null);
const container = ref(null);

const imgStyle = computed(() => ({
  transform: `scale(${scale.value}) translate(${position.x}px, ${position.y}px)`,
}));

// Наблюдаем за изменением масштаба, чтобы ограничивать позицию
watch(scale, () => {
  constrainPosition();
});

const getImageDimensions = () => {
  if (!image.value) return { width: 0, height: 0 };
  
  // Используем естественные размеры изображения
  const imgWidth = image.value.naturalWidth;
  const imgHeight = image.value.naturalHeight;
  
  // Получаем размеры контейнера
  const containerRect = image.value.parentElement?.getBoundingClientRect();
  if (!containerRect) return { width: 0, height: 0 };
  
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;
  
  // Определяем, как изображение вписывается в контейнер (с учетом object-fit: scale-down)
  let renderedWidth, renderedHeight;
  
  if (imgWidth > containerWidth || imgHeight > containerHeight) {
    const ratioX = containerWidth / imgWidth;
    const ratioY = containerHeight / imgHeight;
    const ratio = Math.min(ratioX, ratioY);
    
    renderedWidth = imgWidth * ratio;
    renderedHeight = imgHeight * ratio;
  } else {
    renderedWidth = imgWidth;
    renderedHeight = imgHeight;
  }
  
  return {
    renderedWidth,
    renderedHeight,
    containerWidth,
    containerHeight
  };
};

const handleWheel = (event) => {
  event.preventDefault();
  
  const delta = event.deltaY > 0 ? -0.1 : 0.1;
  const newScale = Math.min(Math.max(1, scale.value + delta), 3);
  
  // Рассчитываем позицию курсора относительно центра изображения
  const rect = image.value.getBoundingClientRect();
  const mouseX = event.clientX - rect.left - rect.width / 2;
  const mouseY = event.clientY - rect.top - rect.height / 2;
  
  // Сохраняем соотношение позиции курсора к изображению при масштабировании
  const scaleChange = newScale / scale.value;
  
  // Обновляем позицию так, чтобы точка под курсором оставалась на месте
  position.x = position.x - (mouseX / scale.value) * (scaleChange - 1);
  position.y = position.y - (mouseY / scale.value) * (scaleChange - 1);
  
  // Обновляем масштаб
  scale.value = newScale;
  
  // Ограничиваем позицию после обновления масштаба
  constrainPosition();
};

const startDrag = (event) => {
  event.preventDefault();
  if (scale.value <= 1) return; // Не позволяем перетаскивать при масштабе 1
  
  dragging.value = true;
  startPosition.x = event.type === 'mousedown' ? event.clientX : event.touches[0].clientX;
  startPosition.y = event.type === 'mousedown' ? event.clientY : event.touches[0].clientY;
  
  const move = (moveEvent) => {
    if (dragging.value) {
      const currentX = moveEvent.type === 'mousemove' ? moveEvent.clientX : moveEvent.touches[0].clientX;
      const currentY = moveEvent.type === 'mousemove' ? moveEvent.clientY : moveEvent.touches[0].clientY;
      
      const deltaX = (currentX - startPosition.x) / scale.value;
      const deltaY = (currentY - startPosition.y) / scale.value;
      
      position.x += deltaX;
      position.y += deltaY;
      
      // Ограничиваем позицию после перемещения
      constrainPosition();
      
      startPosition.x = currentX;
      startPosition.y = currentY;
    }
  };
  
  const endDrag = () => {
    dragging.value = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', move);
    document.removeEventListener('touchend', endDrag);
  };
  
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchmove', move);
  document.addEventListener('touchend', endDrag);
};

const handleTouchStart = (event) => {
  if (event.touches.length === 2) {
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const distanceX = Math.abs(touch1.clientX - touch2.clientX);
    const distanceY = Math.abs(touch1.clientY - touch2.clientY);
    startDistance.value = Math.sqrt(distanceX ** 2 + distanceY ** 2);
    startScale.value = scale.value;
  } else {
    startDrag(event);
  }
};

const handleTouchMove = (event) => {
  if (event.touches.length === 2) {
    event.preventDefault();
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const distanceX = Math.abs(touch1.clientX - touch2.clientX);
    const distanceY = Math.abs(touch1.clientY - touch2.clientY);
    const newDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
    const scaleFactor = newDistance / startDistance.value;
    
    // Получаем центр между двумя касаниями
    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;
    
    // Получаем координаты центра касания относительно изображения
    const rect = image.value.getBoundingClientRect();
    const touchCenterX = centerX - rect.left - rect.width / 2;
    const touchCenterY = centerY - rect.top - rect.height / 2;
    
    const newScale = Math.min(Math.max(1, startScale.value * scaleFactor), 3);
    const scaleChange = newScale / scale.value;
    
    // Обновляем позицию, чтобы центр касания оставался на месте
    position.x = position.x - (touchCenterX / scale.value) * (scaleChange - 1);
    position.y = position.y - (touchCenterY / scale.value) * (scaleChange - 1);
    
    scale.value = newScale;
    constrainPosition();
  }
};

const handleTouchEnd = (event) => {
  if (event.touches.length === 0) {
    startDistance.value = 0;
  }
};

const initialize = () => {
  scale.value = 1;
  position.x = 0;
  position.y = 0;
};

const constrainPosition = () => {
  // Если масштаб 1, сбрасываем позицию в центр
  if (scale.value <= 1) {
    position.x = 0;
    position.y = 0;
    return;
  }
  
  const { renderedWidth, renderedHeight, containerWidth, containerHeight } = getImageDimensions();
  
  // Вычисляем максимальное смещение
  const scaledWidth = renderedWidth * scale.value;
  const scaledHeight = renderedHeight * scale.value;
  
  // Отступ от края изображения до края контейнера при текущем масштабе
  const horizontalOffset = (scaledWidth - containerWidth) / 2 / scale.value;
  const verticalOffset = (scaledHeight - containerHeight) / 2 / scale.value;
  
  // Ограничиваем смещение, чтобы изображение не выходило за пределы контейнера
  if (horizontalOffset > 0) {
    position.x = Math.max(-horizontalOffset, Math.min(horizontalOffset, position.x));
  } else {
    position.x = 0;
  }
  
  if (verticalOffset > 0) {
    position.y = Math.max(-verticalOffset, Math.min(verticalOffset, position.y));
  } else {
    position.y = 0;
  }
};

onMounted(() => {
  window.addEventListener('resize', () => {
    constrainPosition();
  });
});
</script>
<style>
.photo-container {
  width: 100%;
  height: 100%;
  background: black;
  overflow: hidden;
  position: relative;
  cursor: grab;
}
.photo-container img {
  width: 100%;
  height: 100%;
  object-fit: scale-down;
  transition: transform 0.05s;
  transform-origin: center center;
}
</style>