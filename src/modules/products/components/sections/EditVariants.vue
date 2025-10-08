<template>
  <Block
    title="Variants"
    placeholder="No variants added yet. At least one variant is required."
    :actions="[{
      label: '+',
      function: () => openVariantPopup()
    }]"
  >
    <!-- is {{currentVariants}} -->
    <Feed
      v-model:items="currentVariants"
      :store="variants"
      :options="{
        product: route.params.product,
      }"
      :skeleton="{
        structure: [
          { block: 'text', size: 'small' },
          { block: 'text', size: 'medium' },
          { block: 'text', size: 'small' }
        ]
      }"
      :states="{
        empty: {
          title: 'No variants',
          description: 'Create your first variant'
        }
      }"
    >
      <template #default="{ items }">
        <li
          v-for="variant in items"
          :key="variant._id"
          class="bg-white radius-small pd-small flex-nowrap flex-v-center flex gap-thin mn-b-thin"
        >
          <div class="aspect-1x1 h-3r flex-child-default radius-small o-hidden">
            <img
              v-if="variant.images?.length > 0"
              :src="(FILE_SERVER_URL || '') + variant.images[0]"
              alt="Variant image"
              class="w-100 h-100 object-fit-cover"
            />
            <PlaceholderImage v-else class="w-100 h-100" />
          </div>
          
          <div class="w-100">
            <div class="flex-nowrap mn-b-nano flex-v-center flex">
              <p class="p-regular t-medium d-block">{{ variant.name || 'Unnamed variant' }}</p>
              <p v-if="variant.status" class="t-small pd-thin mn-l-thin radius-thin bg-light">{{ variant.status }}</p>
            </div>

            <p class="t-medium t-transp">{{ returnCurrency() }}{{ variant.price }} per {{ variant.quantity }}{{ variant.unit }}</p>
            <p v-if="variant.ingredients?.length" class="t-small t-transp">{{ variant.ingredients.length }} ingredients</p>
           
          </div>
          
          <div class="flex gap-thin">
            <Button
              :showSuccess="false"
              :showLoader="true"
              class="radius-small pd-small flex-center flex aspect-1x1 bg-light cursor-pointer hover-scale-1"
              :submit="() => copyVariant(variant)"
            >
              <IconDuplicate class="i-medium" />
            </Button>
            <Button
              :showSuccess="false"
              :showLoader="false"
              class="radius-small pd-small flex-center flex aspect-1x1 bg-light cursor-pointer hover-scale-1"
              :submit="() => openVariantPopup(variant)"
            >
              <IconEdit class="i-medium" />
            </Button>
            <Button
              :showSuccess="false"
              :showLoader="true"
              class="radius-small pd-small flex-center flex aspect-1x1 bg-red cursor-pointer hover-scale-1"
              :submit="() => deleteVariant(variant)"
            >
               <IconDelete class="i-medium" />
            </Button>
          </div>
        </li>
      </template>
    </Feed>
  </Block>

  <Popup
    :title="editingVariant ? 'Edit Variant' : 'Create Variant'"
    @close-popup="closeVariantPopup"
    :isPopupOpen="isVariantPopupOpen"
    align="center right"
    class="bg-white h-min-100 w-max-50r pd-medium"
  >
    <div class="cols-1 gap-thin o-y-scroll">
      <!-- Status and Quantity at the top -->
      <div class="flex gap-thin">
        <Select
          v-model:select="currentVariant.status"
          label="Status"
          placeholder="Select status"
          :options="['published', 'draft', 'archived']"
          class="w-100 bg-light radius-small pd-small"
        />
        
        <Field 
          v-model:field="currentVariant.quantity" 
          label="Quantity"
          placeholder="Enter quantity" 
          class="w-100 bg-light radius-small pd-small"
          type="number"
        >
          <Select 
            v-model:select="currentVariant.unit" 
            placeholder="Unit"
            :options="['pcs', 'g', 'kg', 'ml', 'l', 'oz']"
            class="pos-relative bg-white gap-small flex flex-column pd-thin radius-thin"
          />
        </Field>
      </div>

      <!-- Price and Cost -->
      <div class="flex gap-thin">
        <Field
          v-model:field="currentVariant.price"
          label="Price"
          type="number"
          placeholder="Price"
          class="w-100 bg-light radius-small pd-small"
        />
        
        <Field
          v-model:field="currentVariant.cost"
          label="Cost"
          type="number"
          placeholder="Cost"
          class="w-100 bg-light radius-small pd-small"
        />
      </div>
      
      <!-- Attributes Section -->
      <div class="t-medium mn-t-small mn-b-small">Attributes</div>
      <div 
        class="gap-micro flex-nowrap flex mn-b-small" 
        v-for="(attr, attrIndex) in currentVariant.attributes" 
        :key="attrIndex"
      > 
        <Field
          v-model:field="attr.name"
          placeholder="Attribute Name"
          class="w-100 bg-light radius-small pd-small"
        />  
        <Field
          v-model:field="attr.value"
          placeholder="Attribute Value"
          class="w-100 bg-light radius-small pd-small"
        />
        <div class="radius-small h-100 flex-center flex-child-default flex aspect-1x1 bg-red cursor-pointer hover-scale-1">
          <IconDelete 
            @click="() => currentVariant.attributes.splice(attrIndex, 1)" 
            class="i-medium"
          />
        </div>
      </div>

      <Button
        class="bg-light w-100"
        :showSuccess="false"
        :showLoader="false"
        @click="addAttribute"
      >
        Add Attribute
      </Button>

      <!-- SKU and Name - auto-generated -->
      <Field
        v-model:field="currentVariant.sku"
        label="SKU"
        placeholder="SKU"
        class="w-100 bg-light radius-small pd-small"
      />

      <Field
        v-model:field="currentVariant.name"
        label="Name"
        placeholder="Variant Name"
        class="w-100 bg-light radius-small pd-small"
      />

      <Field
        v-model:field="currentVariant.description"
        label="Description"
        placeholder="Enter variant description"
        class="w-100 bg-light radius-small pd-small"
        style="resize: vertical"
        type="textarea"
      />

      <!-- Ingredients Section -->
      <div class="mn-t-medium">
        <EditIngredients 
          v-model:ingredients="currentVariant.ingredients"
        />
      </div>

      <!-- Images Section -->
      <div class="t-medium mn-t-small mn-b-small">Images</div>
      <EditImages
        :images="currentVariant.images || []"
        :uploadPath="'variants'"
        class="bg-light pd-small radius-small"
        @update:images="(newImages) => { currentVariant.images = newImages }"
      />
     
      <!-- Action Buttons -->
      <div class="flex gap-thin mn-t-medium">
        <Button
          :showSuccess="false"
          :showLoader="false"
          class="bg-red t-white w-100"
          :submit="closeVariantPopup"
        >
          Cancel
        </Button>
        <Button
          class="bg-main w-100"
          :submit="saveVariant"
        >
          {{ editingVariant ? 'Update Variant' : 'Create Variant' }}
        </Button>
      </div>
    </div>
  </Popup>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import variants from '@martyrs/src/modules/products/store/variants.store.js';
