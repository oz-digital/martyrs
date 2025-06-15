<template>
  <div class="w-100">
    <p class="mn-b-medium t-transp">
      Set up automatic reordering to maintain optimal inventory levels and avoid stockouts.
    </p>
    
    <Field
      v-model:field="threshold"
      label="Reorder Point"
      type="number"
      class="w-100 bg-light radius-small pd-medium mn-b-small"
    />
    
    <p class="mn-b-small t-small t-transp">
      Products will be flagged for reordering when the stock level drops below this threshold.
    </p>
    
    <Field
      v-model:field="quantity"
      label="Reorder Quantity"
      type="number"
      class="w-100 bg-light radius-small pd-medium mn-b-small"
    />
    
    <div class="mn-b-medium">
      <p class="mn-b-small t-medium">Notification Options</p>
      
      <div class="mn-b-small">
        <Checkbox 
          v-model:checked="notifications.email"
          label="Email notification"
          class="w-100 mn-b-nano"
        />
        
        <Checkbox 
          v-model:checked="notifications.push"
          label="Push notification"
          class="w-100 mn-b-nano"
        />
        
        <Checkbox 
          v-model:checked="notifications.system"
          label="System alert"
          class="w-100"
        />
      </div>
    </div>
    
    <Checkbox 
      v-model:checked="autoOrder"
      label="Enable automatic purchase order creation"
      class="w-100 mn-b-small"
    />
    
    <div class="flex-nowrap flex gap-small">
      <button 
        @click="$emit('close')" 
        class="pd-small radius-small flex-center flex w-max cursor-pointer t-transp"
      >
        Cancel
      </button>
      
      <button 
        @click="saveSettings" 
        class="pd-small radius-small flex-center flex w-100 cursor-pointer bg-main t-black"
      >
        Save Settings
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Field from '@martyrs/src/components/Field/Field.vue'
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue'

const props = defineProps({
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'close'])

// Form state
const threshold = ref(props.product ? (props.product.reorderThreshold || '5') : '5')
const quantity = ref(props.product ? (props.product.reorderQuantity || '10') : '10')
const autoOrder = ref(false)
const notifications = ref({
  email: true,
  push: false,
  system: true
})

function saveSettings() {
  const settings = {
    threshold: parseInt(threshold.value || 5),
    quantity: parseInt(quantity.value || 10),
    autoOrder: autoOrder.value,
    notifications: notifications.value
  }
  
  emit('save', settings)
}
</script>