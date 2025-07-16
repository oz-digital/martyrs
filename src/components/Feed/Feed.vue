<template>
  <div v-if="search || date || (sort && !sort.hideButton)" style="transform: scale(1);" class="mn-b-thin pos-relative flex-nowrap flex gap-thin">

    <BlockSearch 
      v-if="search"
      :placeholder="search.placeholder || 'Search...'"
      :class="search.class || 'bg-light'"
      @search="updateSearch"
      :autofocus="search.autofocus"
    />

    <FiltersBar
      v-if="filter"
      v-model="filter.selected"
      :filters="filterConfig"
      :class="filter.class || 'mobile-only'"
    />

    <Dropdown 
      v-if="date"
      :label="{
        component: ButtonDate,
        props: { date: date }
      }" 
      :class="date.class || 'bg-light'"
      class="flex-child flex-child-shrink-0 pd-r-small pd-l-small pd-thin bg-light radius-medium"
      :align="search ? 'right' : 'left'"
    >

      <Calendar
        v-model:date="date"
        :locale="$i18n.locale"
        :allowRange="true"
        class="radius-medium w-100 o-hidden bg-light"
      />
    </Dropdown> 

    <!-- <template
      v-if="filter"
    >
      <div 
        :class="filter.class || 'bg-light'"
        class="flex-center flex pd-thin bg-light radius-medium aspect-1x1 h-100"
      >
        <IconFilter @click="() => filter.active = !filter.active" class="w-1r h-auto"/>
      </div>

    
      <BottomSheet
        :show="filter.active"
        @toggle="() => filter.active = false"
        class="z-index-10 pos-fixed pos-r-0"
        :class="{
          'pos-t-0':  filter.active,
          'pos-t-100': !filter.active
        }"
      >
        <BlockFilter
          v-model:filter="filter"
          :options="filter.options"
          @click_filter="() => { filter.active = false } "
          class="h-max w-100 pd-small pd-b-5r bg-light"
        />
      </BottomSheet>  
    </template> -->

    <Dropdown 
      v-if="sort && !sort.hideButton"
      :label="{
        component: ButtonSort,
        props: { order: sort.order },
        class: 'w-1r'
      }" 
      :class="sort.class || 'bg-light'"
      class="radius-medium aspect-1x1 h-100"
      :align="search ? 'right' : 'left'"
    >

      <BlockSorting
        v-model:param="sort.param"
        v-model:order="sort.order"
        :options="sort.options"
        class="h-100 pd-small radius-medium t-white bg-black"
      />
    </Dropdown> 

    <!-- Actions -->
    <template
      v-if="actions.length"
    >
      <template v-for="action in actions" :key="action.key">
        <div 
        :class="action.class || 'bg-light'"
        class="flex-center flex pd-thin bg-light radius-medium aspect-1x1 h-100"
      >
        <component
          :is="action.component"
          @click="action.handler"
          class="w-1r h-auto"
        >
        </component>

      </div>
      </template>
    </template>
  </div>

  <TransitionGroup 
    v-if="isLoading && !keepSlotVisible"
    tag="ul" 
    name="scaleTransition" 
    class="pos-relative z-index-1"
   :class="$attrs.class"
  >
    <Skeleton
      v-if="isLoading && !skeleton?.hide"
      v-for="i in currentLimit" 
      :structure="skeleton.structure"
      :horizontal="skeleton.horizontal"
      :loading="skeleton.apply_to_slot"
      :key="'skeleton-' + i"
      :class="replaceClasses('radius-medium bg-light pd-thin flex-child-default o-hidden d-block', skeleton.class)"
    />
    <Loader v-if="isLoading && skeleton?.hide"/>
  </TransitionGroup>

  <TransitionGroup 
    tag="ul" 
    v-else-if="itemsList.length < 1"
    name="feed"
  >
    <EmptyState
      v-if="!isLoading && itemsList.length < 1"
      :title="states.empty.title"
      :description="states.empty.description"
      :action="states.empty.action"
      :callback="states.empty.callback"
      :class="replaceClasses('pd-medium bg-light radius-medium', states.empty.class)"
    />
   </TransitionGroup>

  <TransitionGroup 
    v-else-if="!keepSlotVisible || !isLoading"
    tag="ul" 
    name="feed"
    :class="$attrs.class"
  >
    <slot
      :items="itemsList"
    >
    </slot>
  </TransitionGroup>

  <!-- Slot visible with overlay loader -->
  <div v-else class="pos-relative">
    <TransitionGroup 
      tag="ul" 
      name="feed"
      :class="$attrs.class"
    >
      <slot
        :items="itemsList"
      >
      </slot>
    </TransitionGroup>
    
    <!-- Overlay loader -->
    <div 
      v-if="isLoading && keepSlotVisible"
      class="pos-absolute pos-t-0 pos-l-0 w-100 h-100 flex-center bg-white-transp-90 z-index-10"
    >
      <Loader />
    </div>
  </div>

  <button
    v-if="showLoadMore && hasMoreItems && itemsList.length > 0 && !isLoadingExtra"
    @click="loadMoreItems"
    class="col-w-100 mn-t-thin w-100 t-black bg-main button"
  >
    Load More
  </button>

  <div v-else key="sentinel" ref="sentinel" class="sentinel"></div> 

  <div
    v-if="isLoadingExtra"
    class="col-w-100 w-100 pos-relative"
  >
    <Loader/>
  </div>
 

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

