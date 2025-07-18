<template>
  <div class="pd-thin">
    <!-- Header -->
    <header class="mn-b-medium flex-v-center flex-nowrap flex">
      <h2>Inventory</h2>
      <button
        v-if="route.meta.context === 'backoffice'"
        @click="router.push({ name: 'BackofficeInventoryAudit' })"
        class="mn-l-small radius-100 i-big hover-scale-1 cursor-pointer t-white bg-second"
        v-html="'+'"
      />
      <button
        v-if="route.meta.context === 'organization'"
        @click="router.push({ name: 'OrganizationInventoryAudit', params: { _id: route.params._id } })"
        class="mn-l-small radius-100 i-big hover-scale-1 cursor-pointer t-white bg-second"
        v-html="'+'"
      />
    </header>

    <!-- Products Feed -->
    <Feed
      :search="true"
      v-model:filter="filter"
      v-model:sort="sort"
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
      v-slot="{ items }"
    >
      <Table
        :columns="columns.filter(col => col.visible)"
        :items="items"
        class="bg-white z-index-1 br-solid br-1px br-light radius-medium"
      >
        <!-- Name column (was "product") -->
        <template #cell-name="{ row }">
          <div class="flex gap-small flex-nowrap flex-v-center">
            <img
              v-if="row.images?.length"
              :src="(FILE_SERVER_URL || '') + row.images[0]"
              alt="Product"
              class="w-3r h-3r radius-small bg-light object-fit-cover"
            />
            <PlaceholderImage v-else class="w-3r h-3r radius-small" />
            <span class="t-nowrap">{{ row.name || 'Unknown Product' }}</span>
          </div>
        </template>

        <!-- Categories -->
        <template #cell-category="{ row }">
          <span
            v-if="row.category?.length"
            v-for="cat in row.category"
            :key="cat._id"
            class="pd-nano mn-r-micro pd-r-small pd-l-small radius-small bg-light t-small"
          >
            {{ cat.name }}
          </span>
          <span v-else>-</span>
        </template>

        <!-- Storages -->
        <template #cell-storages="{ row }">
          <div v-if="row.availabilityDetails?.length" class="flex flex-column gap-micro">
            <div 
              v-for="avail in row.availabilityDetails" 
              :key="avail._id"
              class="flex gap-small flex-v-center"
            >
              <span class="t-small">{{ avail.storageName || avail.storage }}:</span>
              <span class="t-medium">{{ avail.available || 0 }}</span>
            </div>
          </div>
          <span v-else class="t-transp">No stock</span>
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
        @save="handleAuditSave"
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
        @save="handleAlertSave"
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

// Icons
import IconSettings from '@martyrs/src/modules/icons/entities/IconSettings.vue'
import IconEllipsis from '@martyrs/src/modules/icons/navigation/IconEllipsis.vue'

// Forms
import AdjustmentForm from '../forms/AdjustmentForm.vue'
import StockAlertsForm from '../forms/StockAlertsForm.vue'
import HistoryView from '../forms/HistoryView.vue'
import ColumnSettingsMenu from '../forms/ColumnSettingsMenu.vue'

// Stores
import * as inventory from '@martyrs/src/modules/inventory/store/ inventory.store.js'
import * as products from '@martyrs/src/modules/products/store/products.js'
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
import stockAlerts from '@martyrs/src/modules/inventory/store/stock.alerts.store.js'

// Router
const route = useRoute()
const router = useRouter()
const { formatPrice } = useGlobalMixins()

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
async function handleAuditSave(adjustmentData) {
  try {
    await inventory.actions.createAdjustment({
      ...adjustmentData,
      owner: {
        type: 'organization',
        target: route.params._id
      },
      creator: {
        type: 'user',
        target: auth.state.user._id
      }
    })
    showAuditModal.value = false
  } catch (err) {
    console.error(err)
  }
}
async function handleAlertSave(alertData) {
  try {
    await stockAlerts.create(alertData)
    showReorderModal.value = false
  } catch (err) {
    console.error('Error saving alert:', err)
  }
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
