<template>
  <div class="w-100">
    <p class="mn-b-medium t-transp">
      Effortlessly update your inventory and track adjustments for accurate stock management.
    </p>
    
   
    <div class="mn-b-medium">
      <div class="mn-b-small flex-nowrap flex gap-thin">
        <Field
          v-model:field="quantity"
          label="Quantity Adjustment"
          type="number"
          placeholder="Enter +/- quantity"
          class="w-100 bg-light radius-small pd-medium"
        />
        
        <Field
          :field="product.available"
          label="Current Available"
          type="text"
          :disabled="true"
          class="w-100 bg-light radius-small pd-medium"
        />
      </div>
      
    </div>

    <!-- Variant Selection -->
    <div class="mn-b-medium" v-if="productVariants.length > 0">
      <p class="mn-b-small t-medium">Select Variant</p>
      <Select
        v-model:select="selectedVariant"
        :options="productVariants"
        property="_id"
        value="name"
        placeholder="Choose variant"
        class="w-100 bg-light radius-small pd-medium"
      />
    </div>

    <!-- Storage Selection -->
    <div class="mn-b-medium">
      <p class="mn-b-small t-medium">Select Storage</p>
      <Select
        v-model:select="selectedStorage"
        :options="storageOptions"
        property="_id"
        value="name"
        placeholder="Choose storage"
        class="w-100 bg-light radius-small pd-medium"
      />
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
    </div>
    
    <Field
      v-model:field="note"
      label="Note"
      type="textarea"
      placeholder="Add additional details about this adjustment..."
      class="w-100 bg-light radius-small pd-medium mn-b-medium"
    />
    
    <div class="flex-nowrap flex gap-small">
      <Button
        :submit="() => $emit('close')"
        :showLoader="false"
        :showSucces="false"
        class="pd-small radius-small flex-center flex w-max cursor-pointer t-transp"
      >
        Cancel
      </Button>
      
      <Button
        :submit="saveAdjustment"
        :showLoader="true"
        :showSucces="true"
        class="pd-small radius-small flex-center flex w-100 cursor-pointer bg-main t-black"
      >
        Save Adjustment
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Field from '@martyrs/src/components/Field/Field.vue'
import Select from '@martyrs/src/components/Select/Select.vue'
import Button from '@martyrs/src/components/Button/Button.vue'
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
import * as spots from '@martyrs/src/modules/spots/store/spots.js'
import variants from '@martyrs/src/modules/products/store/variants.store.js'
import * as inventory from '@martyrs/src/modules/inventory/store/inventory.store.js'

const route = useRoute()

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

const emit = defineEmits(['close', 'adjustment-created'])

// Form state
const quantity = ref(0)
const selectedReason = ref('restock')
const note = ref('')
const selectedStorage = ref(null)
const selectedVariant = ref(null)
const productVariants = ref([])
const storageOptions = ref([])

// Adjustment reason options
const adjustmentReasons = [
  { label: 'Restock', value: 'restock', icon: IconDamage },
  { label: 'Sale', value: 'sale', icon: IconExpire },
  { label: 'Return', value: 'return', icon: IconMisplacement },
  { label: 'Damage', value: 'damage', icon: IconThief },
  { label: 'Transfer', value: 'transfer', icon: IconStocktake },
  { label: 'Other', value: 'custom', icon: IconCustom },
]

function formatPrice(price) {
  return '$' + (parseFloat(price) || 0).toFixed(2)
}

// Fetch variants and storages on mount
onMounted(async () => {
  console.log('AdjustmentForm mounted with product:', props.product)
  
  // Fetch variants for the product
  try {
    const variantsData = await variants.read({
      product: props.product._id,
      limit: 50
    })
    productVariants.value = variantsData
    // Select first variant by default if available
    if (variantsData.length > 0) {
      selectedVariant.value = variantsData[0]._id
    }
  } catch (err) {
    console.error('Error fetching variants:', err)
  }

  // Fetch storage options
  try {
    const spotsData = await spots.actions.read({
      user: auth.state.user._id,
      organization: route.params._id,
      limit: 50
    })
    storageOptions.value = spotsData.map(spot => ({
      _id: spot._id,
      name: spot.profile?.name || 'Storage'
    }))
    // Select first storage by default if available
    if (storageOptions.value.length > 0) {
      selectedStorage.value = storageOptions.value[0]._id
    }
  } catch (err) {
    console.error('Error fetching spots:', err)
  }
})

async function saveAdjustment() {
  if (!selectedVariant.value) {
    alert('Please select a variant')
    throw new Error('Please select a variant')
  }
  if (!selectedStorage.value) {
    alert('Please select a storage')
    throw new Error('Please select a storage')
  }

  try {
    const adjustmentData = {
      product: props.product._id,
      variant: selectedVariant.value,
      storage: selectedStorage.value,
      source: {
        type: 'User',
        target: auth.state.user._id
      },
      quantity: parseInt(quantity.value || 0),
      reason: selectedReason.value,
      comment: note.value || '',
      owner: {
        type: 'organization',
        target: route.params._id
      },
      creator: {
        type: 'user',
        target: auth.state.user._id
      }
    }
    
    const createdAdjustment = await inventory.actions.createAdjustment(adjustmentData)
    
    // Emit the adjustment data for parent component to update the product
    emit('adjustment-created', {
      product: props.product._id,
      storage: selectedStorage.value,
      quantity: parseInt(quantity.value || 0),
      storageName: storageOptions.value.find(s => s._id === selectedStorage.value)?.name
    })
    
    emit('close')
  } catch (err) {
    console.error(err)
    throw err
  }
}
</script>