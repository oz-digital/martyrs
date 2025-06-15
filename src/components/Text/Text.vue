<template>
  <span @click="toggleShow" class="">
    {{ shownText }}
    <span v-if="isTruncated && showToggleText" class="cursor-pointer t-second">{{ showMoreText }}</span>
  </span>
</template>

<script setup>
import { ref, computed } from 'vue';

// Максимальная длина, текст и опциональный параметр отображения текста переключателя, передаваемые как параметры
const props = defineProps({
  maxLen: { type: Number, required: true },
  text:   { type: String, required: true },
  showToggleText: { type: Boolean, default: false }
})

// Управление показом полного текста
const showFull = ref(false);

// Компонент вычисляет обрезанный текст
const truncatedText = computed(() => {
  return props.text.length > props.maxLen ? props.text.slice(0, props.maxLen) + '...' : props.text;
});
const fullText = computed(() => props.text);

// Переключение показа полного текста
const toggleShow = () => {
  showFull.value = !showFull.value;
};

// Текст, который нужно показать
const shownText = computed(() => showFull.value ? fullText.value : truncatedText.value);

// Вычисляем, когда текст обрезан
const isTruncated = computed(() => props.text.length > props.maxLen);

// Вычисляем текст для кнопки "Показать больше/Скрыть"
const showMoreText = computed(() => showFull.value ? 'Hide' : 'Show more');

</script>