<template>
  <div class="gap-small pos-relative cols-1">
    <div class="pos-relative w-100 gap-thin flex-stretch flex-nowrap flex">
      <div class="bg-light h-100 o-hidden pos-relative radius-small aspect-1x1" style="flex: 1 0 auto">
        <img 
          v-if="images && images[0]"
          loading="lazy" 
          class="w-100 object-fit-cover pos-absolute h-100"    
          :src="(FILE_SERVER_URL || '') + images[0]"
        >
        <PlaceholderImage
          v-else 
          class="bg-light pos-absolute radius-small w-100 h-100"
        />
      </div>
      
      <div class="w-100 pos-relative">
        <p class="t-truncate t-medium">{{ name }}</p>
        
        <div class="mn-t-thin">
          <p v-if="price != null && quantity != null">
            <span class="t-second mn-r-micro d-inline-block t-demi">
              {{ returnCurrency() }}{{ totalPrice }}
            </span>
            <span v-if="isRental && rentDates.start && rentDates.end" class="p-small t-transp">
              {{ returnCurrency() }}{{ price }} 
              <span v-if="quantity > 1">× {{ quantity }} {{ unit || 'pcs' }}</span>
              × {{ rentalDays }} days
            </span>
            <span v-else class="p-small t-transp">{{ returnCurrency() }}{{ price }} × {{ quantity || 0 }}  {{ unit || 'pcs' }}</span>
          </p>
          
          <p v-else-if="price != null && quantity == null" class="t-second mn-r-micro d-inline-block t-demi">
            {{ returnCurrency() }}{{ price }}
          </p>
          
          <p v-else-if="price == null && quantity != null" class="p-small t-transp">
            {{ quantity }} {{ unit || 'pcs' }}
          </p>
        </div>
        
        <slot></slot>
        <div v-if="showControls" class="mn-t-thin gap-thin flex-nojustify flex">
          <div 
            v-if="isRental && rentDates.start && rentDates.end" 
            class="flex gap-thin flex-v-center cursor-pointer pd-thin w-100 bg-light radius-small"
          >
            <IconCalendar
              @click="openRentDatePopup"
              class="cursor-pointer i-medium"
            />
            <p 
              @click="editable ? openRentDatePopup : null" 
              class="t-medium t-transp"
            >
              {{ formatDate(rentDates.start, { dayMonth: true, language: locale }) }} - 
              {{ formatDate(rentDates.end, { dayMonth: true, language: locale }) }}
            </p>
          </div>

          <template v-if="editable && !isRental">
            <IconAdd
              @click="increase"
              class="hover-scale-1 cursor-pointer bg-light i-big pd-thin radius-small"
            />
            <IconMinus
              @click="decrease"
              class="hover-scale-1 cursor-pointer bg-light i-big pd-thin radius-small"
            />
            <IconDelete
              @click="remove"
              class="hover-scale-1 cursor-pointer bg-light i-big pd-thin radius-small"
            />
          </template>

          <IconEdit
            v-if="isRental && editable"
            @click="openRentDatePopup"
            class="hover-scale-1 cursor-pointer bg-light i-big pd-small radius-small"
          />
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import IconAdd from '@martyrs/src/modules/icons/navigation/IconAdd.vue'
import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'
import IconMinus from '@martyrs/src/modules/icons/navigation/IconMinus.vue'
import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue'
import IconCalendar from '@martyrs/src/modules/icons/entities/IconCalendar.vue'
import PlaceholderImage from '@martyrs/src/modules/icons/placeholders/PlaceholderImage.vue'

const router = useRouter()
const { locale } = useI18n()
const { proxy } = getCurrentInstance()

const emits = defineEmits(['increase', 'decrease', 'remove', 'updateRentDates'])
const props = defineProps({
  productId: String,
  variantId: String,
  images: Array,
  name: String,
  quantity: Number,
  unit: String,
  dates: Object,
  listing: String,
  price: Number,
  editable: Boolean,
  increase: Function,
  decrease: Function,
  remove: Function,
})

const isRental = computed(() => props.listing === 'rent')
const showControls = computed(() => props.editable || isRental.value)

const rentDates = ref({
  start: props.dates?.start || null,
  end: props.dates?.end || null
})

const rentalDays = computed(() => {
  if (!rentDates.value.start || !rentDates.value.end) return 0
  const start = new Date(rentDates.value.start)
  const end = new Date(rentDates.value.end)
  return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1
})

const totalPrice = computed(() => {
  if (isRental.value) {
    return rentalDays.value * props.price * props.quantity
  }
  return props.quantity * props.price
})

const isRentDatePopupOpen = ref(false)

function increase() {
  props.increase?.()
  emits('increase')
}

function decrease() {
  props.decrease?.()
  emits('decrease')
}

function remove() {
  props.remove?.()
  emits('remove')
}

async function openRentDatePopup() {
  try {
    const selectedDates = await proxy.$dateSelector(
      props.productId,
      props.variantId,
      props.quantity,
      props.price,
      { 
        showCancelButton: props.editable,
        onCancel: props.editable ? () => props.remove?.() : null
      }
    );
    
    if (selectedDates) {
      updateRentDates(selectedDates)
    }
  } catch (error) {
    console.error('Error selecting dates:', error)
  }
}

function updateRentDates(dates) {
  rentDates.value = dates
  emits('updateRentDates', props.productId, props.variantId, dates)
}
</script>

<style lang="scss">
</style>