import * as products from '@martyrs/src/modules/products/store/products.js';

// Components
import Block from '@martyrs/src/components/Block/Block.vue';
import Field from '@martyrs/src/components/Field/Field.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import Select from '@martyrs/src/components/Select/Select.vue';
import Feed from '@martyrs/src/components/Feed/Feed.vue';
import EditImages from '@martyrs/src/components/EditImages/EditImages.vue';
import EditIngredients from '@martyrs/src/modules/products/components/sections/EditIngredients.vue';

// Icons
import PlaceholderImage from '@martyrs/src/modules/icons/placeholders/PlaceholderImage.vue';
import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue';
import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';
import IconDuplicate from '@martyrs/src/modules/icons/actions/IconDuplicate.vue';
import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js';

const route = useRoute();
const { returnCurrency } = useGlobalMixins();

const productId = computed(() => route.params.product);

const productOwner = computed(() => {
  return products?.state?.current?.owner;
});

// Локальное состояние
const isVariantPopupOpen = ref(false);
const editingVariant = ref(null);
const currentVariants = ref([]);

// Функция генерации SKU
function generateSKU() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
  return `VAR-${timestamp}-${random}`.toUpperCase();
}

// Функция генерации имени из атрибутов
function generateNameFromAttributes() {
  if (currentVariant.attributes.length > 0) {
    const validAttributes = currentVariant.attributes
      .filter(attr => attr.name && attr.value)
      .map(attr => `${attr.value}`)
      .join(' ');
    
    if (validAttributes) {
      return validAttributes;
    }
  }
  
  // Если нет атрибутов, используем название продукта и количество
  const productName = products?.state?.current?.name || 'Product';
  return `${productName} ${currentVariant.quantity}${currentVariant.unit}`;
}

// Реактивный объект для текущего варианта
const currentVariant = reactive({
  name: '',
  description: '',
  sku: '',
  images: [],
  price: 0,
  cost: 0,
  quantity: 1,
  unit: 'pcs',
  status: 'published',
  ingredients: [],
  attributes: [],
  owner: null,
  creator: null,
  product: null
});

// Следим за изменениями атрибутов, количества и единиц для автогенерации имени
watch(
  () => [currentVariant.attributes, currentVariant.quantity, currentVariant.unit],
  () => {
    if (!editingVariant.value || !currentVariant.name) {
      currentVariant.name = generateNameFromAttributes();
    }
  },
  { deep: true }
);

