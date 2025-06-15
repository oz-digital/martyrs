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
    />
    
    <!-- Quantity Selection -->
    <div class="w-100 mn-b-medium">
      <div class="flex flex-nowrap flex-v-center mn-b-thin">
        <p class="t-medium">Quantity</p>
        <span v-if="selectedVariant" class="t-small t-transp mn-l-thin">
          (Max: {{ maxQuantity }})
        </span>
      </div>
      
      <QuantitySelector v-model="quantity" :maxValue="maxQuantity" />
    </div>

    <!-- Out of stock notice -->
    <div v-if="selectedVariant && !selectedVariant.available" class="mn-b-medium">
      <div class="flex flex-nowrap gap-small pd-small bg-error-light radius-small t-error">
        <span>Out of stock</span>
      </div>
    </div>

    <!-- Add to cart button -->
    <div class="w-100 mn-b-small">
      <Button
        v-if="isVariantAvailable"
        :submit="addVariantToCart"
        class="cursor-pointer pd-medium radius-big w-100 bg-main button h-3r"
      >
        <div class="gap-micro flex flex-center flex-nowrap">
          <IconShopcartAdd class="i-semi"/>
          <span class="t-nowrap">{{ t('addtoorder') }}</span>
        </div>
      </Button>

      <div
        v-else
        class="flex-center flex uppercase radius-big t-black w-100 pd-medium t-medium bg-grey h-3r"
      >
        <span v-if="!selectedVariant && productVariants.length > 1">Select variant</span>
        <span v-else>Out of Stock</span>
      </div>
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

function addVariantToCart() {
  const variant = selectedVariant.value || 
    (props.productVariants.length === 1 ? props.productVariants[0] : null);
  
  if (!variant || !variant.available || quantity.value > variant.available) return false;
  
  emits('add-to-cart', {
    _id: props.productId,
    variantId: variant._id,
    sku: variant.sku,
    name: props.productName,
    price: variant.price,
    quantity: quantity.value,
    attributes: variant.attributes || []
  });
  
  return true;
}
</script>