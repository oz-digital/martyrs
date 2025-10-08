  <template>
    <div class="pd-medium bg-light radius-medium">
      <!-- Categories Filter -->
      <Spoiler 
        class="radius-small o-hidden mn-b-small"
        :status="true"
      >
        <template #header>
          <p class="cursor-pointer mn-r-auto t-medium p-medium">{{ t('categoriesTitle') }}</p>
          <!-- SVG Icon -->
        </template>
        <template #content>
          <Checkbox 
            v-for="(category, index) in  categories.state.all"
            :key="index"
            :label="category.name"
            :value="category.url"
            class="w-100 mn-t-small mn-b-small bg-white radius-small pd-small"
            :radio="marketplace.state.filter.categories"
            @update:radio="event => marketplace.state.filter.categories = event"
          />
        </template>
      </Spoiler>

      <hr class="mn-b-small t-transp">

      <!-- Prices Filter -->
      <Spoiler 
        class="radius-small o-hidden mn-b-small"
        :status="false"
      >
        <template #header>
          <p class="cursor-pointer  mn-r-auto t-medium p-medium">{{ t('filters.price.title') }}</p>
          <!-- SVG Icon -->
        </template>
        <template #content>
          <Checkbox 
            v-for="(price, index) in prices"
            :key="index"
            :label="price.label"
            :value="price.value"
            class="w-100 mn-t-small bg-white radius-small pd-small"
            :radio="marketplace.state.filter.prices"
            @update:radio="event => marketplace.state.filter.prices = event"
          />
        </template>
      </Spoiler>

      <hr class="mn-b-small">

      <!-- Delivery Filter -->
      <Spoiler 
        class="radius-small o-hidden mn-b-small"
        :status="false"
      >
        <template #header>
          <p class="cursor-pointer  mn-r-auto t-medium p-medium">Delivery</p>
        </template>
        <template #content>
          <Checkbox 
            v-for="(deliveryOption, index) in deliveryOptions"
            :key="index"
            :label="deliveryOption.label"
            :value="deliveryOption.value"
            class="w-100 mn-t-small bg-white radius-small pd-small"
            :radio="marketplace.state.filter.delivery"
            @update:radio="event => marketplace.state.filter.delivery = event"
          />
        </template>
      </Spoiler>

      <hr class="mn-b-semi">

      <!-- Reset filter -->
      <button @click="resetFilters" class="bg-main w-100 button">{{ t('filters.reset') }}</button>
    </div>
  </template>

<script setup>
import { ref, watch, onMounted } from 'vue'

import Spoiler from "@martyrs/src/components/Spoiler/Spoiler.vue"
import Checkbox from "@martyrs/src/components/Checkbox/Checkbox.vue"

import { useI18n } from 'vue-i18n'
import { useRoute, useRouter,onBeforeRouteLeave } from 'vue-router'

const route = useRoute()
const router = useRouter()

import * as categories from '@martyrs/src/modules/products/store/categories.js';
import * as marketplace from '@martyrs/src/modules/marketplace/views/store/marketplace.js';

let options = {
  status: 'published'
}

let selectedFilters = ref({
  categories: [],
  prices: [],
  delivery: [],
  extra: []
})

// Пропсы и данные, которые вы передаёте в компонент
const props = defineProps({
  selectedFilters: Object,
  prices: {
    type: Array,
    default: () => [
    { label: 'Under 300฿',        value: '<300' },
    { label: '300฿ to 600฿',      value: '300-600' },
    { label: '600฿ to 1200฿',     value: '600-1200' },
    { label: '$1200 and above',   value: '>1200' }
  ]
  },
  deliveryOptions: {
    type: Array,
    default: () => [
      { label: 'Pickup', value: { min: 0, max: 25 } },
      { label: 'Courier', value: { min: 25, max: 50 } },
      { label: 'Post', value: { min: 50, max: 100 } }
    ]
  }
})

watch(() => marketplace.state.filter, (newFilterValue, oldFilterValue) => {
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
  router.repalce({ query });
}, { deep: true })

onMounted(async () => {
  await categories.actions.read(options)
  
  if (route.query) {
    const query = route.query;
    const newFilterValue = {
      categories: query.categories ? query.categories.split(',') : [],
      prices: query.prices ? query.prices.split(',') : [],
      delivery: query.delivery ? query.delivery.split(',') : [],
      // Продолжайте этот паттерн для остальных полей фильтра
    };
    marketplace.state.filter.innerHTML = newFilterValue;
  }
})

const emit = defineEmits(['updateFilters', 'resetFilters'])

const emitFilterChange = (filterType, value) => {
  emit('updateFilters', { filterType, value })
}

const resetFilters = () => {
  emit('resetFilters')
}
const text = {
    locale: 'en',
    messages: {
      en: {
        categoriesTitle: 'Category',
        categories: [],
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
        categoriesTitle: 'Категория',
        categories: [],
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
    category.translations.forEach( localization => {
      text.messages[localization.locale].categories.push(localization.text)
    })
  })

  const { t } = useI18n(text)
  


// Добавьте свою локализацию и методы t, если они нужны
</script>

<style>
/* Ваши стили */
</style>
