<template>
  <div v-if="isPageLoaded" class="w-100 bg-white pd-thin gap-thin">
    
    <Block v-if="!MOBILE_APP" class="flex-nowrap mn-b-thin gap-thin flex-v-center flex">
      <h2 class="t-truncate mn-r-auto">
        {{ route.params.product ? products.state.current.name : 'Create Product' }}
      </h2>

      <Button 
        v-if="route.params.product"
        :submit="onDelete" 
        :callback="redirectTo"
        class="w-10 w-max-20r w-min-8r bg-red"
      >
        Delete 
      </Button>

      <Button 
        :submit="onSubmit" 
        :callback="redirectTo"
        class="w-10 w-max-20r w-min-8r bg-main"
      >
        Save
      </Button>
    </Block>

    <!-- Tab Navigation -->
    <Tab
      v-model:selected="activeTab"
      v-if="route.params.product"
      :tabs="[
        { label: 'Details', value: 'details' },
        { label: 'Variants', value: 'variants' },
        { label: 'Discounts', value: 'discounts' },
        { label: 'Recommended', value: 'recommended' },
        { label: 'Localization', value: 'localization' }
      ]"
      class="flex-child-default gap-micro scroll-hide bg-light radius-medium h-max pd-thin mn-b-thin o-x-scroll"
      classTab="bg-white"
    />

    <!-- Tab Content -->
    <div v-if="activeTab === 'details'" class="cols-1 gap-thin">
      <!-- Product Images -->
      <Block
        placeholder="The product doesn't have any images yet."
        class="h-min"
      >
        <EditImages 
          :images="products.state.current.images"
          :uploadPath="'photos'" 
          @update:images="(imagesNew) => { products.state.current.images = imagesNew }" 
        />
      </Block>

      <Block title="Categories">
        <BlockMultiselect
          v-model="products.state.current.category"
          placeholder="Search categories..."
          :multiple="true"
          :transform="(item) => ({ _id: item._id, name: item.name })"
          :store="{
            read: (options) => categories.actions.read(options),
            state: categories.state
          }"
          :options="{
            rootOnly: false,
            excludeChildren: false,
            limit: 50
          }"
          :skeleton="{
            hide: false,
            horizontal: true,
            class: 'radius-small',
            structure: [{ 
              block: 'text', size: 'large'
            }]
          }"
          :states="{
            empty: {
              title: 'No categories found',
              description: 'Try different search terms or create a new category',
              class: 'radius-small'
            }
          }"
          key="_id"
          :label="item => item.name"
          classSearch="bg-white radius-small"
          classSelected="bg-white pd-small radius-small"
          classDropdown="bg-white pd-small radius-medium bs-small"
          classItem="pd-small radius-small hover-bg-light cursor-pointer"
          classFeed="h-max-30r gap-thin flex-column flex o-scroll"
        >
          <!-- Слот для выбранных категорий -->
          <template #selected="{ item, clear }">
            <div class="flex-nowrap flex-v-center flex gap-thin">
              <span class="t-medium">{{ item?.name || item }}</span>
              <button 
                @click.stop="clear"
                class="i-small pd-micro bg-red radius-extra flex-center flex aspect-1x1 hover-scale-1"
              >
                <IconCross class="i-micro fill-white" />
              </button>
            </div>
          </template>
          
          <!-- Слот для элементов в списке -->
          <template #item="{ item }">
            <div class="flex-nowrap flex-v-center flex">
              <img 
                v-if="item.photo" 
                :src="(FILE_SERVER_URL || '') + item.photo"
                class="i-medium radius-small object-fit-cover mn-r-thin"
              />
              <div class="w-100">
                <p class="t-medium">{{ item.name }}</p>
                <p v-if="item.description" class="t-small t-transp">{{ item.description }}</p>
              </div>
            </div>
          </template>
        </BlockMultiselect>
      </Block>

      <!-- Product Profile -->
      <Block title="Profile">
        <div class="mn-b-thin flex-nowrap flex gap-thin">
          <Select 
            v-model:select="products.state.current.status"
            label="Status"
            :options="[
              'draft', 
              'published',
              'featured',
              'archived',
              'removed'
            ]"
            placeholder="Display product"
            class="pos-relative w-100 bg-white radius-small pd-medium"
          />
          <Select 
            v-model:select="products.state.current.listing"
            label="Type"
            :options="[
              'sale', 
              'rent',
            ]"
            placeholder="Type of listing"
            class="pos-relative w-100 bg-white radius-small pd-medium"
          />
        </div>

        <Field 
          v-model:field="products.state.current.name" 
          placeholder="Enter product name"
          class="w-100 mn-b-thin bg-white radius-small pd-medium"
        />
        <Field
          v-model:field="products.state.current.description" 
          placeholder="Enter product description" 
          class="w-100 bg-white radius-small mn-b-thin pd-medium"
          style="resize: vertical"
          type="textarea"
        />
        <Field
          v-model:field="products.state.current.included" 
          placeholder="Enter what's inside" 
          class="w-100 bg-white radius-small pd-medium"
          style="resize: vertical"
          type="textarea"
        />
      </Block>

      <!-- Price Block (only for new products) -->
      <Block v-if="!route.params.product" title="Price">
        <div class="flex gap-thin mn-b-thin">
          <Field
            v-model:field="products.state.current.defaultVariant.price"
            label="Price"
            type="number"
            placeholder="Enter price"
            class="w-100 bg-white radius-small pd-medium"
          />
          <Field
            v-model:field="products.state.current.defaultVariant.quantity"
            label="Quantity"
            type="number"
            placeholder="Enter quantity"
            class="w-100 bg-white radius-small pd-medium"
          />
          <Select
            v-model:select="products.state.current.defaultVariant.unit"
            label="Unit"
            :options="['pcs', 'g', 'kg', 'ml', 'l', 'oz']"
            placeholder="Select unit"
            class="w-100 bg-white radius-small pd-medium"
          />
        </div>
      </Block>

      <!-- Attributes -->
      <EditAttributes 
        v-model:attributes="products.state.current.attributes" 
      />
    </div>

    <!-- Variants Tab -->
    <EditVariants
			v-if="activeTab === 'variants'"
      v-model:variants="products.state.current.variants" 
    />

    <!-- Discounts Tab -->
    <EditDiscounts
			v-if="activeTab === 'discounts'"
      v-model:discounts="products.state.current.discounts"
    />
    <EditRecommended 
      v-if="activeTab === 'recommended'" 
      v-model:recommended="products.state.current.recommended"
      class="cols-1 gap-thin"
    />

    <!-- Localization Tab -->
    <Block
		  v-if="activeTab === 'localization'"
      title="Localization"
      placeholder="No localizations added yet"
      :actions="[{
        label: '+',
        function: () => products.state.current.translations.push({locale: '', name: '', description: ''})
      }]"
    >
      <div 
        class="gap-thin mn-b-thin flex-nowrap flex" 
        v-for="(item, index) in products.state.current.translations" 
        :key="index"
      > 
        <Field
          v-model:field="item.locale"
          placeholder="Locale (en, ru, etc.)"
          class="w-30 bg-white radius-small pd-medium"
        />  
        <Field
          v-model:field="item.name"
          placeholder="Product name"
          class="w-100 bg-white radius-small pd-medium"
        />
        <Field
          v-model:field="item.description"
          placeholder="Product description"
          class="w-100 bg-white radius-small pd-medium"
        />
        <div class="radius-small pd-small flex-center flex aspect-1x1 bg-red cursor-pointer hover-scale-1">
          <IconDelete 
            @click="() => products.state.current.translations.splice(index, 1)" 
            class="i-medium"
          />
        </div>
      </div>
    </Block>

    <!-- Bottom Action Buttons -->
    <div class="flex-nowrap flex gap-thin">
      <Button 
        v-if="route.params.product"
        :submit="onDelete" 
        class="bg-red t-white w-100"
      >
        Delete 
      </Button>

      <Button 
        :submit="onSubmit" 
        class="w-100 bg-main"
      >
        Save
      </Button>
    </div>
  </div>
