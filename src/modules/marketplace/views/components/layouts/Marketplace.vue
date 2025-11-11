<template>
  <div class="pos-relative">
    <header class="pd-medium mn-b-thin">
      <h2 class="">
        <span class="">Weed Deliveries in </span>

        <span
          v-if="localPosition.city || localPosition.state || localPosition.country"
          @click="a => { store.core.state.isOpenLocationPopup = true }"
          class="t-main t-semi cursor-pointer "
        >
          <template v-if="localPosition.city">{{localPosition.city}}, </template>
          <template v-if="localPosition.state">{{localPosition.state}}, </template>
          <template v-if="localPosition.country">{{localPosition.country}}</template>
        </span>

        <span v-else @click="a => { store.core.state.isOpenLocationPopup = true }"  class="t-main t-semi cursor-pointer">The World</span>
      </h2>
    </header>

    <div class="cols-2-1_3 br-1px br-solid br-light z-index-3 pos-relative">

      <div class="o-y-scroll br-r br-solid br-light pd-medium z-index-2 desktop-only h-100 pos-relative">
        <div class="w-100 o-y-scroll h-100">
          <!-- Location Filter -->
          <div class="mn-b-medium">
            <h4 class="mn-b-small">Location</h4>
            <Field
              v-model="searchLocation"
              placeholder="Search location..."
              type="text"
              class="w-100 bg-light pd-small radius-small mn-b-small"
            />
            <div class="gap-micro">
              <div
                v-for="location in marketplace.state.locationOptions"
                :key="location.label"
                @click="router.push(location.path)"
                class="cursor-pointer hover-t-underline mn-b-regular transition-all"
              >
                {{ location.label }}
              </div>
            </div>
          </div>

          <!-- Filters Group -->
          <FiltersGroup
            :filters="marketplace.state.filter.options"
            v-model:selected="selectedFilters"
            :immediate="true"
            :showHeader="false"
            :showApplyButton="false"
            :showResetButton="true"
          />
        </div>
      </div>

      <div class="w-100 rows-1 pd-thin pos-relative o-hidden">
        <Feed
          :search="true"
          v-model:sort="marketplace.state.sort"
          :showLoadMore="false"
          :states="{
            empty: {
              title: 'No Shops Found',
              description: 'Currently, there are no shops.'
            }
          }"
          :store="{
            read: (options) => marketplaceStore.readCatalog(options)
          }"
          :options="{
            country: localPosition.country,
            state: localPosition.state,
            city: localPosition.city,
            location: localLocation?.location,
            lookup: ['products','spots'],
            contain: ['products'],
            priceMin: selectedFilters.price?.min,
            priceMax: selectedFilters.price?.max,
            delivery: selectedFilters.delivery?.length > 0 ? selectedFilters.delivery.join(',') : undefined,
            payment: selectedFilters.payment?.length > 0 ? selectedFilters.payment.join(',') : undefined
          }"
          v-slot="{
            items
          }"
          class="rows-1 gap-thin"
        >
          <div class="mn-b-thin mobile-only">
            <Filters
              v-model:filters="marketplace.state.filter.options"
              v-model:selected="selectedFilters"
              class=""
            />
          </div>

          <CardOrganization
            v-for="organization in items"
            :key="organization._id"
            :organization="organization"
            :showRating="true"
            :showFollowers="false"
            :showProducts="true"
            class="bg-light w-100 o-hidden radius-medium pd-small "
          />
        </Feed>

      </div>
    </div>
  </div>

</template>


<script setup="props">
  // Import libs
  import { onMounted, watch, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  import Feed from '@martyrs/src/components/Feed/Feed.vue'
  import Filters  from '@martyrs/src/modules/core/views/components/sections/Filters.vue'
  import FiltersGroup from '@martyrs/src/modules/core/views/components/sections/filters/FiltersGroup.vue'
  import Field from "@martyrs/src/components/Field/Field.vue"

  import CardOrganization from '@martyrs/src/modules/organizations/components/blocks/CardOrganization.vue'

  import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js'
  import * as organization from '@martyrs/src/modules/organizations/store/organizations.js'
  import * as marketplace from '../../store/marketplace'
  import marketplaceStore from '../../store/marketplace'
  import { useGlobalMixins } from '@martyrs/src/modules/core/views/mixins/mixins.js'

  const route = useRoute()
  const router = useRouter()
  const store = useStore()
  const { returnCurrency } = useGlobalMixins()

  const localPosition = ref({
    city: null,
    state: null,
    country: null
  });

  const localLocation = ref(null);
  // Location filter
  const searchLocation = ref('');

  const selectedFilters = ref({
    price: { min: null, max: null },
    delivery: [],
    payment: [],
    availabilityDate: null,
    rating: null
  })


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

  function denormalizeUrlParam(param) {
    return param
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  function normalizeUrlParam(param) {
    return param
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

	watch(() => marketplace.state.sort, (newSortValue, oldSortValue) => {
		let query = { ...route.query}
		
		query.sortParam = newSortValue.param
		query.sortOrder = newSortValue.order
	  
	  // replace the current route
	  router.replace({ query });
	}, { deep: true });


	watch(() => marketplace.state.filter.selectedFilters, (newFilterValue, oldFilterValue) => {
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

	watch(() => store.core.state.position, (newPosition) => {
   // get the current route
   const currentRoute = { ...router.currentRoute.value };
	  
   // create new parameters based on globals state position
   let newParams = {
     country: normalizeUrlParam(newPosition.country),
     state: normalizeUrlParam(newPosition.state),
     city: normalizeUrlParam(newPosition.city),
   };

  let newState = {
    country: denormalizeUrlParam(newPosition.country),
    state: denormalizeUrlParam(newPosition.state),
    city: denormalizeUrlParam(newPosition.city),
  };
  
   // update route params
   localPosition.value = newState;
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


