<template>
  <Popup @close-popup="closePopup" :isPopupOpen="isOpen" class="radius-medium tablet:w-min-30r pd-medium bg-white o-hidden">
    <h5 class="w-100 t-center mn-b-small">Select Rent Period</h5>
    <Calendar
      v-model:date="selectedDates"
      :allowRange="true"
      :disablePastDates="true"
      :availabilityData="availabilityData"
      :showAvailability="true"
      :lowAvailabilityThreshold="3"
      class="bg-light radius-small"
      :disabled="isLoading"
    />
    <div v-if="isLoading" class="flex w-100 mn-t-thin bg-light radius-small flex-center pd-thin mn-b-thin">
      <Loader :centered="false" />
      <span>Loading availability data...</span>
    </div>

    <div v-if="availabilityError" class="pd-small t-error">
      {{ availabilityError }}
    </div>
    
    <PriceTotal
      :totalPrice="totalAmount"
      :currency="returnCurrency()"
      :showFees="showFees"
      :feesRate="feesRate"
      :showVat="showVat"
      :vatRate="vatRate"
    />
    <Button
      @click="confirmSelection"
      :disabled="!selectedDates.start || !selectedDates.end || isLoading || !isAvailable"
      class="h-3r w-100 bg-main button"
    >
      <div class="gap-thin flex flex-center flex-nowrap">
        <IconShopcartAdd class="i-semi icon-button-main" />
        <span>{{t('addtoorder')}}</span>
      </div>
    </Button>
      <Button
        v-if="showCancelButton"
        @click="cancelSelection"
        class="mn-t-thin h-3r w-100 t-white bg-red button"
      >
        <span>{{ t('remove') }}</span>
      </Button>
  </Popup>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Popup from '@martyrs/src/components/Popup/Popup.vue'
import Loader from '@martyrs/src/components/Loader/Loader.vue'
import Calendar from '@martyrs/src/components/DatePicker/Calendar.vue'
import Button from '@martyrs/src/components/Button/Button.vue'
import IconShopcartAdd from '@martyrs/src/modules/icons/actions/IconShopcartAdd.vue'
import PriceTotal from '@martyrs/src/modules/orders/components/elements/PriceTotal.vue'
// Import the store actions
import * as rents from '@martyrs/src/modules/rents/views/store/rents.store.js'

const props = defineProps({
  product: { type: Object, required: true },
  isOpen: { type: Boolean, required: true },
  showFees: { type: Boolean, default: false },
  showVat: { type: Boolean, default: false },
  feesRate: { type: Number, default: 0 },
  vatRate: { type: Number, default: 0 },
  onConfirm: { type: Function, required: true },
  onCancel: { type: Function, default: null },
  showCancelButton: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])
const { t } = useI18n({
  messages: {
    en: {
      addtoorder: 'Add to Shopcart'
    }
  }
})

const selectedDates = ref({ start: null, end: null })
const availabilityData = ref([])
const isLoading = ref(false)
const availabilityError = ref(null)
const isAvailable = ref(true)

// Load availability data for the current month and next month
async function loadAvailabilityData() {
  if (!props.product || !props.product._id) return;
  
  isLoading.value = true;
  availabilityError.value = null;
  
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    
    const data = await rents.loadAvailability({
      productId: props.product._id,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
    
    if (data && data.availability) {
      availabilityData.value = data.availability;
    }
  } catch (error) {
    console.error('Error loading availability data:', error);
    availabilityError.value = 'Failed to load availability data. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

// Check availability for selected date range
async function checkAvailability() {
  if (!selectedDates.value.start || !selectedDates.value.end || !props.product || !props.product._id) {
    isAvailable.value = false;
    return;
  }
  
  isLoading.value = true;
  availabilityError.value = null;
  
  try {
    const data = await rents.loadAvailability({
      productId: props.product._id,
      startDate: selectedDates.value.start.split('T')[0],
      endDate: selectedDates.value.end.split('T')[0]
    });
    
    isAvailable.value = data.available > 0;
    
    if (!isAvailable.value) {
      availabilityError.value = 'Product is not available for the selected dates.';
    }
  } catch (error) {
    console.error('Error checking availability:', error);
    availabilityError.value = 'Failed to check availability. Please try again.';
    isAvailable.value = false;
  } finally {
    isLoading.value = false;
  }
}

function calculateDays(start, end) {
  if (!start || !end) return 0
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = endDate - startDate
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return diffDays > 0 ? diffDays : 0
}

const numberOfDays = computed(() => calculateDays(selectedDates.value.start, selectedDates.value.end))
const totalAmount = computed(() => props.product.price * numberOfDays.value)

function closePopup() {
  emit('close')
}

function confirmSelection() {
  if (selectedDates.value.start && selectedDates.value.end && isAvailable.value) {
    props.onConfirm(selectedDates.value)
    closePopup()
  }
}

function cancelSelection() {
  if (props.onCancel) {
    props.onCancel()
  }
  closePopup()
}

watch([() => selectedDates.value.start, () => selectedDates.value.end], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    // checkAvailability();
  }
}, { immediate: false });

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadAvailabilityData();
  } else {
    selectedDates.value = { start: null, end: null };
    availabilityError.value = null;
  }
}, { immediate: true });

onMounted(() => {
  if (props.isOpen) {
    loadAvailabilityData();
  }
});
</script>