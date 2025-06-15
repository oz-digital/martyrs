<template>
  <div class="gap-small pos-relative cols-1">
    <div class="pos-relative w-100 gap-thin flex-stretch flex-nowrap flex">
      <div class="bg-light h-100 o-hidden pos-relative radius-small aspect-1x1"
        style="flex: 1 0 auto"
      >
        <!-- Item Image -->
        <img loading="lazy" 
          class="w-100 object-fit-cover pos-absolute h-100" 
          v-if="product.images[0]"    
          :src="(FILE_SERVER_URL || '') + product.images[0]"
        >
        <PlaceholderImage
          v-if="!product.images[0]" 
          class="bg-light pos-absolute radius-small w-100 h-100"
        />
      </div>
      
      <!-- Item Description -->
      <div class="w-100 pos-relative">
        <!-- Name -->
        <p class="t-truncate t-medium">{{ product.name }}</p>
        <div>
          <p>
            <span class="t-second mn-r-micro d-inline-block t-demi">
              {{ returnCurrency() }}{{ (product.listing === 'rent' ? (rentalDays || product.quantity || 0) : (product.quantity || 0)) * product.price }}
            </span>

            <span class="p-small t-transp">
              <template v-if="product.quantity">{{returnCurrency() }}{{product.price}} </template>
              × 
              <template v-if="product.listing === 'rent' && rentDates.start && rentDates.end">
                {{ rentalDays }} days
              </template>
              
              <template v-else>
                {{ product.quantity || 0 }} {{ product.unit || 'pcs' }}
              </template>
            </span>
          </p>  
        </div>
        
        <!-- Control Buttons -->
        <div v-if="editable || product.listing === 'rent'" class="mn-t-thin gap-thin flex-nojustify flex">
          <!-- For Rent Items: Edit Dates Button -->
          <div v-if="(product.listing === 'rent') && (rentDates.start && rentDates.end)" class="flex gap-thin flex-v-center cursor-pointer pd-thin w-100 bg-light radius-small">
            <IconCalendar
              @click="openRentDatePopup"
              class="cursor-pointer i-medium"
            />
            <!-- Rent Dates Display -->
            <p @click="editable ? openRentDatePopup : null" class="t-medium t-transp">
             {{ formatDate(rentDates.start, { dayMonth: true, language: locale }) }} - {{ formatDate(rentDates.end, { dayMonth: true, language: locale }) }}
            </p>
          </div>

          <!-- For Regular Items: Quantity Control Buttons -->
          <template v-if="editable &&product.listing !== 'rent'">
            <IconAdd
              @click="increase_(product)"
              class="hover-scale-1 cursor-pointer bg-light i-big pd-thin radius-small"
            />
            <IconMinus
              @click="decrease(product)"
              class="hover-scale-1 cursor-pointer bg-light i-big pd-thin radius-small"
            />
            <IconDelete
              @click="remove(product)"
              class="hover-scale-1 cursor-pointer bg-light i-big pd-thin radius-small"
            />
          </template>

          <IconEdit
            v-if="product.listing === 'rent' && editable"
            @click="openRentDatePopup"
            class="hover-scale-1 cursor-pointer bg-light i-big pd-small radius-small"
          />
        </div>
      </div>
    </div>
    
    <!-- Rent Date Popup -->
    <PopupDateSelector
      :isOpen="isRentDatePopupOpen"
      :product="product"
      :initialDates="rentDates"
      :showFees="true"
      :showVat="true"
      :feesRate="0.15"
      :vatRate="0.2"
      :showCancelButton="true"
      :onCancel="() => remove(product)"
      @confirm="updateRentDates"
      @close="closeRentDatePopup"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import IconAdd from '@martyrs/src/modules/icons/navigation/IconAdd.vue'
import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'
import IconMinus from '@martyrs/src/modules/icons/navigation/IconMinus.vue'
import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue'
import IconCalendar from '@martyrs/src/modules/icons/entities/IconCalendar.vue'
import PlaceholderImage from '@martyrs/src/modules/icons/placeholders/PlaceholderImage.vue'
import PopupDateSelector from '@martyrs/src/modules/globals/views/components/blocks/PopupDateSelector.vue'

const router = useRouter()
const emits = defineEmits(['increase', 'decrease', 'remove', 'updateRentDates'])

const props = defineProps({
  product: Object,
  editable: Boolean,
  increase: Function,
  decrease: Function,
  remove: Function,
})

const { locale } = useI18n()

// Rental dates state - initialize from product if available
const rentDates = ref({
  start: props.product.date?.start || null,
  end: props.product.date?.end || null
})

// Rental days calculation
const rentalDays = computed(() => {
  if (!rentDates.value.start || !rentDates.value.end) return 0
  
  const start = new Date(rentDates.value.start)
  const end = new Date(rentDates.value.end)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
})

// Popup state
const isRentDatePopupOpen = ref(false)

// Methods for buttons
function increase_(product) {
  if (props.increase) {
    props.increase(product)
  }
  emits('increase', product)
}

function decrease(product) {
  if (props.decrease) {
    props.decrease(product)
  }
  emits('decrease', product)
}

function remove(product) {
  if (props.remove) {
    props.remove(product)
  }
  emits('remove', product)
}

// Rent date popup functions
function openRentDatePopup() {
  isRentDatePopupOpen.value = true
}

function closeRentDatePopup() {
isRentDatePopupOpen.value = false
}

function updateRentDates(dates) {
  rentDates.value = dates
  emits('updateRentDates', props.product, dates)
  closeRentDatePopup()
}
</script>

<style lang="scss">
</style>