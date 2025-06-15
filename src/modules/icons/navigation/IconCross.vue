<template>
	<svg 
		width="26"
		height="26" 
		viewBox="0 0 26 26" 
		fill="none" 
		xmlns="http://www.w3.org/2000/svg"
	>
		<path 
			:fill="fill"
			fill-rule="evenodd" 
			clip-rule="evenodd" 
			d="M12.9996 10.8L22.8994 0.900244L25.0993 3.1002L15.1995 13L25.0993 22.8998L22.8994 25.0998L12.9996 15.2L3.09976 25.0998L0.899801 22.8998L10.7996 13L0.899801 3.1002L3.09976 0.900244L12.9996 10.8Z"/>
	</svg>
</template>


<script setup>
	const props = defineProps({
	  fill: {
	    type: String,
	    default: 'rgb(var(--black))'
	  }
	})
</script>

