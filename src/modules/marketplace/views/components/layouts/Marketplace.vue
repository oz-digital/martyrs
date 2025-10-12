<template>
	 <div class="cols-2-1_3 z-index-3 pos-relative radius-big">

		<div class="o-y-scroll br-r br-solid br-light pd-medium z-index-2 desktop-only h-100 pos-relative">
			<div class="w-100 o-y-scroll h-100">
				<!-- Categories -->
				<div class="mn-b-medium" v-if="currentCategories.length > 0">
					<h4 class="mn-b-small">
						{{ route.params.categoryPath ? 'Subcategories' : 'Categories' }}
					</h4>
					<div class="gap-micro">
						<div
							v-for="category in currentCategories"
							:key="category._id"
							@click="selectCategory(category)"
							class="pd-small radius-small cursor-pointer hover-bg-light transition-all"
						>
							{{ category.name }}
						</div>
					</div>
				</div>

				<!-- Location Filter -->
				<Spoiler 
					class="o-hidden mn-b-medium"
					:status="true"
				>
					<template #header="{ isOpen }">
						<div class="cursor-pointer w-100 flex-v-center flex-nowrap flex">
							<h4 class="w-100">Location</h4>
							<div class="h-2r w-2r flex-child-auto aspect-1x1 flex-center flex bg-light radius-extra">
								<IconChevronBottom :class="{ 'rotate-180 mn-t-micro-negative': isOpen }" fill="rgb(var(--black))" class="i-medium"/>
							</div>
						</div>
					</template>

					<template #content>
						<div class="mn-t-small">
							<Field
								v-model="searchLocation"
								placeholder="Search location..."
								type="text"
								class="w-100 bg-light pd-small radius-small mn-b-small"
							/>
							<Checkbox 
								v-for="location in locationOptions"
								:key="location"
								v-model:radio="selectedLocation"
								:label="location"
								:value="location"
								mode="radio"
								class="mn-b-micro"
							/>
						</div>
					</template>
				</Spoiler>

				<!-- Delivery Options -->
				<Spoiler 
					class="o-hidden mn-b-medium"
					:status="true"
				>
					<template #header="{ isOpen }">
						<div class="cursor-pointer w-100 flex-v-center flex-nowrap flex">
							<h4 class="w-100">Delivery Options</h4>
							<div class="h-2r w-2r flex-child-auto aspect-1x1 flex-center flex bg-light radius-extra">
								<IconChevronBottom :class="{ 'rotate-180 mn-t-micro-negative': isOpen }" fill="rgb(var(--black))" class="i-medium"/>
							</div>
						</div>
					</template>

					<template #content>
						<div class="mn-t-small">
							<Checkbox 
								v-for="option in deliveryOptions"
								:key="option.value"
								v-model:checkbox="selectedDeliveryOptions"
								:label="option.label"
								:value="option.value"
								mode="checkbox"
								class="mn-b-micro"
							/>
						</div>
					</template>
				</Spoiler>

				<!-- Payment Options -->
				<Spoiler 
					class="o-hidden mn-b-medium"
					:status="true"
				>
					<template #header="{ isOpen }">
						<div class="cursor-pointer w-100 flex-v-center flex-nowrap flex">
							<h4 class="w-100">Payment Options</h4>
							<div class="h-2r w-2r flex-child-auto aspect-1x1 flex-center flex bg-light radius-extra">
								<IconChevronBottom :class="{ 'rotate-180 mn-t-micro-negative': isOpen }" fill="rgb(var(--black))" class="i-medium"/>
							</div>
						</div>
					</template>

					<template #content>
						<div class="mn-t-small">
							<Checkbox 
								v-for="option in paymentOptions"
								:key="option.value"
								v-model:checkbox="selectedPaymentOptions"
								:label="option.label"
								:value="option.value"
								mode="checkbox"
								class="mn-b-micro"
							/>
						</div>
					</template>
				</Spoiler>

				<!-- Clear Filters Button -->
				<button 
					@click="clearFilters"
					class="bg-main w-100 button mn-t-medium"
				>
					Clear Filters
				</button>
				</div>
		</div>

		<!-- Catalog wrapper -->
		<div class="pd-thin">
			<header class="pd-medium radius-medium bg-light mn-b-thin">
	    	<h2 class="">
	    		<span class="">Weed Deliveries in </span>

	    		<span 
	    			v-if="localPosition.city || localPosition.state || localPosition.country"
	    			@click="a => { core.state.isOpenLocationPopup = true }" 
	    			class="t-main t-semi cursor-pointer "
	    		>
	  				<template v-if="localPosition.city">{{localPosition.city}}, </template>
	  				<template v-if="localPosition.state">{{localPosition.state}}, </template>
	  				<template v-if="localPosition.country">{{localPosition.country}}</template>
	    		</span>

	    		<span v-else @click="a => { core.state.isOpenLocationPopup = true }"  class="t-main t-semi cursor-pointer">The World</span>
	    	</h2>
			</header>

			<div class="rows-1">
				<router-view  v-slot="{ Component, route }">
					<component ref="page" :key="route" :localPosition="localPosition" :is="Component" />
				</router-view>
			</div>
		</div>
	</div>
