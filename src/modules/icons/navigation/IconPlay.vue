<script setup>
  const props = defineProps({
    fill: {
      type: String,
      default: 'rgb(var(--black))'
    },
  })
</script>

<template>
	<svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path :fill="fill" d="M0.764999 10.9248C0.431975 11.1329 0 10.8935 0 10.5008V0.5008C0 0.108082 0.431975 -0.13134 0.764999 0.0768003L8.765 5.0768C9.07833 5.27263 9.07833 5.72896 8.765 5.9248L0.764999 10.9248ZM7.5566 5.5008L1 1.40292V9.59868L7.5566 5.5008Z"/>
	</svg>
</template>