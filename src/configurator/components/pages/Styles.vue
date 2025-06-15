<template>
	<h2 class="mn-b-small ">Colors</h2>
	<div v-for="color in colors" class="bg-light radius-big pd-medium mn-b-small mn-b-big cols-1">
		<div class="flex-nowrap flex">
			<div
				:class="`i-medium flex-center flex radius-big bg-${color.name}`"
			>
			</div>
			<h3 class="mn-b-medium ">{{color.name}}</h3>
		</div>
		
		<div class="flex-nowrap flex">
			<div 
				v-for="subcolor in color.colors"
				:class="`mn-r-small w-100 h-8r flex-center flex radius-big bg-${subcolor}`"
			>
				<span class="uppercase t-semi p-small">{{subcolor}}</span>
			</div>
		</div>
	</div>
</template>

<script setup>

	let colors = [
		{
			name: 'main',
			colors: [
				'main-extra',
				'main-big',
				'main-semi',
				'main-medium',
				'main-regular',
				'main-small',
				'main-thin',
				'main-micro',
				'main-nano',
			],
		},
		{
			name: 'second',
			colors: [
				'second-extra',
				'second-big',
				'second-semi',
				'second-medium',
				'second-regular',
				'second-small',
				'second-thin',
				'second-micro',
				'second-nano',
			],
		},
		{
			name: 'third',
			colors: [
				'third-extra',
				'third-big',
				'third-semi',
				'third-medium',
				'third-regular',
				'third-small',
				'third-thin',
				'third-micro',
				'third-nano',
			],
		},
		{
			name: 'fourth',
			colors: [
				'fourth-extra',
				'fourth-big',
				'fourth-semi',
				'fourth-medium',
				'fourth-regular',
				'fourth-small',
				'fourth-thin',
				'fourth-micro',
				'fourth-nano',
			],
		},
		{
			name: 'fifth',
			colors: [
				'fifth-extra',
				'fifth-big',
				'fifth-semi',
				'fifth-medium',
				'fifth-regular',
				'fifth-small',
				'fifth-thin',
				'fifth-micro',
				'fifth-nano',
			],
		},
		{
			name: 'black',
			colors: [
				'black-extra',
				'black-big',
				'black-semi',
				'black-medium',
				'black-regular',
				'black-small',
				'black-thin',
				'black-micro',
				'black-nano',
			],
		},
		{
			name: 'white',
			colors: [
				'white-extra',
				'white-big',
				'white-semi',
				'white-medium',
				'white-regular',
				'white-small',
				'white-thin',
				'white-micro',
				'white-nano',
			],
		},
		{
			name: 'white',
			colors: [
				'white-transp-10',
				'white-transp-20',
				'white-transp-30',
				'white-transp-40',
				'white-transp-50',
				'white-transp-60',
				'white-transp-70',
				'white-transp-80',
				'white-transp-90',
			],
		},
		// 'l-main',
		// 'second',
		// 'l-second',
		// 'transparent',
		// 'black',
		// 'grey',
		// 'light',
		// 'white',
		// 'red',
		// 'light-red'
	]

</script>

	--main:      		0,255,136; 
	--light-main:  		rgb(var(--main)), 0.1;
	--second:    		34,102,255;
	--light-second: 	rgb(var(--second)), 0.1;
	--transparent:   0,0,0,0;
	// Main and secondary colors

	// Black and white colors
	--black:      		10,10,10;
	--dark:      		36,36,36; 	
	--grey:      		245,249,247; 
	--light:     		249,251,252; 
	--white:     		255,255,255;
	// Tones
	--red: 				255,20,20;
	--light-red: 		255,235,235;
	// For brands
	--youtube:			252,13,27;
	--telegram:			linear-gradient(0deg, #1D93D2 0%, #38B0E3 100%), #000000;
	--twitter:			29,155,240;
	--instagram:		233,89,80;
	--reddit:			255,69,0;