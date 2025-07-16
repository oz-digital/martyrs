<template>
  <div class="pos-relative">
    <header 
      v-if="route.name !== 'Organization' && !MOBILE_APP"
      class="pd-medium flex-v-center flex-nowrap flex"
    >
      <h2 class="mn-r-medium">Products</h2>
      <button 
        v-if="hasAccess(route.params._id, 'products', 'create', auth.state.accesses, auth.state.access.roles)"
        @click="$router.push({
          name: route.params?._id ? 'Organization_ProductAdd' : 'ProductAdd'
        })" 
        class="radius-100 i-big hover-scale-1 cursor-pointer t-white bg-second">
          +
      </button>
    </header>

    <div class="cols-2-1_3 br-1px br-solid br-light z-index-3 pos-relative">

      <div class="o-y-scroll br-r br-solid br-light pd-medium z-index-2 desktop-only h-100 pos-relative">
        <div class="w-100 o-y-scroll h-100">
          <!-- Категории -->
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
                <br>
                <span v-for="subcategory in category.children">{{subcategory.name}}</span>
              </div>
            </div>
          </div>

          <!-- Фильтры категории -->
          <Spoiler 
            v-for="filter in categoryFilters"
            :key="filter.name"
            class="o-hidden mn-b-medium"
            :status="true"
          >
            <template #header="{ isOpen }">
              <div class="cursor-pointer w-100 flex-v-center flex-nowrap flex">
                <h4 class="w-100">{{ filter.name }}</h4>
                <div class="h-2r w-2r flex-child-auto aspect-1x1 flex-center flex bg-light radius-extra">
                  <IconChevronBottom :class="{ 'rotate-180 mn-t-micro-negative': isOpen }" fill="rgb(var(--black))" class="i-regular"/>
                </div>
              </div>
            </template>

            <template #content>
              <div class="mn-t-small">
                <Checkbox 
                  v-for="option in filter.options"
                  :key="option.text || option"
                  v-model:radio="selectedFilters[filter.name]"
                  :label="option.text || option"
                  :value="option.text || option"
                  mode="checkbox"
                  class="mn-b-micro"
                />
              </div>
            </template>
          </Spoiler>
         

          <!-- Цена за сутки -->
          <Spoiler 
            class="o-hidden mn-b-medium"
            :status="true"
          >
            <template #header="{ isOpen }">
              <div class="cursor-pointer w-100 flex-v-center flex-nowrap flex">
                <h4 class="w-100">  Price</h4>
                <div class="h-2r w-2r flex-child-auto aspect-1x1 flex-center flex bg-light radius-extra">
                  <IconChevronBottom :class="{ 'rotate-180 mn-t-micro-negative': isOpen }" fill="rgb(var(--black))" class="i-regular"/>
                </div>
              </div>
            </template>

            <template #content>
              <div class="mn-t-small flex gap-thin">
                <Field
                  v-model="priceRange.min"
                  placeholder="From"
                  type="number"
                  class="w-50 bg-light pd-small radius-small"
                />
                <Field
                  v-model="priceRange.max"
                  placeholder="To"
                  type="number"
                  class="w-50 bg-light pd-small radius-small"
                />
              </div>
            </template>
          </Spoiler>

          <!-- Доступность -->
          <Spoiler 
            class="o-hidden mn-b-medium"
            :status="true"
          >
            <template #header="{ isOpen }">
              <div class="cursor-pointer w-100 flex-v-center flex-nowrap flex">
                <h4 class="w-100">Availability</h4>
                <div class="h-2r w-2r flex-child-auto aspect-1x1 flex-center flex bg-light radius-extra">
                  <IconChevronBottom :class="{ 'rotate-180 mn-t-micro-negative': isOpen }" fill="rgb(var(--black))" class="i-regular"/>
                </div>
              </div>
            </template>

            <template #content>
              <div class="mn-t-small">
                <div 
                  v-for="option in availabilityOptions"
                  :key="option.value"
                  @click="selectAvailabilityOption(option.value)"
                  :class="{ 'bg-light': selectedAvailability === option.value }"
                  class="pd-small radius-small cursor-pointer hover-bg-light transition-all mn-b-micro"
                >
                  {{ option.label }}
                </div>
                
                <div 
                  @click="() => { tempSelectedDates = selectedDates; showDatePickerPopup = true; }"
                  :class="{ 'bg-light': selectedAvailability === 'custom' }"
                  class="pd-small radius-small cursor-pointer hover-bg-light transition-all mn-b-micro"
                >
                  {{ selectedDates ? `${formatDate(selectedDates.start, { dayMonth: true, language: 'en' })} - ${formatDate(selectedDates.end, { dayMonth: true, language: 'en' })}` : 'Select dates'}} 
                </div>
              </div>
            </template>
          </Spoiler>

          <!-- Кнопка очистки фильтров -->
          <button 
            class="bg-main w-100 button mn-t-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

        <div class="w-100 rows-1 pd-thin  pos-relative o-hidden">
          <Filters
            v-model:filters="availableFilters"
            v-model:selected="selectedFilters"
          />
          <slot></slot>
          <!-- <div class="pos-relative w-100  z-index-3 radius-tl-big radius-tr-big">
            <BlockSearch 
              @search="debouncedSearch"
              placeholder="Enter product name"
              class="bg-light mn-b-thin h-4r"
            />
          </div> -->
          <div class="mn-b-thin w-100 o-y-scroll scroll-hide scroll-snap-type-x-mandatory scroll-pd-regular">
            <div class="gap-thin flex-nowrap flex">
              <div
                v-for="category in currentCategories"
                :key="category._id"
                @click="selectCategory(category)"
                class=" flex-child-default bg-light flex t-nowrap pd-medium radius-medium cursor-pointer hover-bg-light transition-all"
              >
                {{ category.name }}
              </div>
            </div>
          </div>
          <Feed
            :search="true"
            v-model:filter="products.state.filter"
            v-model:sort="products.state.sort"
            :showLoadMore="false"
            :states="{
              empty: {
                title: 'No Products Found',
                description: 'Currently, there are no products available.'
              }
            }"
            :store="{
              read: (options) => products.actions.read(options),
              state: products.state
            }"
            :options="{
              limit: 16,
              owner: route.name?.includes('Organization') ? route.params._id : null,
              search: route.query.search,
              lookup: ['variants','rents'],
              categories: route.params.categoryPath ? `/${route.params.categoryPath}` : null,
              filters: processedFilters,
              prices: processedPrices,
              dateStart: selectedDates?.start,
              dateEnd: selectedDates?.end
            }"
            v-slot="{ 
              items 
            }"
            class="cols-4 pos-relative w-100 rows-1 gap-thin"
           
          >
            <router-link  
              v-for="product in items" 
              :to="route.params._id ? { name: 'Organization_Product', params: { _id: route.params._id, product: product._id  } } : { name: 'Product', params: { product: product._id  } }"
               class="pos-relative h-100 w-100"
              >
              <CardProduct
                :key="product._id"
                :product="product"
                :user="auth.state.access"
                :organization="route.params._id"
                :access="hasAccess(route.params._id, 'products', 'edit', auth.state.accesses, auth.state.access.roles)"
                class="pos-relative  h-100 w-100 bg-light"
              />
            </router-link>
          </Feed>

        </div>
    </div>
  
    <!-- Date Picker Popup -->
    <Popup
      :isPopupOpen="showDatePickerPopup"
      @close-popup="showDatePickerPopup = false"
      class="pd-medium bg-white radius-medium"
      style="min-width: 350px;"
    >
      <h3 class="mn-b-medium">Select Date Range</h3>
      
      <Calendar
        v-model:date="tempSelectedDates"
        :allowRange="true"
        :disablePastDates="true"
        class="mn-b-medium"
      />
      
      <div class="flex gap-small">
        <button 
          @click="applyDateFilter"
          class="bg-main button flex-child-full"
        >
          Apply
        </button>
        <button 
          @click="showDatePickerPopup = false"
          class="bg-light button flex-child-full"
        >
          Cancel
        </button>
      </div>
    </Popup>