</template>

<script setup>
// Import libs
import { reactive, computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Import components
import Block from '@martyrs/src/components/Block/Block.vue';
import Tab from "@martyrs/src/components/Tab/Tab.vue";
import Field from "@martyrs/src/components/Field/Field.vue";
import Select from '@martyrs/src/components/Select/Select.vue';
import Checkbox from "@martyrs/src/components/Checkbox/Checkbox.vue";
import Button from "@martyrs/src/components/Button/Button.vue";
import Tree from "@martyrs/src/components/Tree/Tree.vue";
import EditImages from '@martyrs/src/components/EditImages/EditImages.vue';

import BlockMultiselect from '@martyrs/src/modules/globals/views/components/blocks/BlockMultiselect.vue';
import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue';
import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';

import EditVariants from '@martyrs/src/modules/products/components/sections/EditVariants.vue';
import EditAttributes from '@martyrs/src/modules/products/components/sections/EditAttributes.vue';
import EditDiscounts from '@martyrs/src/modules/products/components/sections/EditDiscounts.vue';
import EditCategories from '@martyrs/src/modules/products/components/sections/EditCategories.vue';
import EditRecommended from '@martyrs/src/modules/products/components/sections/EditRecommended.vue';

// Accessing router and store
import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import * as products from '@martyrs/src/modules/products/store/products.js';
import * as categories from '@martyrs/src/modules/products/store/categories.js';

import { setError } from '@martyrs/src/modules/globals/views/store/globals.js'

const route = useRoute()
const router = useRouter()
const emits = defineEmits(['page-loading', 'page-loaded']);

let isPageLoaded = ref(false)
let activeTab = ref('details')

onMounted(async() => { 
  emits('page-loading');

  products.mutations.resetProduct();

  if (route.params.product) {
    await products.actions.read({ _id: route.params.product, lookup: ['variants','categories','recommended'] });
  } else {
  // Убедимся, что массивы инициализированы
  if (!products.state.current.translations) {
    products.state.current.translations = []
  }
  // Убедимся, что массивы инициализированы
  if (!products.state.current.recommended) {
    products.state.current.recommended = []
  }
  if (!products.state.current.discounts) {
    products.state.current.discounts = []
  }
  // Инициализируем defaultVariant для нового продукта
  if (!products.state.current.defaultVariant) {
    products.state.current.defaultVariant = {
      price: null,
      quantity: 1,
      unit: 'pcs'
    }
  }

  try {
    // Data prefetching
    categories.state.all = await categories.actions.read({
      user: auth.state.user._id,
      rootOnly: true,
      excludeChildren: false,
      limit: 100
    })
  } catch (error) {
    console.error('error loading categories:', error);
  }

  }

  emits('page-loaded');
  isPageLoaded.value = true
})

async function onSubmit() {
  try {
    if (route.params.product) {
      await products.actions.update(route.params.product, products.state.current)
    } else {
      products.state.current.owner = {
        target: route.params._id || auth.state.user._id,
        type: route.params._id ? 'organization' : 'user'
      }
      products.state.current.creator = {
        target: auth.state.user._id,
        type: 'user',
        hidden: false
      }
      
      // Передаем defaultVariant на бекенд при создании
      const productData = {
        ...products.state.current,
        defaultVariant: products.state.current.defaultVariant
      }
      
      await products.actions.create(productData)
    }
    
    redirectTo()
  } catch (error) {
    setError({ response: { data: { errorCode: "PRODUCT_NOT_CREATED" }} })
    console.error('Product creation error:', error)
  }
}

function onDelete() {
  products.actions.deleteProduct(products.state.current._id)
}

function redirectTo() {
  router.push({
    name: route.params._id ? 'Organization' : 'Products', 
    params: route.params._id ? { _id: route.params._id } : {}
  })
}
</script>