</template>


<script setup="props">
	// Import libs
	import { computed, onMounted, watch, ref } from 'vue'
	import { useRoute, useRouter,onBeforeRouteLeave } from 'vue-router'
	import { useI18n } from 'vue-i18n'

	import Spoiler from "@martyrs/src/components/Spoiler/Spoiler.vue"
	import Field from "@martyrs/src/components/Field/Field.vue"
	import Checkbox from "@martyrs/src/components/Checkbox/Checkbox.vue"
	import IconChevronBottom from '@martyrs/src/modules/icons/navigation/IconChevronBottom.vue'

	import * as core from '@martyrs/src/modules/core/views/store/core.store.js'
  import * as categories from '@martyrs/src/modules/products/store/categories.js';


	import * as marketplace from '../../store/marketplace';

	// Accessing router and store
	const route = useRoute()
	const router = useRouter()

	const localPosition = ref({
		city: null,
		state: null,
		country: null
	});

	const desktopFilters = ref(null)

	// Categories
	const currentCategories = ref([]);
	const searchLocation = ref('');
	const selectedLocation = ref('All');
	const locationOptions = ref(['All', 'Phuket', 'Bangkok', 'Chiang Mai', 'Pattaya']);

	// Delivery options
	const deliveryOptions = ref([
		{ label: 'Pickup', value: 'pickup' },
		{ label: 'Delivery', value: 'delivery' },
		{ label: 'Dine-in', value: 'dinein' }
	]);
	const selectedDeliveryOptions = ref([]);

	// Payment options
	const paymentOptions = ref([
		{ label: 'Cash', value: 'cash' },
		{ label: 'Card', value: 'card' },
		{ label: 'Crypto', value: 'crypto' },
		{ label: 'Bank Transfer', value: 'transfer' }
	]);
	const selectedPaymentOptions = ref([]);

	const selectCategory = (category) => {
		// Implementation for category selection
		console.log('Category selected:', category);
	};

	const clearFilters = () => {
		selectedLocation.value = 'All';
		selectedDeliveryOptions.value = [];
		selectedPaymentOptions.value = [];
		searchLocation.value = '';
	};

	function denormalizeUrlParam(param) {
	  return param
	    .replace(/-/g, ' ') // Замена дефисов на пробелы
	    .replace(/\b\w/g, l => l.toUpperCase()); // Преобразование первой буквы каждого слова в заглавную
	}

	function normalizeUrlParam(param) {
	  return param
	    .toLowerCase()
	    .replace(/ /g, '-')
	    .replace(/[^a-z0-9-]/g, '');
	}

	if (route.params) {
    // Загружаем новые значения из параметров маршрута в состояние
    let newState = {
      country: denormalizeUrlParam(route.params.country),
      state: denormalizeUrlParam(route.params.state),
      city: denormalizeUrlParam(route.params.city),
    };

	  // Обновляем глобальное состояние
	  localPosition.value = newState;
	}

	if (route.query) {
	 	const query = route.query;

		marketplace.state.filter.selected.categories = query.categories ? query.categories.split(',') : [];
		marketplace.state.filter.selected.prices = query.prices ? query.prices.split(',') : [];
		marketplace.state.filter.selected.delivery = query.delivery ? query.delivery.split(',') : [];
	}

	if (route.query.sortParam) marketplace.state.sort.param = route.query.sortParam
	if (route.query.sortOrder) marketplace.state.sort.order = route.query.sortOrder

	onMounted(async () => {
	  let options = {
      status: 'published',
      rootOnly: true
    }

    let categoriesFilter = await categories.actions.read(options);

    categoriesFilter = categoriesFilter.map(category => ({
      value: category._id,
      label: category.name
    }));

    const index = marketplace.state.filter.options.findIndex(option => option.value === 'categories');

    const categoryOption = {
      title: 'Categories',
      value: 'categories',
      options: categoriesFilter
    };

    if (index !== -1) {
        marketplace.state.filter.options[index] = categoryOption;
    } else {
        marketplace.state.filter.options.unshift(categoryOption);
    }
	})

	watch(() => marketplace.state.sort, (newSortValue, oldSortValue) => {
		let query = { ...route.query}
		
		query.sortParam = newSortValue.param
		query.sortOrder = newSortValue.order
	  
	  // replace the current route
	  router.replace({ query });
	}, { deep: true });


	watch(() => marketplace.state.filter.selected, (newFilterValue, oldFilterValue) => {
	  // Переводим фильтр в формат query
	  const query = { ...route.query };

	  // Удаляем старые значения фильтра из query
	  Object.keys(oldFilterValue).forEach(key => {
	    if (query[key]) {
	      delete query[key];
	    }
	  });

	  // Добавляем новые значения фильтра в query
	  const newQueryValues = Object.fromEntries(
	    Object.entries(newFilterValue)
	      .filter(([key, value]) => Array.isArray(value) && value.length > 0)
	      .map(([key, value]) => [key, value.join(',')])
	  );

	  delete query.options;
	  Object.assign(query, newQueryValues);

	  // Обновляем маршрут с новым query
	  router.replace({ query });
	}, { deep: true })

	// watch(() => core.state.position, (newPosition) => {
	//   // get the current route
	//   const currentRoute = { ...router.currentRoute.value };
	  
	//   // create new parameters based on globals state position
	//   let newParams = {
	//     country: normalizeUrlParam(newPosition.country),
	//     state: normalizeUrlParam(newPosition.state),
	//     city: normalizeUrlParam(newPosition.city),
	//   };
	  
	//   // update route params
	//   currentRoute.params = newParams;
	  
	//   // replace the current route
	//   router.replace(currentRoute);
	// }, { deep: true });

  const text = {
    locale: 'en',
    messages: {
      en: {
	     	meta: {
          title: "Marketplace – Shop Our Wide Selection of Quality Weed for Delivery",
          description: "Browse our marketplace of top-grade weed strains and choose from a variety of delivery options. Order now and have your favorite strains delivered straight to your door. Safe, fast, and reliable.",
        }
      },
      ru: {
	      meta: {
          title: "Маркетплейс – Выбирайте из нашего ассортимента качественной травки для доставки",
          description: "Маркетплейс – Изучите наши продукты высокого качества и выбирайте из различных вариантов доставки. Закажите сейчас и получите свои любимые сорта на дом. Безопасно, быстро и надежно.",
        }
      }
    }
  }

 	const { t } = useI18n(text)
</script>

<style lang="scss">


</style>
