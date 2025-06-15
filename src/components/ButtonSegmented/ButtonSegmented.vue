<template>
	<div class="">
		<div class="flex-nowrap flex-v-center flex pos-relative">

			<div  
				v-for="(tab,index) in tabs" 
				:key="index" 
				@click="selectTab(index,tab)" 
				:class="{ 't-transp': index !== selectedTab }"
				class="z-index-1 t-center pd-small w-100">
				<label>{{tab.name}}</label>
			</div>

			<div 
				:style="tabSelectorStyle" 
				class="radius-extra bg-main t-white tab-selector">
			</div>
		</div>
	</div>
</template>


<script setup="props">
	import { ref, computed } from 'vue'

	const emit = defineEmits(['update:selected']);

	const props = defineProps({
		tabs: Array,
		selected: String,
		callback: Function
	})

	const selectedTab = ref(0)

	if (props.selected) {
		const selectedIndex = props.tabs.findIndex(tab => tab.value === props.selected)
		if (selectedIndex !== -1) {
			selectedTab.value = selectedIndex
		}
	}
	
	function selectTab(index,tab) {
	  selectedTab.value = index;
	  emit('update:selected', tab.value);
	  if (props.callback) props.callback()
	}

	function getTabSelectorLeftOffset(tabIndex) {
	  const tabWidthPercentage = 100 / props.tabs.length;
	  return `${tabWidthPercentage * tabIndex}%`;
	}

	function calculateTabWidth() {
	  return `${100 / props.tabs.length}%`;
	}

	const tabSelectorStyle = computed(() => {
	  const leftOffset = getTabSelectorLeftOffset(selectedTab.value);
	  return { left: leftOffset, width: calculateTabWidth() };
	});
</script>

<style lang="scss">
	.tab-selector {
		position: absolute;
		width: 50%;
		height: 100%;


		left: 0;
		top: 0;

		z-index: 0;

		transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
