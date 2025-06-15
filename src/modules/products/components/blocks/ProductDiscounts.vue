<template>
  <div v-if="discounts && discounts.length" class="mn-t-large mn-b-large">
    <div class="mn-b-small flex-nowrap flex flex-v-center">
      <IconDiscount class="mn-r-micro i-medium"/>
      <p class="t-medium">Special Offers</p>
    </div>

    <div class="flex flex-column flex-wrap gap-thin">
      <div 
        v-for="(discount, index) in discounts" 
        :key="index" 
        class="discount-card pd-medium radius-medium br-1px br-solid br-light cursor-pointer hover-scale-1"
        @click="selectDiscount(discount)"
      >
        <div class="flex flex-wrap gap-thin flex-v-center w-100">

          <Tooltip :text="discount.description || 'No description'">
            <span class="discount-name t-semi p-medium">{{ discount.name }}</span>
          </Tooltip>

          <span class="t-main p-medium">
            {{returnCurrency()}}{{ discount.value }} per {{ currentVariant?.quantity || 1 }}{{ currentVariant?.unit || pcs }}
          </span>

        </div>
        
        <p v-if="discount.description" class="t-small mn-t-thin t-transp">{{ discount.description }}</p>

        <div class="mn-t-small"><Chips v-if="getConditionsAsChips.length > 0" class="" :chips="getConditionsAsChips(discount)" /></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import IconDiscount from '@martyrs/src/modules/icons/entities/IconDiscount.vue'
import Chips from '@martyrs/src/components/Chips/Chips.vue';
import Tooltip from '@martyrs/src/components/Tooltip/Tooltip.vue';

const props = defineProps({
  discounts: { 
    type: Array, 
    default: () => [] 
  },
  regularPrice: { 
    type: [String, Number], 
    default: 0 
  },
  selectedVariant: {
    type: Object,
    default: null
  },
  productVariants: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select-discount']);

// Helper to determine if a discount has date conditions
const hasDateCondition = (discount) => {
  return discount.date && (discount.date.start || discount.date.end);
};

// Helper to determine if a discount has time conditions
const hasTimeCondition = (discount) => {
  return discount.time && (discount.time.start || discount.time.end);
};

// Format date range for display
const formatDateRange = (dateRange) => {
  if (!dateRange) return '';
  
  const start = dateRange.start ? new Date(dateRange.start).toLocaleDateString() : 'Anytime';
  const end = dateRange.end ? new Date(dateRange.end).toLocaleDateString() : 'No end date';
  
  return `${start}-${end}`;
};

// Format time range for display
const formatTimeRange = (timeRange) => {
  if (!timeRange) return '';
  
  const start = timeRange.start || 'Anytime';
  const end = timeRange.end || 'No end time';
  
  // Check if we're referencing today
  const now = new Date();
  const isToday = true; // Simplification - in a real app we'd check if the date range includes today
  
  return isToday ? `${start}-${end} today` : `${start}-${end}`;
};

// Get the current variant (selected or default to first)
const currentVariant = computed(() => {
  return props.selectedVariant || (props.productVariants?.length > 0 ? props.productVariants[0] : null);
});

const getConditionsAsChips = (discount) => {
  const chips = [];
  
  // Quantity condition - используем quantity из текущего варианта, а не из скидки
  // if (currentVariant.value?.quantity && currentVariant.value.quantity > 0) {
  //   chips.push({ 
  //     text: `+${discount.quantity}`, 
  //   });
  // }
  
  // Date condition
  if (hasDateCondition(discount)) {
    chips.push({ 
      text: `Valid: ${formatDateRange(discount.date)}` 
    });
  }
  
  // Time condition
  if (hasTimeCondition(discount)) {
    chips.push({ 
      text: `Available: ${formatTimeRange(discount.time)}` 
    });
  }
  
  return chips;
};
// Handle discount selection
const selectDiscount = (discount) => {
  emit('select-discount', discount);
};
</script>

<style scoped>
.discount-card {
  transition: all 0.2s ease;
}

.discount-card:hover {
  border-color: rgb(var(--main));
}
</style>