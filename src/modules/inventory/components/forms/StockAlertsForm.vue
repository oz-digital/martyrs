<template>
  <div class="w-100">
    <p class="mn-b-medium t-transp">
      Set up stock level alerts to get notified when inventory runs low.
    </p>
    
    <!-- Variant Selection -->
    <div class="mn-b-medium">
      <p class="mn-b-small t-medium">Alert Scope</p>
      <Select
        v-model:select="selectedVariant"
        :options="variantOptions"
        property="_id"
        value="name"
        placeholder="All variants"
        class="w-100 bg-light radius-small pd-medium mn-b-small"
      />
      
      <Select
        v-model:select="selectedStorage"
        :options="storageOptions"
        property="_id"
        value="name"
        placeholder="All storages"
        class="w-100 bg-light radius-small pd-medium"
      />
      
      <p class="mn-t-small t-small t-transp">
        {{ alertDescription }}
      </p>
    </div>
    
    <!-- Threshold -->
    <div class="mn-b-medium">
      <Field
        v-model:field="threshold"
        label="Alert when stock falls below"
        type="number"
        placeholder="Enter minimum quantity"
        class="w-100 bg-light radius-small pd-medium"
      />
    </div>
    
    <!-- Actions -->
    <div class="flex-nowrap flex gap-small">
      <button 
        @click="$emit('close')" 
        class="pd-small radius-small flex-center flex w-max cursor-pointer t-transp"
      >
        Cancel
      </button>
      
      <button 
        @click="saveAlert" 
        class="pd-small radius-small flex-center flex w-100 cursor-pointer bg-main t-black"
      >
        Save Alert
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Field from '@martyrs/src/components/Field/Field.vue'
import Select from '@martyrs/src/components/Select/Select.vue'
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
import * as spots from '@martyrs/src/modules/spots/store/spots.js'
import variants from '@martyrs/src/modules/products/store/variants.store.js'
import stockAlerts from '@martyrs/src/modules/inventory/store/stock.alerts.store.js'

const route = useRoute()

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'close'])

// Form state
const selectedVariant = ref(null)
const selectedStorage = ref(null)
const threshold = ref(10)
const variantOptions = ref([])
const storageOptions = ref([])

// Alert description based on selections
const alertDescription = computed(() => {
  if (!selectedVariant.value && !selectedStorage.value) {
    return `Track total stock for ${props.product.name} across all variants and storages`
  } else if (selectedVariant.value && !selectedStorage.value) {
    const variant = variantOptions.value.find(v => v._id === selectedVariant.value)
    return `Track ${variant?.name || 'variant'} stock across all storages`
  } else if (!selectedVariant.value && selectedStorage.value) {
    const storage = storageOptions.value.find(s => s._id === selectedStorage.value)
    return `Track all variants at ${storage?.name || 'storage'}`
  } else {
    const variant = variantOptions.value.find(v => v._id === selectedVariant.value)
    const storage = storageOptions.value.find(s => s._id === selectedStorage.value)
    return `Track ${variant?.name || 'variant'} at ${storage?.name || 'storage'}`
  }
})

// Fetch data on mount
onMounted(async () => {
  // Fetch variants for the product
  try {
    const variantsData = await variants.read({
      product: props.product._id,
      limit: 50
    })
    variantOptions.value = [
      { _id: null, name: 'All variants' },
      ...variantsData.map(v => ({
        _id: v._id,
        name: v.name || 'Default Variant'
      }))
    ]
  } catch (err) {
    console.error('Error fetching variants:', err)
  }

  // Fetch storage options
  try {
    const spotsData = await spots.actions.read({
      organization: route.params._id,
      limit: 50
    })
    storageOptions.value = [
      { _id: null, name: 'All storages' },
      ...spotsData.map(spot => ({
        _id: spot._id,
        name: spot.profile?.name || 'Storage'
      }))
    ]
  } catch (err) {
    console.error('Error fetching spots:', err)
  }
  
  // Check if alert already exists
  try {
    const existingAlerts = await stockAlerts.read({
      product: props.product._id,
      owner: route.params._id
    })
    if (existingAlerts.length > 0) {
      // Load first alert settings
      const alert = existingAlerts[0]
      selectedVariant.value = alert.variant
      selectedStorage.value = alert.storage
      threshold.value = alert.threshold
    }
  } catch (err) {
    console.error('Error fetching existing alerts:', err)
  }
})

async function saveAlert() {
  const alertData = {
    product: props.product._id,
    variant: selectedVariant.value,
    storage: selectedStorage.value,
    threshold: parseInt(threshold.value || 0),
    enabled: true,
    owner: {
      type: 'organization',
      target: route.params._id
    },
    creator: {
      type: 'user',
      target: auth.state.user._id
    }
  }
  
  emit('save', alertData)
}
</script>