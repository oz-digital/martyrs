<template>
  <div class="pd-thin">
    <!-- Header -->
    <header class="mn-b-medium flex-v-center flex-nowrap flex">
      <h2>Inventory</h2>
      <button
        @click="route.meta.context === 'backoffice' ? router.push({ name: 'BackofficeInventoryAudit' }) : router.push({ name: 'OrganizationInventoryAudit', params: { _id: route.params._id } })"
        class="mn-l-auto radius-small button t-white bg-second"
        v-html="'+ New Audit'"
      />
    </header>

    <!-- Products Feed -->
    <div class="rows-1">
      <Feed
        :search="true"
        v-model:sort="sort"
        v-model:items="items"
        :store="{
          read: (options) => products.actions.read(options),
          state: products.state
        }"
        :actions="[{
          key: 'settings',
          component: IconSettings,
          props: {
            class: 'h-3r pd-r-small pd-l-small flex-center flex bg-light t-black radius-small hover-scale-1 cursor-pointer'
          },
          handler: openViewSettings
        }]"
        :options="{
          limit: 15,
          lookup: ['inventory','categories'],
          owner: route.params._id,
          sortParam: sort.param,
          sortOrder: sort.order
        }"
      >
        <Table
          :columns="columns.filter(col => col.visible)"
          :items="items"
          class="bg-white z-index-1 br-solid br-1px br-light radius-medium"
        >
          <!-- Name column (was "product") -->
          <template #cell-name="{ row }">
            <div class="w-max-20r t-trim flex gap-small flex-nowrap flex-v-center">
              <img
                v-if="row.images?.length"
                :src="(FILE_SERVER_URL || '') + row.images[0]"
                alt="Product"
                class="w-3r h-3r radius-small bg-light object-fit-cover"
              />
              <PlaceholderImage v-else class="w-3r h-3r radius-small" />
              <p class="t-trim t-nowrap">{{ row.name || 'Unknown Product' }}</p>
            </div>
          </template>

          <!-- Categories -->
          <template #cell-category="{ row }">
            <div class="w-max-10r flex-nowrap flex  t-trim">
              <p
                v-if="row.category?.length"
                v-for="cat in row.category"
                :key="cat._id"
                class="w-max t-trim pd-small mn-r-micro radius-small bg-light t-small"
              >
                {{ cat.name }}
              </p>
              <p v-else>-</p>
            </div>
          </template>

          <!-- Storages -->
          <template #cell-storages="{ row }">
            <div class="w-max-10r flex-nowrap flex  t-trim">
              <p
                v-if="row.availabilityDetails?.length"
                v-for="avail in row.availabilityDetails" 
                :key="avail._id"
                class="w-max t-trim pd-small mn-r-micro radius-small bg-light t-small"
              >

                <span class="t-medium">{{ avail.available || 0 }}</span> ·  
                <span class="t-small">{{ avail.storageName || avail.storage }}:</span>
              </p>
              <p v-else>No stock</p>
            </div>
          </template>

          <!-- Available (replaces stock) -->
          <template #cell-available="{ row }">
            <div class="flex-column flex">
              <span class="d-block mn-b-thin">
                {{ row.available }} ·
                {{ row.available <= 5 ? 'Low' : row.available <= 10 ? 'Medium' : 'High' }}
              </span>
              <div class="w-100 h-micro radius-thin bg-light">
                <div
                  class="h-100 radius-thin"
                  :class="
                    row.available <= 1
                      ? 'bg-red t-white'
                      : row.available <= 2
                      ? 'bg-orange t-white'
                      : 'bg-green t-white'
                  "
                  :style="`width: ${
                    Math.min(
                      (row.available / (row.alert !== undefined ? row.alert : 50)) * 100,
                      100
                    )
                  }%`"
                />
              </div>
            </div>
          </template>
          <!-- Price -->
          <template #cell-price="{ row }">
            {{ formatPrice(row.price || 0) }}
          </template>

          <!-- Actions -->
          <template #cell-actions="{ row }">
            <Dropdown
              :label="{ component: IconEllipsis, class: 't-transp i-medium' }"
              class="cursor-pointer aspect-1x1 pd-nano radius-small hover-bg-light"
              align="right"
            >
              <div class="bg-white radius-small">
                <button @click="openStockAudit(row)" class="cursor-pointer t-left t-nowrap w-100 pd-small">
                  Audit Stock
                </button>
                <button @click="openStockHistory(row)" class="cursor-pointer t-left t-nowrap w-100 pd-small">
                  Stock History
                </button>
                <button @click="openReorderSettings(row)" class="cursor-pointer t-left t-nowrap w-100 pd-small">
                  Set Alerts
                </button>
              </div>
            </Dropdown>
          </template>
        </Table>
      </Feed>
    </div>
    <!-- Modals -->
    <Popup
      :isPopupOpen="showAuditModal"
      @close-popup="showAuditModal = false"
      title="Audit Stock"
      class="bg-white radius-medium pd-medium w-min-40r"
    >
      <AdjustmentForm
        :product="selectedProduct"
        @close="showAuditModal = false"
        @adjustment-created="handleAdjustmentCreated"
      />
    </Popup>

    <Popup
      :isPopupOpen="showReorderModal"
      @close-popup="showReorderModal = false"
      title="Stock Level Alerts"
      class="bg-white radius-medium pd-medium w-min-30r"
    >
      <StockAlertsForm
        :product="selectedProduct"
        @close="showReorderModal = false"
      />
    </Popup>

    <Popup
      :isPopupOpen="showHistoryModal"
      @close-popup="showHistoryModal = false"
      title="Stock History"
      class="bg-white radius-medium pd-medium w-min-50r"
    >
      <HistoryView
        :product="selectedProduct"
        @close="showHistoryModal = false"
      />
    </Popup>

    <Popup
      :isPopupOpen="showSettingsModal"
      @close-popup="showSettingsModal = false"
      title="View Settings"
      class="bg-white radius-medium pd-medium w-min-30r"
    >
      <ColumnSettingsMenu
        :columns="columns"
        @save="handleColumnsUpdate"
        @close="showSettingsModal = false"
      />
    </Popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGlobalMixins } from '@martyrs/src/modules/globals/views/mixins/mixins.js'

// Components
import Table from '@martyrs/src/components/Table/Table.vue'
import Feed from '@martyrs/src/components/Feed/Feed.vue'
import PlaceholderImage from '@martyrs/src/modules/icons/placeholders/PlaceholderImage.vue'
import Dropdown from '@martyrs/src/components/Dropdown/Dropdown.vue'
import Popup from '@martyrs/src/components/Popup/Popup.vue'
import Chips  from '@martyrs/src/components/Chips/Chips.vue'


// Icons
import IconSettings from '@martyrs/src/modules/icons/entities/IconSettings.vue'
import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue'

// Forms
import AdjustmentForm from '../forms/AdjustmentForm.vue'
import StockAlertsForm from '../forms/StockAlertsForm.vue'
import HistoryView from '../forms/HistoryView.vue'
import ColumnSettingsMenu from '../forms/ColumnSettingsMenu.vue'

// Stores
import * as inventory from '@martyrs/src/modules/inventory/store/inventory.store.js'
import * as products from '@martyrs/src/modules/products/store/products.js'
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
import stockAlerts from '@martyrs/src/modules/inventory/store/stock.alerts.store.js'

// Router
const route = useRoute()
const router = useRouter()
const { formatPrice } = useGlobalMixins()

// Products items state
const items = ref([])

// Feed controls
const sort = ref({
  param: 'available',
  order: 'asc',
  options: [
    { label: 'Available', value: 'available' },
    { label: 'Name', value: 'name' },
    { label: 'Price', value: 'price' },
    { label: 'Created', value: 'createdAt' }
  ]
})

const filter = reactive({
  active: false,
  class: '',
  selected: { category: [], stockLevel: [] },
  options: [
    { title: 'Categories', value: 'category', options: [] },
    {
      title: 'Stock Level',
      value: 'stockLevel',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' }
      ]
    }
  ]
})

// Column definitions + visibility, combined into one
const columns = reactive([
  { key: 'name',     label: 'Product Name', component: true, visible: true },
  { key: 'category', label: 'Categories',   component: true, visible: true },
  { key: 'storages', label: 'Storages',     component: true, visible: true },
  { key: 'available',label: 'Total Available', component: true, visible: true },
  { key: 'price',    label: 'Unit Price',   component: true, visible: true },
  { key: 'actions',  label: '',             component: true, visible: true }
])

// Modal & selection state
const showAuditModal    = ref(false)
const showReorderModal  = ref(false)
const showHistoryModal  = ref(false)
const showSettingsModal = ref(false)
const selectedProduct   = ref(null)

// Handlers
function openStockAudit(row) {
  selectedProduct.value = row
  showAuditModal.value = true
}

// Update product after adjustment
function handleAdjustmentCreated(adjustment) {
  // Find the product in items array
  const productIndex = items.value.findIndex(item => item._id === adjustment.product)
  
  if (productIndex !== -1) {
    // Update the available quantity
    items.value[productIndex].available += adjustment.quantity
    
    // Update availabilityDetails if present
    if (items.value[productIndex].availabilityDetails) {
      const storageDetail = items.value[productIndex].availabilityDetails.find(
        detail => detail.storage === adjustment.storage
      )
      
      if (storageDetail) {
        storageDetail.available += adjustment.quantity
      } else {
        // Add new storage detail if not found
        items.value[productIndex].availabilityDetails.push({
          storage: adjustment.storage,
          available: adjustment.quantity,
          storageName: adjustment.storageName || adjustment.storage
        })
      }
    }
  }
  
  showAuditModal.value = false
}
function openReorderSettings(row = null) {
  selectedProduct.value = row
  showReorderModal.value = true
}
function openStockHistory(row) {
  selectedProduct.value = row
  showHistoryModal.value = true
}
function openViewSettings() {
  showSettingsModal.value = true
}
function handleColumnsUpdate(updated) {
  // Update column visibility
  columns.forEach(col => {
    col.visible = updated.includes(col.key)
  })
  showSettingsModal.value = false
}
</script>

<style>
.bg-orange {
  background-color: rgb(var(--orange));
}
</style>