</div>

</template>


<script setup="props">
  // Import libs
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  // Import components
  import Tab from '@martyrs/src/components/Tab/Tab.vue'
  import Feed from '@martyrs/src/components/Feed/Feed.vue'

  import FilterProducts from '@martyrs/src/modules/products/components/sections/FilterProducts.vue'
  import BlockSearch from '@martyrs/src/modules/globals/views/components/blocks/BlockSearch.vue'
  import BlockFilter  from '@martyrs/src/modules/globals/views/components/blocks/BlockFilter.vue'
  import Filters  from '@martyrs/src/modules/globals/views/components/sections/Filters.vue'
  import Spoiler from "@martyrs/src/components/Spoiler/Spoiler.vue"
  import Field from "@martyrs/src/components/Field/Field.vue"
  import Calendar from "@martyrs/src/components/Calendar/Calendar.vue"
  import Popup from "@martyrs/src/components/Popup/Popup.vue"
  import Checkbox from "@martyrs/src/components/Checkbox/Checkbox.vue"

  import CardProduct from '@martyrs/src/modules/products/components/blocks/CardProduct.vue'

  import IconPlus from '@martyrs/src/modules/icons/navigation/IconPlus.vue'
  import IconChevronBottom from '@martyrs/src/modules/icons/navigation/IconChevronBottom.vue'

  // Accessing router and store
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
  import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
  import * as products from '@martyrs/src/modules/products/store/products.js';
  import * as categories from '@martyrs/src/modules/products/store/categories.js';
  import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js';

  const route = useRoute()
  const router = useRouter()
  const { generateFilters, formatDate } = useGlobalMixins()

  // Категории и фильтры
  const currentCategories = ref([]);
  const currentCategory = ref(null);
  const categoryFilters = ref([]);
  // const selectedFilters = ref({});

