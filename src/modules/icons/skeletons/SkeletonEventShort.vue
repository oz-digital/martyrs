<template>
  <svg width="100%" height="50" xmlns="http://www.w3.org/2000/svg">
    <!-- Фоновый прямоугольник для всей строки -->
    <rect x="0" y="0" width="100%" height="100%" fill="rgb(var(--light))"/>

    <!-- Имитация времени -->
    <rect x="15" y="15" rx="3" ry="3" width="40" height="20" fill="rgba(var(--black),0.05)"></rect>

    <!-- Имитация названия ивента -->
    <rect x="65" y="15" rx="3" ry="3" width="150" height="20" fill="rgba(var(--black),0.05)"></rect>
    <!-- Имитация кружочков-аватарок -->
    <circle cx="250" cy="25" r="10" fill="rgba(var(--black),0.1)"></circle>
    <circle cx="265" cy="25" r="10" fill="rgba(var(--black),0.05)"></circle>
    <circle cx="280" cy="25" r="10" fill="rgba(var(--black),0.025)"></circle>

    <!-- Блик с анимацией движения -->
    <rect x="-25%" y="0" width="25%" height="100%" fill="rgb(var(--light))" opacity="0.3">
      <animate attributeName="x" from="-25%" to="100%" dur="2s" repeatCount="indefinite"></animate>
    </rect>
  </svg>

</template>