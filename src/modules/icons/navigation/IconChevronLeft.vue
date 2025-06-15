<template>
	<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
	  <path :fill="fill" d="M54.7235 70.625L50.9735 74.0625C49.411 75.4688 47.0673 75.3125 45.661 73.75L16.7547 42.1875C15.661 40.9375 15.661 39.0625 16.7547 37.8125L45.661 6.25C47.0673 4.6875 49.411 4.53125 50.9735 5.9375L54.7235 9.375C56.286 10.625 56.4423 13.125 55.036 14.5312L31.5985 40L55.036 65.4688C56.4423 66.875 56.286 69.375 54.7235 70.625Z"/>
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