import SkeletonEvent from '@martyrs/src/modules/icons/skeletons/SkeletonEvent.vue'

import Loader from '@martyrs/src/components/Loader/Loader.vue';
import Skeleton from '@martyrs/src/components/Skeleton/Skeleton.vue';
import EmptyState from '@martyrs/src/components/EmptyState/EmptyState.vue';
import Dropdown from "@martyrs/src/components/Dropdown/Dropdown.vue";
import Calendar from '@martyrs/src/components/Calendar/Calendar.vue'
import BottomSheet from '@martyrs/src/components/BottomSheet/BottomSheet.vue';

import BlockSearch from '@martyrs/src/modules/globals/views/components/blocks/BlockSearch.vue'
import BlockSorting  from '@martyrs/src/modules/globals/views/components/blocks/BlockSorting.vue'
import BlockFilter  from '@martyrs/src/modules/globals/views/components/blocks/BlockFilter.vue'

import FiltersBar from '@martyrs/src/modules/globals/views/components/sections/Filters.vue'

import ButtonSort  from '@martyrs/src/modules/globals/views/components/elements/ButtonSort.vue'
import ButtonDate  from '@martyrs/src/modules/globals/views/components/elements/ButtonDate.vue'

import IconFilter from '@martyrs/src/modules/icons/navigation/IconFilter.vue'
import IconEvents from '@martyrs/src/modules/icons/entities/IconEvents.vue'

const search = defineModel('search')
const sort = defineModel('sort')
const filter = defineModel('filter')
const date = defineModel('date')
const items = defineModel('items')

// Внутреннее хранилище для случая, когда v-model:items не передан
const internalItems = ref([])

// Элегантное решение через computed
const itemsList = computed({
  get: () => items.value ?? internalItems.value,
  set: (val) => {
    if (items.value !== undefined) {
      items.value = val
    } else {
      internalItems.value = val
    }
  }
})

const filterConfig = computed(() => {
  if (!filter.value?.options) return []
  
  return filter.value.options.map(opt => ({
    key: opt.value,
    title: opt.title,
    type: 'options',
    options: opt.options || [],
    defaultValue: null
  }))
})

// Пропсы
const props = defineProps({
  showLoadMore: {
    type: Boolean,
    default: true
  },
  LoadMore: {
    type: Boolean,
    default: true
  },
  search: {
    type: [Boolean, Object],
    default: false
  },
  states: {
    type: Object,
    default: () => ({
      empty: {
        title: 'Nothing found',
        description: 'Sorry, nothing found',
      },
    }),
  },
  actions: {
    type: Array,
    default: () => []
  },
  skeleton: {
    type: Object,
    default: () => ({
      hide: false,
      horizontal: false,
      structure: [
        { block: 'text', size: 'medium' },
        { block: 'text', size: 'large' },
        { block: 'button', size: 'small' }
      ]
    }),
   
  },
  store: {
    type: Object,
    default: () => ({
      read: Function,
      state: Object,
    }),
  },
  external: {
    type: Boolean,
    default: false
  },
  options: {
    type: Object,
    default: () => ({
      category: null,
      limit: 10, 
      skip: 0 ,
      owner:  null,
      creator:  null,
      customer:  null,
      user:  null,
      status: null,
      period:  null,
      contain:  null,
    }),
  },
  keepSlotVisible: {
    type: Boolean,
    default: false
  },
});
  
