<template>
  <div class="h-100 pos-relative">
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

  <Tab 
    v-if="route.name !== 'Organization' &&  isAdmin"
    v-model:selected="tabProducts"
    :tabs="[
      { name: 'All',          value: 'all' },
      { name: 'Published',    value: 'published' },
      { name: 'Unpublished',  value: 'unpublished' }, 
      { name: 'Archivied',    value: 'archivied' } 
    ]"
    style="flex: 0 0 auto"
   class="

        p-medium
        br-t br-solid br-light 
        bg-white
        gap-micro pd-medium pd-t-thin pd-b-thin
        z-index-1

      "
      tabClass="bg-light  uppercase pd-small radius-small w-100"
  />

  <div class="cols-2-1_3 br-1px br-solid br-light h-100 z-index-3 pos-relative radius-medium">

  <div class="o-y-scroll br-r br-solid br-light pd-medium z-index-2 desktop-only h-100 pos-relative">
    <BlockFilter
      v-model:filter="products.state.filter"
      :options="products.state.filter.options"
      class="h-100 w-100"
    />
  </div>

    <div class="w-100 pd-thin h-max pos-relative o-hidden">
      <slot></slot>
      <div class="pos-relative w-100  z-index-3 radius-tl-big radius-tr-big">
        <BlockSearch 
          @search="debouncedSearch"
          placeholder="Enter product name"
          class="bg-light mn-b-thin h-4r"
        />
      </div>
      <Feed
        v-model:filter="products.state.filter"
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
          owner: route.params._id,
          categories: route.query.categories,
          filters: generateFilters(products.state.filter.selected),
          prices: route.query.prices,
          delivery: route.query.delivery,
          search: route.query.search,
          ...(tabProducts !== 'all' && { status: tabProducts })
          // user: user
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

  import CardProduct from '@martyrs/src/modules/products/components/blocks/CardProduct.vue'

  import IconPlus from '@martyrs/src/modules/icons/navigation/IconPlus.vue'

  // Accessing router and store
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
  import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
  import * as products from '@martyrs/src/modules/products/store/products.js';
  import * as marketplace from '@martyrs/src/modules/marketplace/views/store/marketplace.js';
  import * as categories from '@martyrs/src/modules/products/store/categories.js';

  const route = useRoute()
  const router = useRouter()

  // Tab logic
  const tabProducts = ref(route.query.tabProducts ? route.query.tabProducts : 'all')

  if (route.name !== 'Organization') route.query.tabProducts = tabProducts.value
  
  if (route.query) {
    const query = route.query;

    products.state.filter.selected.categories = query.categories ? query.categories.split(',') : [];
    products.state.filter.selected.prices = query.prices ? query.prices.split(',') : [];
    products.state.filter.selected.delivery = query.delivery ? query.delivery.split(',') : [];
    products.state.filter.selected.brand = query.brand ? query.brand.split(',') : [];
  }


  watch(tabProducts, (newValue) => {
    if (route.name !== 'Organization') router.replace({ query: { ...route.query, tabProducts: newValue } });
  });

  globals.state.navigation_bar.actions = [{
    component: IconPlus,
    props: {
      fill: "rgb(var(--main))" 
    },
    condition: () => auth.state.user && auth.state.user._id,
    action: () => route.params._id ? router.push({ name: 'Organization_ProductAdd', params: { _id: route.params._id} }) : router.push({ name: 'ProductAdd' })
  }],

  onMounted(async () => {
    let categoriesFilter = await categories.actions.read({rootOnly:true});

    categoriesFilter = categoriesFilter.map(category => ({
      value: category._id,
      label: category.name
    }));

    const index = products.state.filter.options.findIndex(option => option.value === 'categories');

    const categoryOption = {
      title: 'Categories',
      value: 'categories',
      options: categoriesFilter
    };

    if (index !== -1) {
        products.state.filter.options[index] = categoryOption;
    } else {
        products.state.filter.options.unshift(categoryOption);
    }
  })

  onUnmounted(() => {
    globals.state.navigation_bar.actions = [];
  });

  watch(() => products.state.sort, (newSortValue, oldSortValue) => {
    let query = { ...route.query}
    
    query.sortParam = newSortValue.param
    query.sortOrder = newSortValue.order
    
    // replace the current route
    router.replace({ query });
  }, { deep: true });


  watch(() => products.state.filter.selected, (newFilterValue, oldFilterValue) => {
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


function debounce(fn, delay) {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const debouncedSearch = debounce((search) => {
 let query = { ...route.query}
    
  query.search = search
  
  router.replace({ query });
}, 500);

</script>

<style lang="scss">


</style>