const availableFilters = ref([
  {
    title: 'Price',
    value: 'price',
    type: 'range',
    minPlaceholder: 'From',
    maxPlaceholder: 'To'
  },
  {
    title: 'Delivery',
    value: 'delivery',
    type: 'checkbox',
    options: [
      { label: 'Pickup', value: 'pickup' },
      { label: 'Courier', value: 'courier' },
      { label: 'Post', value: 'post' }
    ]
  },
  {
    title: 'Status',
    value: 'status',
    type: 'radio',
    options: [
      { label: 'Available', value: 'available' },
      { label: 'Out of Stock', value: 'out_of_stock' },
      { label: 'Coming Soon', value: 'coming_soon' }
    ]
  }
])

const selectedFilters = ref({
  price: { min: '', max: '' },
  delivery: [],
  status: null
})

    
  // Переменные фильтров
  const availabilityOptions = ref([
    { label: 'Available today', value: 'today' },
    { label: 'This week', value: 'week' },
    { label: 'This month', value: 'month' }
  ]);
  
  const selectedAvailability = ref('all');
  const showDatePickerPopup = ref(false);
  const selectedPeriod = ref(null);
  const selectedDates = ref(null);
  const tempSelectedDates = ref(null);
  
  const priceRange = ref({
    min: '',
    max: ''
  });

  // Computed property for processed filters
  const processedFilters = computed(() => {
    return generateFilters(selectedFilters.value);
  });

  const processedPrices = computed(() => {
    return priceRange.value.min || priceRange.value.max ? `${priceRange.value.min || 0}-${priceRange.value.max || 999999}` : null;
  });


  const processedLookups = computed(() => {
    const lookups = ['variants'];
    if (processedDates.value) {
      lookups.push('rents');
    }
    return lookups;
  });

  const loadCategoryData = async () => {
    const categoryPath = route.params.categoryPath;
    
    try {
      if (categoryPath) {
        // Загружаем категорию и её прямых детей
        const result = await categories.actions.read({ 
          url: `/${categoryPath}`,
          depth: 1,
          tree: false
        });
        
        if (result.length > 0) {
          currentCategory.value = result[0];
          currentCategories.value = result[0].children || [];
          categoryFilters.value = result[0].filters || [];
          
          // Initialize selected filters object
          const filtersObj = {};
          (result[0].filters || []).forEach(filter => {
            filtersObj[filter.name] = [];
          });
          selectedFilters.value = filtersObj;
        }
      } else {
        // Загружаем только корневые категории
        const result = await categories.actions.read({ 
          root: true,
          tree: false
        });
        
        currentCategories.value = result;
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      currentCategories.value = [];
    }
  };

  // Функция для выбора категории
  const selectCategory = (category) => {
    const categoryPath = category.url ? category.url.substring(1) : '';
      
    if (!categoryPath) {
      console.warn('No URL found for category:', category);
      return;
    }
    
    // Переходим к странице категории используя wildcard роут
    if (route.params._id) {
      router.push(`/organizations/${route.params._id}/products/categories/${categoryPath}`);
    } else {
      router.push(`/products/categories/${categoryPath}`);
    }
  };

  // Функция выбора опции доступности
  const selectAvailabilityOption = (value) => {
    selectedAvailability.value = value;
    const today = new Date();
    
    switch(value) {
      case 'today':
        selectedDates.value = {
          start: today,
          end: today
        };
        break;
      case 'week':
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        selectedDates.value = {
          start: today,
          end: weekEnd
        };
        break;
      case 'month':
        const monthEnd = new Date(today);
        monthEnd.setMonth(today.getMonth() + 1);
        selectedDates.value = {
          start: today,
          end: monthEnd
        };
        break;
    }
  };

  // Функция применения фильтра дат
  const applyDateFilter = () => {
    selectedDates.value = tempSelectedDates.value;
    selectedAvailability.value = 'custom';
    showDatePickerPopup.value = false;
  };

  globals.state.navigation_bar.actions = [{
    component: IconPlus,
    props: {
      fill: "rgb(var(--main))" 
    },
    condition: () => auth.state.user && auth.state.user._id,
    action: () => route.params._id ? router.push({ name: 'Organization_ProductAdd', params: { _id: route.params._id} }) : router.push({ name: 'ProductAdd' })
  }],

  onMounted(async () => {
    await loadCategoryData();
  })

  onUnmounted(() => {
    globals.state.navigation_bar.actions = [];
  });

</script>

<style lang="scss">


</style>
