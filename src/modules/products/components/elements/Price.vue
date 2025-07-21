<template>
  <div class="price-tag radius-small">
    <span
      :class="{
        'h4': !size,
        'p-medium t-semi': size === 'small',
        'h3 t-semi': size === 'big'
      }"
    >
      {{ returnCurrency() + variant.price }}
    </span>

    <span
      :class="{
        'p-medium': !size,
        'p-small': size === 'small',
        'p-semi': size === 'big'
      }"
      class="p-small mn-l-micro t-transp"
    >
      {{ product?.listing === 'rent' ? 'per day' : 'for ' + variant.quantity + variant.unit }}
    </span>

    <p
      v-if="variant.sale"
      class="pd-r-small t-transp p-medium line-through price"
    >
      {{ returnCurrency() + ((variant.price / 100) * (100 + variant.sale)) }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  product: Object,
  variants: Array,
  size: String
});

const variant = computed(() => {
  return props.product?.variants?.[0] || props.variants?.[0] || props.product;
});
</script>
