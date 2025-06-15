<template>
  <div class="w-100">
    <p class="mn-b-medium t-transp">
      Effortlessly update your inventory and track adjustments for accurate stock management.
    </p>
    
   
    <div class="mn-b-medium">
      <div class="mn-b-small flex-nowrap flex gap-thin">
        <Field
          v-model:field="physicalCount"
          label="Physical Count"
          type="number"
          class="w-100 bg-light radius-small pd-medium"
        />
        
        <Field
          :field="product.available"
          label="Available"
          type="text"
          :disabled="true"
          class="w-100 bg-light radius-small pd-medium"
        />
      </div>
      
      <div class="bg-light pd-medium radius-small">
        <div class="flex-nowrap flex flex-v-center t-demi">
          <p class="mn-r-auto">Discrepancy</p>
          <p :class="discrepancy > 0 ? 't-green' : discrepancy < 0 ? 't-red' : ''">
            {{ discrepancy > 0 ? '+' : '' }}{{ discrepancy }}
          </p>
        </div>
      </div>
    </div>
    
    <div class="mn-b-medium">
      <p class="mn-b-small t-medium">Adjustment Reason</p>
      
      <div class="cols-3 gap-small mn-b-small">
        <div 
          v-for="reason in adjustmentReasons"
          :key="reason.value"
          @click="selectedReason = reason.value"
          :class="{ 'bg-main t-black': selectedReason === reason.value, 'bg-light': selectedReason !== reason.value }"
          class="pd-small radius-small flex-column flex-center flex cursor-pointer"
        >
          <component :is="reason.icon" class="i-regular mn-b-nano" />
          <span>{{ reason.label }}</span>
        </div>
      </div>
      
      <Field
        v-if="selectedReason === 'custom'"
        v-model:field="customReasonText"
        placeholder="Enter custom reason"
        class="w-100 bg-light radius-small pd-medium"
      />
    </div>
    
    <Field
      v-model:field="note"
      label="Note"
      type="textarea"
      placeholder="Add additional details about this adjustment..."
      class="w-100 bg-light radius-small pd-medium mn-b-medium"
    />
    
    <div class="flex-nowrap flex gap-small">
      <button 
        @click="$emit('close')" 
        class="pd-small radius-small flex-center flex w-max cursor-pointer t-transp"
      >
        Cancel
      </button>
      
      <button 
        @click="saveAdjustment" 
        class="pd-small radius-small flex-center flex w-100 cursor-pointer bg-main t-black"
      >
        Save Adjustment
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Field from '@martyrs/src/components/Field/Field.vue'

// Icons for adjustment reasons
import IconDamage from '@martyrs/src/modules/icons/navigation/IconInfo.vue'
import IconExpire from '@martyrs/src/modules/icons/navigation/IconInfo.vue'
import IconMisplacement from '@martyrs/src/modules/icons/navigation/IconInfo.vue'
import IconThief from '@martyrs/src/modules/icons/navigation/IconInfo.vue'
import IconStocktake from '@martyrs/src/modules/icons/navigation/IconInfo.vue'
import IconCustom from '@martyrs/src/modules/icons/navigation/IconInfo.vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'close'])

// Form state
const adjustmentType = ref('quantity')
const physicalCount = ref(props.product.available)
const valueAdjustment = ref('0')
const selectedReason = ref('stocktake')
const customReasonText = ref('')
const note = ref('')

// Computed values
const discrepancy = computed(() => {
  return parseInt(physicalCount.value || 0) - props.product.available
})

// Adjustment reason options
const adjustmentReasons = [
  { label: 'Damage', value: 'damage', icon: IconDamage },
  { label: 'Expire', value: 'expire', icon: IconExpire },
  { label: 'Misplacement', value: 'misplacement', icon: IconMisplacement },
  { label: 'Theft', value: 'theft', icon: IconThief },
  { label: 'Stocktake', value: 'stocktake', icon: IconStocktake },
  { label: 'Custom', value: 'custom', icon: IconCustom },
]

function formatPrice(price) {
  return '$' + (parseFloat(price) || 0).toFixed(2)
}

function saveAdjustment() {
  const adjustmentData = {
    productId: props.product._id,
    type: adjustmentType.value,
    reason: selectedReason.value === 'custom' ? customReasonText.value : selectedReason.value
  }
  
  if (adjustmentType.value === 'quantity') {
    adjustmentData.physicalCount = parseInt(physicalCount.value || 0)
    adjustmentData.discrepancy = discrepancy.value
  } else {
    adjustmentData.valueAdjustment = parseFloat(valueAdjustment.value || 0)
  }
  
  if (note.value) {
    adjustmentData.note = note.value
  }
  
  emit('save', adjustmentData)
}
</script>