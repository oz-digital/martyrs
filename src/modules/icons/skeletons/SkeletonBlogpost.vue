<template>
  <svg width="100%" height="20rem" xmlns="http://www.w3.org/2000/svg">
    <!-- Фоновый прямоугольник для всей карточки -->
    <rect x="0" y="0" rx="5" ry="5" width="100%" height="100%" fill="rgb(var(--light))"/>
    
    <!-- Имитация шапки карточки -->
    <rect x="15" y="15" rx="4" ry="4" width="40%" height="20" fill="rgba(var(--black),0.05)"></rect>
    
    <!-- Имитация изображения -->
    <rect x="15" y="45" rx="5" ry="5" width="70%" height="50" fill="rgba(var(--black),0.05)"></rect>
    
    <!-- Имитация текста под изображением -->
    <rect x="15" y="110" rx="3" ry="3" width="90%" height="6" fill="rgba(var(--black),0.05)"></rect>
    <rect x="15" y="130" rx="3" ry="3" width="70%" height="6" fill="rgba(var(--black),0.05)"></rect>
    
    <!-- Блик с анимацией движения -->
    <rect x="-25%" y="0" width="25%" height="100%" fill="rgb(var(--light))" mask="url(#myMask)" opacity="0.3">
      <animate attributeName="x" from="-25%" to="100%" dur="2s" repeatCount="indefinite"></animate>
    </rect>
  </svg>
</template>