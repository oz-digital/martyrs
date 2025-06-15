<template>
  <div class="skeleton-wrapper" :class="{ 'skeleton-wrapper--loading': loading }">
    <!-- Используем слот по умолчанию, если он есть -->
    <slot v-if="hasDefaultSlot && !structure.length"></slot>
    
    <!-- Создаем скелетон на основе переданной структуры, если слот пустой -->
    <div v-else-if="structure.length" class="skeleton-structure" :class="{ 'skeleton-structure--horizontal': horizontal }">
      <div 
        v-for="(item, index) in structure" 
        :key="index" 
        class="skeleton-item"
        :class="[
          `skeleton-item--${item.block}`,
          `skeleton-item--${item.size || 'medium'}`,
          { 'skeleton-item--rounded': item.rounded }
        ]"
        :style="item.style"
      ></div>
    </div>
    
    <!-- Если слот пустой и структура не определена - показываем дефолтный скелетон -->
    <div v-else class="skeleton-default">
      <div class="skeleton-item skeleton-item--text skeleton-item--small"></div>
      <div class="skeleton-item skeleton-item--text skeleton-item--medium"></div>
      <div class="skeleton-item skeleton-item--text skeleton-item--large"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, useSlots, computed, onMounted } from 'vue';

const slots = useSlots();

const props = defineProps({
  // Флаг загрузки, определяет, нужно ли показывать скелетон
  loading: {
    type: Boolean,
    default: false
  },
  // Структура скелетона, если не используется слот
  structure: {
    type: Array,
    default: () => []
  },
  // Горизонтальное расположение элементов (для карточек пользователей)
  horizontal: {
    type: Boolean,
    default: false
  },
  // Цвет фона карточки (светлый фон)
  cardColor: {
    type: String,
    default: 'rgb(var(--light))'
  },
  // Цвет блоков скелетона (серый)
  blockColor: {
    type: String,
    default: 'rgba(var(--white),0.25)'
  },
  // Цвет анимированной полосы (белый с прозрачностью)
  highlightColor: {
    type: String,
    default: 'rgba(var(--white), 0.9)'
  },
  // Скорость анимации в секундах
  animationDuration: {
    type: Number,
    default: 1.5
  },
  // Радиус закругления
  borderRadius: {
    type: String,
    default: '0.5rem'
  }
});

// Проверяем наличие слота по умолчанию
const hasDefaultSlot = computed(() => Boolean(slots.default));

// Применяем CSS переменные для настройки стилей
onMounted(() => {
  const root = document.documentElement;
  root.style.setProperty('--skeleton-card-color', props.cardColor);
  root.style.setProperty('--skeleton-block-color', props.blockColor);
  root.style.setProperty('--skeleton-highlight-color', props.highlightColor);
  root.style.setProperty('--skeleton-animation-duration', `${props.animationDuration}s`);
  root.style.setProperty('--skeleton-border-radius', props.borderRadius);
});
</script>

<style scoped>
.skeleton-wrapper {
  width: 100%;
  position: relative;
  background-color: var(--skeleton-card-color);
  padding: 1rem;
}

/* Стили для режима загрузки */
.skeleton-wrapper--loading ::v-deep(*) {
  color: transparent !important;
  border-color: transparent !important;
  position: relative;
}

.skeleton-wrapper--loading ::v-deep(img),
.skeleton-wrapper--loading ::v-deep(svg),
.skeleton-wrapper--loading ::v-deep(button),
.skeleton-wrapper--loading ::v-deep(a) {
  opacity: 0;
}

.skeleton-wrapper--loading ::v-deep(*::before),
.skeleton-wrapper--loading ::v-deep(*::after) {
  display: none !important;
}

.skeleton-wrapper--loading ::v-deep(*) {
  position: relative;
  background-color: var(--skeleton-block-color) !important;
  border-radius: var(--skeleton-border-radius);
  overflow: hidden;
}

.skeleton-wrapper--loading ::v-deep(*)::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  display: block !important;
  animation: shimmer var(--skeleton-animation-duration) infinite;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--skeleton-highlight-color) 50%,
    transparent 100%
  );
}

/* Стили для структурного скелетона */
.skeleton-structure {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

/* Горизонтальный скелетон для карточек пользователей */
.skeleton-structure--horizontal {
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
}

.skeleton-item {
  background-color: var(--skeleton-block-color);
  border-radius: var(--skeleton-border-radius);
  position: relative;
  overflow: hidden;
}

.skeleton-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  animation: shimmer var(--skeleton-animation-duration) infinite;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--skeleton-highlight-color) 50%,
    transparent 100%
  );
}

/* Типы блоков */
.skeleton-item--text {
  height: 1rem;
  width: 100%;
}

.skeleton-item--text-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.skeleton-item--image {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.skeleton-item--avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-item--button {
  height: 3rem;
  width: 8rem;
}

.skeleton-item--circle {
  border-radius: 50%;
}

.skeleton-item--action {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-item--actions-group {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.skeleton-item--square {
  aspect-ratio: 1 / 1;
}

/* Размеры */
.skeleton-item--small {
  width: 30%;
}

.skeleton-item--medium {
  width: 60%;
}

.skeleton-item--large {
  width: 100%;
}

.skeleton-item--rounded {
  border-radius: 50%;
}

/* Дефолтный скелетон */
.skeleton-default {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

/* Анимация движения полосы */
@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>