<template>
  <div v-if="productVariants?.length" class="w-100">
    <!-- Variants Selection Component -->
    <ProductVariants
      :productVariants="productVariants"
      :productId="productId"
      :productName="productName"
      @variant-selected="handleVariantSelected"
      @update-images="$emit('update-images', $event)"
    />
    
    <!-- Discounts Component -->
    <ProductDiscounts
      :discounts="discounts"
      :regularPrice="regularPrice"
      :selectedVariant="selectedVariant"
      :productVariants="productVariants"
      @select-discount="handleDiscountSelected"
      class="mn-b-medium"
    />
      
    <!-- Показываем цену, если нет вариантов или не выбран ни один вариант -->
    <div class="flex-nowrap flex gap-thin">
      <div class="">
        <p class="t-medium mn-b-thin">Price</p>
        <Price 
          :product="selectedVariant || productVariants[0]"
          :variants="productVariants" 
          size="big" 
          class="flex gap-micro flex-center pd-small bg-second t-white w-max mn-b-medium" 
        />
      </div>
     
      
      <!-- Quantity Selection -->
      <div class="w-100">
        <div class="flex flex-nowrap flex-v-center mn-b-thin">
          <p class="t-medium">Quantity</p>
          <span v-if="selectedVariant" class="t-small t-transp mn-l-thin">
            (Max: {{ maxQuantity }})
          </span>
        </div>
        
        <QuantitySelector v-model="quantity" :maxValue="maxQuantity" />
      </div>
    </div>

    <!-- Out of stock notice -->
    <div v-if="selectedVariant && !selectedVariant.available" class="mn-b-medium">
      <div class="flex flex-nowrap gap-small pd-small bg-error-light radius-small t-error">
        <span>Out of stock</span>
      </div>
    </div>

    <!-- Add to cart button -->
    <div class="w-100 mn-b-medium">
      <Button
        :submit="isVariantAvailable ? addProductToCart : undefined"
        :disabled="!isVariantAvailable"
        class="cursor-pointer pd-medium radius-big w-100 bg-main button h-3r"
      >
        <div v-if="isVariantAvailable" class="gap-micro flex flex-center flex-nowrap">
          <IconShopcartAdd class="i-semi"/>
          <span class="t-nowrap">{{ t('addtoorder') }}</span>
        </div>
        <template v-else>
          <span v-if="!selectedVariant && productVariants.length > 1">Select variant</span>
          <span v-else>Out of Stock</span>
        </template>
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import IconShopcartAdd from '@martyrs/src/modules/icons/actions/IconShopcartAdd.vue';
import Button from '@martyrs/src/components/Button/Button.vue';

import ProductVariants from '../blocks/ProductVariants.vue';
import ProductDiscounts from '../blocks/ProductDiscounts.vue';
import QuantitySelector from '../elements/QuantitySelector.vue';

import Price from '@martyrs/src/modules/products/components/elements/Price.vue'

const props = defineProps({
  productVariants: { type: Array, default: () => [] },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  discounts: { type: Array, default: () => [] },
  regularPrice: { type: String, required: true }
});

const emits = defineEmits(['variant-selected', 'add-to-cart', 'update-images']);
const { t } = useI18n({ messages: { en: { addtoorder: 'Add to Cart' }, ru: { addtoorder: 'Добавить в корзину' } } });

const selectedVariant = ref(null);
const quantity = ref(1);

// Computed properties
const isVariantAvailable = computed(() => 
  selectedVariant.value ? selectedVariant.value.available :
  props.productVariants.length === 1 ? props.productVariants[0].available : false
);

const maxQuantity = computed(() => 
  selectedVariant.value ? selectedVariant.value.available : 
  props.productVariants.length === 1 ? props.productVariants[0].available || 1 : 1
);

// Methods
function handleVariantSelected(variant) {
  selectedVariant.value = variant;
  if (quantity.value > variant.available) quantity.value = variant.available;
  emits('variant-selected', variant);
}

function handleDiscountSelected(discount) {
  // Update quantity based on discount requirements
  if (discount.quantity && discount.quantity > quantity.value) {
    quantity.value = discount.quantity;
  }
}

function addProductToCart() {
  const variant = selectedVariant.value || 
    (props.productVariants.length === 1 ? props.productVariants[0] : null);
  
  if (!variant || !variant.available || quantity.value > variant.available) return false;
  
  emits('add-to-cart', {
    variant: variant,
    quantity: quantity.value
  });
  
  return true;
}
</script>