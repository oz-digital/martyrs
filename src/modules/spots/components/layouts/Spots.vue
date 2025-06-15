<template>
	<div class="w-100 h-100">
		<!-- Catalog wrapper -->
		<div class="h-100 w-100 flex-nowrap flex-column flex gap-thin">

				<!-- Sorting section -->
				<div class="pos-absolute z-index-2 w-100">
	      	<h2 class="bg-black-transp-25 t-white pd-small w-100 bg-blur-big mn-l-auto mn-r-auto t-center">
	      		<span class="">Weed in </span>

	      		<span @click="a => { globals.state.isOpenLocationPopup = true }" v-if="localPosition.city || localPosition.state || localPosition.country" class="t-semi t-main">
      				<span v-if="localPosition.city">{{localPosition.city}}, </span>
      				<span v-if="localPosition.state">{{localPosition.state}}, </span>
      				<span v-if="localPosition.country">{{localPosition.country}}</span>
	      		</span>

	      		<span v-else @click="a => { globals.state.isOpenLocationPopup = true }"  class="t-semi t-main">
								The World
	      		</span>
	      	</h2>
					</div>


				<!-- <Filters/> -->

				<!-- Products section -->
				<router-view  v-slot="{ Component, route }">
					<transition name="scaleIn" mode="out-in">
						<component 
							ref="page" 
							:key="route.path" 
							:localPosition="localPosition" 
							:is="Component"
							:apiKey="GOOGLE_MAPS_API_KEY" 
      				:locale="$i18n.locale"
							class=""
						/>
					</transition>
				</router-view>

		</div>
	</div>
</template>


<script setup="props">
	// Import libs
	import { computed, onMounted, watch, watchEffect, ref } from 'vue'
	import { useRoute, useRouter,onBeforeRouteLeave } from 'vue-router'
	import { useI18n }    from 'vue-i18n'
  // Martyrs
	import Spoiler from "@martyrs/src/components/Spoiler/Spoiler.vue";
 	import Checkbox from "@martyrs/src/components/Checkbox/Checkbox.vue";
 	import Field from "@martyrs/src/components/Field/Field.vue";
 	// Partials
	import Breadcrumbs from '@martyrs/src/components/Breadcrumbs/Breadcrumbs.vue'
 	import Dropdown from "@martyrs/src/components/Dropdown/Dropdown.vue";

	import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
	import * as categories from '@martyrs/src/modules/products/store/categories.js';
	import * as marketplace from '@martyrs/src/modules/marketplace/views/store/marketplace.js';

	// Accessing router and store
	const route = useRoute()
	const router = useRouter()

	const localPosition = ref({
		city: null,
		state: null,
		country: null
	});


	function denormalizeUrlParam(param) {
	  return param
	    .replace(/-/g, ' ') // Замена дефисов на пробелы
	    .replace(/\b\w/g, l => l.toUpperCase()); // Преобразование первой буквы каждого слова в заглавную
	}

	onMounted(async () => {
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
		  const newFilterValue = {
		    categories: query.categories ? query.categories.split(',') : [],
		    prices: query.prices ? query.prices.split(',') : [],
		    delivery: query.delivery ? query.delivery.split(',') : [],
		    // Продолжайте этот паттерн для остальных полей фильтра
		  };
		  marketplace.state.filter.selected = newFilterValue;
		}


		// Data fetching
		await categories.actions.read()
	})

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
	  Object.assign(query, newQueryValues);

	  // Обновляем маршрут с новым query
	  router.push({ query });
	}, { deep: true })

	
	function normalizeUrlParam(param) {
	  return param
	    .toLowerCase() // Преобразование всех символов в нижний регистр
	    .replace(/ /g, '-') // Замена всех пробелов на дефисы
	    .replace(/[^a-z0-9-]/g, ''); // Удаление всех символов, которые не являются буквами, цифрами или дефисами
	}

	watch(() => globals.state.position, (newPosition) => {
	  // get the current route
	  const currentRoute = { ...router.currentRoute.value };
	  
	  // create new parameters based on globals state position
	  let newParams = {
	    country: normalizeUrlParam(newPosition.country),
	    state: normalizeUrlParam(newPosition.state),
	    city: normalizeUrlParam(newPosition.city),
	  };
	  	
	  // update route params
	  currentRoute.params = newParams;
	  
	  // replace the current route
	  router.replace(currentRoute);
	}, { deep: true });
	
  const text = {
    locale: 'en',
    messages: {
      en: {
	     	meta: {
          title: "Marketplace – Shop Our Wide Selection of Quality Weed for Delivery",
          description: "Browse our marketplace of top-grade weed strains and choose from a variety of delivery options. Order now and have your favorite strains delivered straight to your door. Safe, fast, and reliable.",
        },
      	breadcrumbs: {
      		home: 'Home',
      		store: 'Marketplace',
      	},
      	categoriesTitle: 'Category',
      	categories: [],
      	sort: {
      		price: 'By price',
      		newest: 'By newest',
      		popularity: 'By popularity'
      	},
      	filters: {
      		title: 'Filters',
      		price: {
      			title: 'Price',
      			from: 'From',
      			to: 'To'
      		},
      		filters: [],
      		reset: 'Reset Filters'
      	}
      },
      ru: {
	      meta: {
          title: "Маркетплейс – Выбирайте из нашего ассортимента качественной травки для доставки",
          description: "Маркетплейс – Изучите наши продукты высокого качества и выбирайте из различных вариантов доставки. Закажите сейчас и получите свои любимые сорта на дом. Безопасно, быстро и надежно.",
        },
      	breadcrumbs: {
      		home: 'Главная',
      		store: 'Маркетплейс',
      	},
      	categoriesTitle: 'Категория',
      	categories: [],
      	sort: {
      		price: 'По цене',
      		newest: 'По новизне',
      		popularity: 'По популярности'
      	},
      	filters: {
      		title: 'Фильтры',
      		price: {
      			title: 'Цена',
      			from: 'От',
      			to: 'До'
      		},
      		filters: [],
      		reset: 'Сбросить фильтры',
      	}
      }
    }
  }

 	categories.state.all.forEach( category => {
  	category.localization.forEach( localization => {
    	text.messages[localization.locale].categories.push(localization.text)
  	})
	})

 	const { t } = useI18n(text)

</script>

<style lang="scss">


</style>
