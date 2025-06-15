<template>
	<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g transform="rotate(90 40 40)">
			<path :fill="fill" d="M16.25 9.375L20 5.9375C21.5625 4.53125 23.9062 4.6875 25.3125 6.25L54.2188 37.8125C55.3125 39.0625 55.3125 40.9375 54.2188 42.1875L25.3125 73.75C23.9062 75.3125 21.5625 75.4688 20 74.0625L16.25 70.625C14.6875 69.375 14.5312 66.875 15.9375 65.4688L39.375 40L15.9375 14.5312C14.5312 13.125 14.6875 10.625 16.25 9.375Z"/>
		</g>
	</svg>
</template>

<script>
	export default {
	  props: {
	    fill: {
	      type: String,
	      default: 'rgb(var(--black)'
	    }
	  }
	}
</script>
