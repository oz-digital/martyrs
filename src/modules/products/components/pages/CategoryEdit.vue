<template>
  <div v-if="!isLoading"  class="rows-auto pd-thin bg-white for-transition w-100">
    <Block v-if="!MOBILE_APP" class="radius-medium mn-b-thin flex-nowrap flex-v-center flex">
      <h1   class="mn-r-auto">
        {{route.params.category ? 'Edit Category' : 'Add Category'}}
      </h1>

      <Button 
        :submit="onSubmit"
        class="pd-small radius-medium bg-main t-black uppercase t-medium"
      >
        Save Category 
      </Button>
    </Block>
    
    <Block 
      title="Profile"
      class="mn-b-thin"
    >

      <Select 
        v-model:select="categories.state.current.status"
        label="Status"
        :options="[
          'draft', 
          'internal',
          'published',
          'removed'
        ]"
        placeholder="Select category"
        class="pos-relative mn-b-thin w-100 bg-white radius-small pd-medium"
      />

      <Field
        v-model:field="categories.state.current.name"
        label="Name"
        placeholder="Enter category name"
        class="w-100 mn-b-thin bg-white radius-small pd-medium"
      />  

      <div class="w-100 mn-b-thin bg-white radius-small pd-medium cols-1">
        <UploadImage 
          v-model:photo="categories.state.current.photo"
          :uploadPath="'categories'"
          :text="{
            title: 'Upload category image',
            subtitle: 'Supported: JPG, PNG, GIF. Max size: 5MB',
            buttonText: 'Select Image'
          }"
          class="pos-relative" 
        />
      </div>


      <Field
        v-if="route.params.category"
        v-model:field="categories.state.current.url"
        label="URL Path"
        :disabled="true"
        class="w-100 bg-white radius-small pd-medium mn-b-thin"
      />
      

      <div class="mn-b-thin w-100 flex-nowrap gap-thin flex">
       <Field
          v-model:field="categories.state.current.order"
          label="Order"
          :disabled="true"
          class="w-40 bg-white radius-small pd-medium"
        />  
       <Field
          v-model:field="categories.state.current.slug"
          label="Slug"
          placeholder="Enter category slug"
          :disabled="route.params.category ? true : false"
          class="w-100 bg-white radius-small pd-medium"
        />  
      </div>
      
    

      <!-- <div class="flex-v-center flex-nowrap flex">
        <h4  class="mn-r-thin t-medium">Localization</h4>
          
        <button 
          @click="() => categories.state.current.translations.push({locale: '', text: ''})" 
          class="i-small pd-thin button-delete button"
        >
          +
        </button>
      </div> -->
      <div 
        class="gap-thin mn-b-thin flex-nowrap flex" 
        v-for="(item, index) in categories.state.current.translations" 
        :key="index"
      > 
        <Field
          v-model:field="item.locale"
          placeholder="Locale"
          class="w-100 bg-white radius-small pd-medium"
        />  
        <Field
          v-model:field="item.text"
          placeholder="Text"
          class="w-100 bg-white radius-small pd-medium"
        />
        <div
          @click="() => categories.state.current.translations.splice(index, 1)"  
          class="radius-small pd-small flex-center flex aspect-1x1 bg-red"
        >
          <IconDelete 
            class="i-medium"
          />
        </div>
      </div>

      
    </Block>
     <!-- Filters -->
    <Block
      title="Filters"
      placeholder="No filters added yet"
      :actions="[{
        label: '+',
        function: () => categories.state.current.filters.push({name: '', options: []})
      }]"
    >
      <div 
        class="gap-thin mn-b-thin flex-nowrap flex" 
        v-for="(item, index) in categories.state.current.filters" 
        :key="index"
      > 
        <Field
          v-model:field="item.name"
          placeholder="Filter name"
          class="w-100 bg-white radius-small pd-medium"
        />  
        <FieldTags
          v-model="item.options"
          :placeholder="'Add filter options'"
          :separators="[',', ';']"
          :add-on-key="[13, ',', ';']"
          :max-tags="20"
          class="w-100 bg-white radius-small pd-medium"
        />
        <div
          @click="() => categories.state.current.filters.splice(index, 1)"  
          class="radius-small pd-small flex-center flex aspect-1x1 bg-red"
        >
          <IconDelete 
            class="i-medium"
          />
        </div>
      </div> 
    </Block>
  </div>
 
