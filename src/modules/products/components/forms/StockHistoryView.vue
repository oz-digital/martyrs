<template>
  <div class="w-100">
    <div class="flex-nowrap flex flex-v-center mn-b-medium">
      <div class="flex-nowrap flex flex-v-center">
        <img 
          v-if="product.images && product.images.length > 0"
          :src="(FILE_SERVER_URL || '') + product.images[0]" 
          alt="Product" 
          class="w-3r h-3r radius-small object-fit-cover mn-r-small"
        />
        <PlaceholderImage 
          v-else 
          class="w-3r h-3r radius-small mn-r-small"
        />
        
        <div>
          <h3 class="mn-b-nano">{{ product.name }}</h3>
          <p class="t-small t-transp">SKU: {{ product.sku }}</p>
        </div>
      </div>
    </div>
    
    <div class="mn-b-medium w-100 h-max-30r o-scroll">
      <table class="w-100">
        <thead>
          <tr class="bg-light">
            <th class="pd-small t-left">Date</th>
            <th class="pd-small t-left">Type</th>
            <th class="pd-small t-left">Quantity</th>
            <th class="pd-small t-left">Reason</th>
            <th class="pd-small t-left">User</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="pd-medium t-center">Loading history...</td>
          </tr>
          <tr v-else-if="history.length === 0">
            <td colspan="5" class="pd-medium t-center">No history available</td>
          </tr>
          <tr v-for="(entry, index) in history" :key="index" class="border-b">
            <td class="pd-small">{{ formatDate(entry.createdAt) }}</td>
            <td class="pd-small">
              <span 
                :class="entry.type === 'stock-in' ? 'bg-green t-white' : 'bg-red t-white'"
                class="pd-nano pd-r-small pd-l-small radius-small t-small"
              >
                {{ entry.type === 'stock-in' ? 'Stock In' : 'Stock Out' }}
              </span>
            </td>
            <td class="pd-small">
              {{ entry.positions[0]?.quantity || 0 }}
            </td>
            <td class="pd-small">{{ entry.comment || 'Not specified' }}</td>
            <td class="pd-small">
              <div class="flex-nowrap flex flex-v-center">
                <div class="w-2r h-2r radius-100 bg-light o-hidden mn-r-nano">
                  <img 
                    v-if="entry.creator?.target?.profile?.photo" 
                    :src="(FILE_SERVER_URL || '') + entry.creator.target.profile.photo" 
                    alt="User" 
                    class="w-100 h-100 object-fit-cover" 
                  />
                  <PlaceholderImage v-else class="w-100 h-100" />
                </div>
                {{ entry.creator?.target?.profile?.name || 'System' }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <button 
      @click="$emit('close')" 
      class="pd-small radius-small flex-center flex w-max cursor-pointer bg-main t-black"
    >
      Close
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PlaceholderImage from '@martyrs/src/modules/icons/placeholders/PlaceholderImage.vue'
import * as inventory from '@martyrs/src/modules/inventory/store/ inventory.store.js'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

// State
const loading = ref(true)
const history = ref([])

onMounted(async () => {
  await loadHistory()
})

async function loadHistory() {
  try {
    // Use the inventory adjustments action to get history for this product
    const data = await inventory.actions.fetchAdjustments({ 
      productId: props.product._id 
    })
    
    history.value = data || []
  } catch (error) {
    console.error('Error loading history:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(var(--black), 0.1);
}
</style>