const hasMoreItems = ref(false);

let isLoading = ref(true);
let isLoadingExtra = ref(false);
let sentinel = ref(null)

let currentSkip = ref(props.options.skip ? props.options.skip : 0);
let currentLimit = ref(props.options.limit ? props.options.limit : 10);

let currentSearch = ref('');
let isSearching = ref(false);

let requestId = 0;

function debounce(fn, delay) {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const debouncedSearch = debounce((value) => {
  isSearching.value = true;
  currentSearch.value = value;
  currentSkip.value = 0;
  currentLimit.value = 10;
  fetchItems();
}, 500);

function updateSearch(search) {
  debouncedSearch(search);
}

const removeNullValues = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value != null)
  );
};

const loadMoreItems = async () => {
  if (!hasMoreItems.value || isLoadingExtra.value) {
    return;
  }
  
  isLoadingExtra.value = true;
  
  const currentRequestId = ++requestId;

  currentSkip.value += currentLimit.value;
  
  try {
    const allParams = {
      skip: currentSkip.value,
      limit: currentLimit.value,
      search: currentSearch.value,
      dateStart: date.value?.start,
      dateEnd: date.value?.end,
      sortParam: sort.value?.param,
      sortOrder: sort.value?.order,
      ...props.options
    };

    const params = removeNullValues(allParams);

    const data = await props.store.read(params);

    if (currentRequestId !== requestId) {
      return;
    }

    if (data.length === 0) {
      hasMoreItems.value = false;
    } else if (data.length < currentLimit.value) {
      hasMoreItems.value = false;
    } else {
      hasMoreItems.value = true;
    }

    // Элегантное обновление через computed setter
    itemsList.value = [...itemsList.value, ...data];
    
  } catch (error) {
    console.error('Load more error:', error);
  } finally {
    if (currentRequestId === requestId) {
      isLoadingExtra.value = false;
    }
  }
};

const fetchItems = async () => {
  isLoading.value = true;
  
  const currentRequestId = ++requestId;
  
  if (isSearching.value) {
    itemsList.value = [];
    isSearching.value = false;
  }
  
  try {
    const allParams = {
      skip: currentSkip.value,
      limit: currentLimit.value,
      search: currentSearch.value,
      dateStart: date.value?.start,
      dateEnd: date.value?.end,
      sortParam: sort.value?.param,
      sortOrder: sort.value?.order,
      ...props.options
    };

    const params = removeNullValues(allParams);

    const data = await props.store.read(params);

    if (currentRequestId !== requestId) {
      return;
    }

    if (data.length === 0) {
      hasMoreItems.value = false;
    } else if (data.length < currentLimit.value) {
      hasMoreItems.value = false;
    } else {
      hasMoreItems.value = true;
    }

    // Элегантное обновление через computed setter
    itemsList.value = data;
    
  } catch (error) {
    console.error('Fetch error:', error);
  } finally {
    if (currentRequestId === requestId) {
      isLoading.value = false;
    }
  }
};

watch(
  [() => props.external, () => date.value, () => ({...sort.value}), () => ({...props.options})],
  ([newExternal, newDate, newSort, newOptions], [oldExternal, oldDate, oldSort, oldOptions]) => {
    if (
      newExternal !== oldExternal ||
      newDate !== oldDate ||
      newSort?.order !== oldSort?.order ||
      newSort?.param !== oldSort?.param ||
      JSON.stringify(newOptions) !== JSON.stringify(oldOptions)
    ) {
      currentSkip.value = 0;
      fetchItems();
    }
  },
  { deep: true }
);

let observer = null

onMounted(async () => {
  await fetchItems()

  if (typeof window !== 'undefined' && !props.showLoadMore && props.LoadMore) {
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        loadMoreItems()
      }
    })

    if (sentinel.value) observer.observe(sentinel.value)
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style>
.feed-move,
.feed-enter-active,
.feed-leave-active {
  transition: all 0.5s ease;
}

.feed-enter-from,
.feed-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.feed-leave-active {
  position: absolute;
}
</style>