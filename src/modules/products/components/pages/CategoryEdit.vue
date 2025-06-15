<template>
  <div v-if="!isLoading"  class="pd-thin bg-white for-transition w-100">
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
      <div class="mn-b-medium w-100 flex-nowrap gap-thin flex">
        <UploadImage 
           v-model:photo="categories.state.current.photo"
          :uploadPath="'categories'"
          class="w-8r aspect-1x1 o-hidden mn-r-small radius-extra" 
        />
       <Field
            v-model:field="categories.state.current.name"
            label="Name"
            placeholder="Enter category name"
            class="w-100 mn-b-small bg-white radius-small pd-medium"
          />  
      </div>

        <div class="mn-b-medium w-100 flex-nowrap gap-thin flex">


         <Field
            v-model:field="categories.state.current.order"
            label="Order"
            :disabled="true"
            class="w-40 bg-white radius-small pd-medium"
          />  
         <Field
            v-model:field="categories.state.current.url"
            label="URL"
            placeholder="Enter category URL"
            class="w-100 bg-white radius-small pd-medium"
          />  
         
      </div>

      <Select 
        v-model:select="categories.state.current.status"
        label="Status"
        :options="[
          'draft', 
          'internal',
          'published',
          'removed'
        ]"
        placeholder="Display product"
        class="pos-relative w-100 mn-b-small bg-white radius-small pd-medium"
      />

      <div class="flex-v-center flex-nowrap flex">
        <h4  class="mn-r-thin t-medium">Localization</h4>
          
        <button 
          @click="() => categories.state.current.translations.push({locale: '', text: ''})" 
          class="i-small pd-thin button-delete button"
        >
          +
        </button>
      </div>
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
        function: () => categories.state.current.filters.push({name: '', url: ''})
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
        <Field
          v-model:field="item.options"
          placeholder="Filter options divided by ,"
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
  import Feed from '@martyrs/src/components/Feed/Feed.vue'


  import Block from '@martyrs/src/components/Block/Block.vue';

  import IconCheckmark from '@martyrs/src/modules/icons/navigation/IconCheckmark.vue'

  // Import the new store structure
  import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'; 
  import * as categories from '@martyrs/src/modules/products/store/categories.js';

  const route = useRoute()
  const router = useRouter()

  const emits = defineEmits(['page-loading', 'page-loaded']);

  // Data prefetching
  const isLoading = ref(true)
  onMounted(async () => {
    emits('page-loading');
    if (route.params.category) {
      await categories.actions.read({url: route.params.category})
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
  globals.state.navigation_bar.actions = [{
    component: IconCheckmark,
    props: {
      fill: "rgb(var(--main))" 
    },
    condition: () => auth.state.user && auth.state.user._id,
    action: () => onSubmit()
  }],

 onUnmounted(() => {
    globals.state.navigation_bar.actions = [];
  });



  // Functions
  async function onSubmit() {
    if (route.params.category) {

      categories.state.current.creator = {
        type: categories.state.current.creator.type,
        hidden: categories.state.current.creator.hidden,
        target: categories.state.current.creator.target._id
      }

      categories.state.current.owner = {
        type: categories.state.current.owner.type,
        target: categories.state.current.owner.target._id
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
  /* Your styles here */
</style>