</template>

<script setup>
  // Import libs
  import { computed, onUnmounted, onMounted, ref } from 'vue'
  import { useRoute,useRouter } from 'vue-router'
  
  import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';

  import Button from "@martyrs/src/components/Button/Button.vue";
  import Select from "@martyrs/src/components/Select/Select.vue";
  import UploadImage from '@martyrs/src/components/UploadImage/UploadImage.vue';
  import Field from "@martyrs/src/components/Field/Field.vue";
  import FieldTags from "@martyrs/src/components/FieldTags/FieldTags.vue";
  import Feed from '@martyrs/src/components/Feed/Feed.vue'


  import Block from '@martyrs/src/components/Block/Block.vue';

  import IconCheckmark from '@martyrs/src/modules/icons/navigation/IconCheckmark.vue'

  // Import the new store structure
  import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js';
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
  import * as categories from '@martyrs/src/modules/products/store/categories.js';

  const route = useRoute()
  const router = useRouter()
  const store = useStore()

  const emits = defineEmits(['page-loading', 'page-loaded']);

  // Data prefetching
  const isLoading = ref(true)
  onMounted(async () => {
    emits('page-loading');
    if (route.params.category) {
      await categories.actions.read({_id: route.params.category})
    } else {
      categories.actions.clean() // Adjusted based on the new store's method to reset the category state
    }

    emits('page-loaded');
    isLoading.value = false
  })

  // Accessing state
  const category = computed(() => categories.state.current)
  const routePath = computed(() => route.name)

  // Navigation Bar
  store.core.state.navigation_bar.actions = [{
    component: IconCheckmark,
    props: {
      fill: "rgb(var(--main))"
    },
    condition: () => auth.state.user && auth.state.user._id,
    action: () => onSubmit()
  }],

 onUnmounted(() => {
    store.core.state.navigation_bar.actions = [];
  });



  // Functions
  async function onSubmit() {
    if (route.params.category) {

      categories.state.current.creator = {
        type: categories.state.current.creator.type,
        hidden: categories.state.current.creator.hidden,
        target: typeof categories.state.current.creator.target === 'object' 
          ? categories.state.current.creator.target._id 
          : categories.state.current.creator.target
      }

      categories.state.current.owner = {
        type: categories.state.current.owner.type,
        target: typeof categories.state.current.owner.target === 'object' 
          ? categories.state.current.owner.target._id 
          : categories.state.current.owner.target
      }
      
      // Очищаем filters от tiClasses перед отправкой
      if (categories.state.current.filters) {
        categories.state.current.filters = categories.state.current.filters.map(filter => ({
          ...filter,
          options: filter.options ? filter.options.map(opt => 
            typeof opt === 'string' ? opt : opt.text
          ) : []
        }));
      }

      await categories.actions.update(categories.state.current)

      redirectTo()
    } else {

      categories.state.current.creator = {
        type: 'user',
        hidden: false,
        target: auth.state.user._id
      }

      categories.state.current.owner = {
        type: route.params._id ? 'organization' : 'platform',
        hidden: false,
        target: route.params._id ? route.params._id : null
      }
      
      // Очищаем filters от tiClasses перед отправкой
      if (categories.state.current.filters) {
        categories.state.current.filters = categories.state.current.filters.map(filter => ({
          ...filter,
          options: filter.options ? filter.options.map(opt => 
            typeof opt === 'string' ? opt : opt.text
          ) : []
        }));
      }

      await categories.actions.create(categories.state.current)
      redirectTo()
    }
  }

  function redirectTo () {
    router.push({
      name: 'Categories', 
      params: { 
        _id: route.params._id
      } 
    })
  }
</script>

<style lang="scss">
.container {
  max-width: 100%;
  margin: auto;
}

.grid {
 
}

.square {
  aspect-ratio: 1 / 1;
  height: 100%;
  background: #ccc;
}
</style>
