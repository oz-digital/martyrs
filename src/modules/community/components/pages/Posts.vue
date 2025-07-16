<template>
  <div class="pos-relative">
    <header 
      v-if="route.name !== 'Organization' && !MOBILE_APP"
      class="pd-medium flex-v-center flex-nowrap flex"
    >
      <h2 class="mn-r-medium">Posts</h2>
      <button 
        v-if="hasAccess(route.params._id, 'posts', 'create', auth.state.accesses, auth.state.access.roles)"
        @click="$router.push({
          name: route.params?._id ? 'Organization_PostAdd' : 'CreateBlogPost'
        })" 
        class="radius-100 i-big hover-scale-1 cursor-pointer t-white bg-second">
          +
      </button>
    </header>

    <div class="cols-2-1_3 br-1px br-solid br-light z-index-3 pos-relative">

      <div class="o-y-scroll br-r br-solid br-light pd-medium z-index-2 desktop-only h-100 pos-relative">
        <div class="w-100 o-y-scroll h-100">
          <!-- Categories -->
          <div class="mn-b-medium">
            <h4 class="mn-b-small">Categories</h4>
            <div class="gap-micro">
              <div
                v-for="category in postCategories"
                :key="category.value"
                @click="selectCategory(category.value)"
                :class="{ 'bg-light': selectedCategory === category.value }"
                class="pd-small radius-small cursor-pointer hover-bg-light transition-all"
              >
                {{ category.label }}
              </div>
            </div>
          </div>

          <!-- Tags Filter -->
          <Spoiler 
            class="o-hidden mn-b-medium"
            :status="true"
          >
            <template #header="{ isOpen }">
              <div class="cursor-pointer w-100 flex-v-center flex-nowrap flex">
                <h4 class="w-100">Tags</h4>
                <div class="h-2r w-2r flex-child-auto aspect-1x1 flex-center flex bg-light radius-extra">
                  <IconChevronBottom :class="{ 'rotate-180 mn-t-micro-negative': isOpen }" fill="rgb(var(--black))" class="i-regular"/>
                </div>
              </div>
            </template>

            <template #content>
              <div class="mn-t-small">
                <Field
                  v-model="searchTag"
                  placeholder="Search tags..."
                  type="text"
                  class="w-100 bg-light pd-small radius-small mn-b-small"
                />
                <Checkbox 
                  v-for="tag in filteredTags"
                  :key="tag"
                  v-model:checkbox="selectedTags"
                  :label="tag"
                  :value="tag"
                  mode="checkbox"
                  class="mn-b-micro"
                />
              </div>
            </template>
          </Spoiler>

          <!-- Date Range Filter -->
          <Spoiler 
            class="o-hidden mn-b-medium"
            :status="true"
          >
            <template #header="{ isOpen }">
              <div class="cursor-pointer w-100 flex-v-center flex-nowrap flex">
                <h4 class="w-100">Date Range</h4>
                <div class="h-2r w-2r flex-child-auto aspect-1x1 flex-center flex bg-light radius-extra">
                  <IconChevronBottom :class="{ 'rotate-180 mn-t-micro-negative': isOpen }" fill="rgb(var(--black))" class="i-regular"/>
                </div>
              </div>
            </template>

            <template #content>
              <div class="mn-t-small">
                <div 
                  v-for="option in dateRangeOptions"
                  :key="option.value"
                  @click="selectDateRange(option.value)"
                  :class="{ 'bg-light': selectedDateRange === option.value }"
                  class="pd-small radius-small cursor-pointer hover-bg-light transition-all mn-b-micro"
                >
                  {{ option.label }}
                </div>
                
                <div 
                  @click="() => { tempSelectedDates = selectedDates; showDatePickerPopup = true; }"
                  :class="{ 'bg-light': selectedDateRange === 'custom' }"
                  class="pd-small radius-small cursor-pointer hover-bg-light transition-all mn-b-micro"
                >
                  {{ selectedDates ? `${formatDate(selectedDates.start, { dayMonth: true, language: 'en' })} - ${formatDate(selectedDates.end, { dayMonth: true, language: 'en' })}` : 'Select custom dates'}} 
                </div>
              </div>
            </template>
          </Spoiler>

          <!-- Author Filter -->
          <Spoiler 
            class="o-hidden mn-b-medium"
            :status="true"
          >
            <template #header="{ isOpen }">
              <div class="cursor-pointer w-100 flex-v-center flex-nowrap flex">
                <h4 class="w-100">Author</h4>
                <div class="h-2r w-2r flex-child-auto aspect-1x1 flex-center flex bg-light radius-extra">
                  <IconChevronBottom :class="{ 'rotate-180 mn-t-micro-negative': isOpen }" fill="rgb(var(--black))" class="i-regular"/>
                </div>
              </div>
            </template>

            <template #content>
              <div class="mn-t-small">
                <Checkbox 
                  label="My Posts Only"
                  v-model:checkbox="showMyPostsOnly"
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

      <div class="w-100 rows-1 pd-thin pos-relative o-hidden">
        <Filters
          v-model:filters="availableFilters"
          v-model:selected="selectedFilters"
        />

        <div class="mn-b-thin w-100 o-y-scroll scroll-hide scroll-snap-type-x-mandatory scroll-pd-regular">
          <div class="gap-thin flex-nowrap flex">
            <div
              v-for="category in postCategories"
              :key="category.value"
              @click="selectCategory(category.value)"
              :class="{ 'bg-main t-white': selectedCategory === category.value }"
              class="flex-child-default bg-light flex t-nowrap pd-medium radius-medium cursor-pointer hover-bg-light transition-all"
            >
              {{ category.label }}
            </div>
          </div>
        </div>

        <Feed
          :search="true"
          v-model:filter="blog.state.filter"
          v-model:sort="blog.state.sort"
          :showLoadMore="false"
          :states="{
            empty: {
              title: 'No Blog Posts Found',
              description: 'Currently, there are no posts available in this blog.'
            }
          }"
          :store="{
            read: (options) => blog.read(options),
            state: blog.state
          }"
          :options="{
            limit: 12,
            status: 'published',
            user: auth.state.user._id,
            owner: route.params._id || null,
            category: selectedCategory !== 'all' ? selectedCategory : null,
            tags: selectedTags.length > 0 ? selectedTags : null,
            author: showMyPostsOnly ? auth.state.user._id : null,
            dateStart: selectedDates?.start,
            dateEnd: selectedDates?.end,
            search: route.query.search
          }"
          v-slot="{ 
            items 
          }"
          class="cols-3 pos-relative w-100 rows-1 gap-thin"
        >
          <CardBlogpost 
            v-for="item in items" 
            :key="item._id" 
            :blogpost="item" 
            :user="auth.state.user._id" 
            class="h-max-40r bg-light radius-medium cursor-pointer hover-scale-1 transition-all"
            @click="$router.push({ 
              name: route.params._id ? 'Organization_BlogPost' : 'BlogPost', 
              params: { 
                _id: route.params._id,
                url: item.url 
              } 
            })"
          />
        </Feed>

        <button
          v-if="hasAccess(route.params._id, 'posts', 'create', auth.state.accesses, auth.state.access.roles)"
          @click="$router.push({
            name: route.params?._id ? 'Organization_PostAdd' : 'CreateBlogPost'
          })"
          class="mn-t-medium bg-main button w-100"
        >
          Create New Post
        </button>
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
        :disablePastDates="false"
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
  import Feed from '@martyrs/src/components/Feed/Feed.vue'
  import Filters from '@martyrs/src/modules/globals/views/components/sections/Filters.vue'
  import Spoiler from "@martyrs/src/components/Spoiler/Spoiler.vue"
  import Field from "@martyrs/src/components/Field/Field.vue"
  import Checkbox from "@martyrs/src/components/Checkbox/Checkbox.vue"
  import Calendar from "@martyrs/src/components/Calendar/Calendar.vue"
  import Popup from "@martyrs/src/components/Popup/Popup.vue"

  import CardBlogpost from '@martyrs/src/modules/community/components/blocks/CardBlogpost.vue'

  import IconPlus from '@martyrs/src/modules/icons/navigation/IconPlus.vue'
  import IconChevronBottom from '@martyrs/src/modules/icons/navigation/IconChevronBottom.vue'

  // Accessing router and store
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
  import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
  import * as blog from '@martyrs/src/modules/community/store/blogposts.js';
  import * as organizations from '@martyrs/src/modules/organizations/store/organizations.js';
  import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js';

  const route = useRoute()
  const router = useRouter()
  const { hasAccess, formatDate } = useGlobalMixins()

  // Props
  const props = defineProps({
    organization: {
      type: Object,
      default: null
    }
  })

  // Categories
  const postCategories = ref([
    { label: 'All Posts', value: 'all' },
    { label: 'News', value: 'news' },
    { label: 'Updates', value: 'updates' },
    { label: 'Events', value: 'events' },
    { label: 'Announcements', value: 'announcements' },
    { label: 'Stories', value: 'stories' }
  ]);
  const selectedCategory = ref('all');

  // Tags
  const searchTag = ref('');
  const selectedTags = ref([]);
  const availableTags = ref(['featured', 'important', 'trending', 'community', 'official']);
  const filteredTags = computed(() => {
    if (!searchTag.value) return availableTags.value;
    return availableTags.value.filter(tag => 
      tag.toLowerCase().includes(searchTag.value.toLowerCase())
    );
  });

  // Date Range
  const dateRangeOptions = ref([
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' }
  ]);
  const selectedDateRange = ref('all');
  const showDatePickerPopup = ref(false);
  const selectedDates = ref(null);
  const tempSelectedDates = ref(null);

  // Author
  const showMyPostsOnly = ref(false);

  const availableFilters = ref([
    {
      title: 'Category',
      value: 'category',
      type: 'radio',
      options: postCategories.value
    },
    {
      title: 'Status',
      value: 'status',
      type: 'radio',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
        { label: 'Archived', value: 'archived' }
      ]
    }
  ])

  const selectedFilters = ref({
    category: 'all',
    status: 'published'
  })

  const selectCategory = (category) => {
    selectedCategory.value = category;
    selectedFilters.value.category = category;
  };

  const selectDateRange = (range) => {
    selectedDateRange.value = range;
    const today = new Date();
    
    switch(range) {
      case 'all':
        selectedDates.value = null;
        break;
      case 'today':
        selectedDates.value = {
          start: today,
          end: today
        };
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        selectedDates.value = {
          start: weekStart,
          end: today
        };
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        selectedDates.value = {
          start: monthStart,
          end: today
        };
        break;
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        selectedDates.value = {
          start: yearStart,
          end: today
        };
        break;
    }
  };

  const applyDateFilter = () => {
    selectedDates.value = tempSelectedDates.value;
    selectedDateRange.value = 'custom';
    showDatePickerPopup.value = false;
  };

  const clearFilters = () => {
    selectedCategory.value = 'all';
    selectedTags.value = [];
    selectedDateRange.value = 'all';
    selectedDates.value = null;
    showMyPostsOnly.value = false;
    searchTag.value = '';
    selectedFilters.value = {
      category: 'all',
      status: 'published'
    };
  };

  globals.state.navigation_bar.actions = [{
    component: IconPlus,
    props: {
      fill: "rgb(var(--main))" 
    },
    condition: () => auth.state.user && auth.state.user._id,
    action: () => route.params._id ? router.push({ name: 'Organization_PostAdd', params: { _id: route.params._id} }) : router.push({ name: 'CreateBlogPost' })
  }]

  onMounted(async () => {
    if (route.params._id) {
      await organizations.actions.read({ _id: route.params._id });
    }
  })

  onUnmounted(() => {
    globals.state.navigation_bar.actions = [];
  });
</script>

<style lang="scss">
</style>