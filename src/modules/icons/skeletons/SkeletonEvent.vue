<template>
  <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- Фоновый прямоугольник для всей карточки -->
    <rect x="0" y="0" rx="5" ry="5" width="100" height="100" fill="rgb(var(--light))" />
    
    <!-- Имитация квадратного изображения -->
    <rect x="10" y="10" rx="5" ry="5" width="50" height="50" fill="rgba(var(--black),0.05)" />
    
    <!-- Имитация текста под изображением (две полоски) -->
    <rect x="10" y="70" rx="3" ry="3" width="80" height="5" fill="rgba(var(--black),0.05)" />
    <rect x="10" y="80" rx="3" ry="3" width="80" height="5" fill="rgba(var(--black),0.05)" />
    
    <!-- Блик с анимацией движения -->
    <rect x="-25" y="0" width="25" height="100" fill="rgb(var(--white))" opacity="0.3">
      <animate attributeName="x" from="-25" to="100" dur="2s" repeatCount="indefinite" />
    </rect>
  </svg>
</template>