// Функция открытия попапа варианта
function openVariantPopup(variant = null) {
  editingVariant.value = variant;
  
  if (variant) {
    // Обновляем реактивный объект через Vue реактивность
    currentVariant.name = variant.name || '';
    currentVariant.description = variant.description || '';
    currentVariant.sku = variant.sku || '';
    currentVariant.images = [...(variant.images || [])];
    currentVariant.price = variant.price || 0;
    currentVariant.cost = variant.cost || 0;
    currentVariant.quantity = variant.quantity || 1;
    currentVariant.unit = variant.unit || 'pcs';
    currentVariant.status = variant.status || 'published';
    currentVariant.ingredients = [...(variant.ingredients || [])];
    currentVariant.attributes = (variant.attributes || []).map(attr => ({ ...attr }));
    currentVariant.owner = variant.owner;
    currentVariant.creator = variant.creator;
    currentVariant.product = variant.product;
  } else {
    // Для нового варианта генерируем SKU и устанавливаем только нужные поля
    currentVariant.sku = generateSKU();
    currentVariant.owner = {
      target: route.params._id || auth.state.user._id,
      type: route.params._id ? 'organization' : 'user'
    };
    currentVariant.creator = {
      target: auth.state.user._id,
      type: 'user',
      hidden: false
    };
    currentVariant.product = productId.value;
    
    // Генерируем имя после установки всех полей
    currentVariant.name = generateNameFromAttributes();
  }
  
  isVariantPopupOpen.value = true;
}

function closeVariantPopup() {
  isVariantPopupOpen.value = false;
  editingVariant.value = null;
  
  // Сбрасываем значения к дефолтным
  currentVariant.name = '';
  currentVariant.description = '';
  currentVariant.sku = '';
  currentVariant.images = [];
  currentVariant.price = 0;
  currentVariant.cost = 0;
  currentVariant.quantity = 1;
  currentVariant.unit = 'pcs';
  currentVariant.status = 'published';
  currentVariant.ingredients = [];
  currentVariant.attributes = [];
  currentVariant.owner = null;
  currentVariant.creator = null;
  currentVariant.product = null;
}

function addAttribute() {
  currentVariant.attributes.push({ name: '', value: '' });
}

async function copyVariant(variant) {
  const variantCopy = {
    name: `${variant.name} (Copy)`,
    description: variant.description || '',
    sku: generateSKU(), // Генерируем новый SKU для копии
    images: [...(variant.images || [])],
    price: variant.price || 0,
    cost: variant.cost || 0,
    quantity: variant.quantity || 1,
    unit: variant.unit || 'pcs',
    status: variant.status || 'published',
    ingredients: (variant.ingredients || []).map(ing => ({ ...ing })),
    attributes: (variant.attributes || []).map(attr => ({ ...attr })),
    owner: {
      target: route.params._id || auth.state.user._id,
      type: route.params._id ? 'organization' : 'user'
    },
    creator: {
      target: auth.state.user._id,
      type: 'user',
      hidden: false
    },
    product: productId.value
  };
  
  try {
    const created = await variants.create(variantCopy);
    variants.addItem(created, currentVariants.value);
  } catch (error) {
    console.error('Error copying variant:', error);
  }
}

async function deleteVariant(variant) {
  if (confirm('Are you sure you want to delete this variant?')) {
    try {
      console.log(variant)
      await variants.delete(variant);
      variants.removeItem(variant, currentVariants.value);
    } catch (error) {
      console.error('Error deleting variant:', error);
    }
  }
}

async function saveVariant() {
  if (!currentVariant.name) {
    currentVariant.name = generateNameFromAttributes();
  }
  
  if (!currentVariant.sku) {
    currentVariant.sku = generateSKU();
  }

  const variantToSave = {
    name: currentVariant.name,
    description: currentVariant.description,
    sku: currentVariant.sku,
    images: [...currentVariant.images],
    price: parseFloat(currentVariant.price) || 0,
    cost: parseFloat(currentVariant.cost) || 0,
    quantity: parseInt(currentVariant.quantity) || 1,
    unit: currentVariant.unit || 'pcs',
    status: currentVariant.status,
    ingredients: currentVariant.ingredients.map(ing => ({ ...ing })),
    attributes: currentVariant.attributes.filter(attr => attr.name || attr.value),
    product: currentVariant.product
  };

  // Добавляем owner и creator только при создании нового варианта
  if (!editingVariant.value) {
    variantToSave.owner = {
      target: route.params._id || auth.state.user._id,
      type: route.params._id ? 'organization' : 'user'
    };
    variantToSave.creator = {
      target: auth.state.user._id,
      type: 'user',
      hidden: false
    };
  }

  try {
    if (editingVariant.value) {
      // Обновление существующего варианта
      variantToSave._id = editingVariant.value._id;
      const updated = await variants.update(variantToSave);
      variants.updateItem(updated, currentVariants.value);
    } else {
      // Создание нового варианта
      const created = await variants.create(variantToSave);
      variants.addItem(created, currentVariants.value);
    }
    
    closeVariantPopup();
  } catch (error) {
    console.error('Error saving variant:', error);
    throw error;
  }
}
</script>