<template>
	<svg fill="none" height="40" viewBox="0 0 40 40" width="40" xmlns="http://www.w3.org/2000/svg"><path d="m20 0c-11.046 0-20 9.0085-20 20.1217 0 10.0428 7.314 18.3672 16.876 19.8783v-14.0631h-5.08v-5.8152h5.08v-4.4328c0-5.0425 2.984-7.82734 7.554-7.82734 2.188 0 4.476.39238 4.476.39238v4.94996h-2.52c-2.486 0-3.26 1.5514-3.26 3.143v3.7748h5.546l-.886 5.8152h-4.66v14.0631c9.56-1.5091 16.874-9.8375 16.874-19.8783 0-11.1132-8.954-20.1217-20-20.1217z" :fill="fill"/></svg>
</template>

<script setup>
    const props = defineProps({
      fill: {
        type: String,
        default: 'rgb(var(--black))'
      }
    })
</script>