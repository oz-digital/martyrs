<template>
  <Block
    title="Discounts"
    placeholder="No discounts added yet"
    :actions="[{
      label: '+',
      function: () => openDiscountPopup()
    }]"
  >
    <div v-if="discounts.length > 0" class="cols-1 gap-thin">
      <div
        v-for="(discount, index) in discounts"
        :key="index"
        class="bg-white radius-small pd-small flex-nowrap flex-v-center flex gap-thin"
      >
        <div class="w-100">
          <p class="p-regular mn-b-thin t-medium d-block">{{ discount.name || 'Unnamed discount' }}</p>
          <p class="t-medium t-transp">
            <template v-if="discount.type === 'special_price'">
              Special price: {{ formatPrice(discount.value) }}
            </template>
            <template v-else>
              {{ discount.value }}% off
            </template>
          </p>
          <p v-if="discount.date && (discount.date.start || discount.date.end)" class="t-small t-transp">
            {{ formatDateRange(discount.date) }}
          </p>
        </div>
        
        <div class="flex gap-thin">
          <div @click="() => openDiscountPopup(index)" class="radius-small pd-small flex-center flex aspect-1x1 bg-light cursor-pointer hover-scale-1">
            <IconEdit
              class="i-medium"
            />
          </div>
          <div @click="() => discounts.splice(index, 1)" class="radius-small pd-small flex-center flex aspect-1x1 bg-red cursor-pointer hover-scale-1">
            <IconDelete
              class="i-medium"
            />
          </div>
        </div>
      </div>
    </div>
  </Block>

  <Popup
    title="Edit Discount"
    @close-popup="closeDiscountPopup"
    :isPopupOpen="isDiscountPopupOpen"
    class="bg-white w-max-40r radius-medium pd-medium"
  >
    <div class="cols-1 gap-thin">
      <Field
        v-model:field="currentDiscount.name"
        label="Name"
        placeholder="Discount Name"
        class="w-100 bg-light radius-small pd-small"
      />

      <Field
        v-model:field="currentDiscount.description"
        label="Description"
        type="textarea"
        placeholder="Discount Description"
        class="w-100 bg-light radius-small pd-small"
      />

      <Field
        v-model:field="currentDiscount.value"
       :label="currentDiscount.type === 'special_price' ? 'Special Price' : 'Discount'"
        :placeholder="currentDiscount.type === 'special_price' ? 'New price' : 'Discount percentage'"
        class="w-100 bg-light radius-small pd-small"
      >
        <Select 
          v-model:select="currentDiscount.type" 
          placeholder="Select type"
          value="label"
          property="value"
          :options="[
            { value: 'discount', label: 'Discount (%)' },
            { value: 'special_price', label: 'Special Price' },
          ]"
          class="pos-relative t-nowrap bg-white gap-small flex flex-column pd-thin radius-thin"
        />
      </Field>

      <Field
        v-model:field="currentDiscount.quantity"
        label="Quantity"
        type="number"
        placeholder="Quantity to get discount"
        class="w-100 bg-light radius-small pd-small"
      />

      <div class="t-medium mn-t-micro mn-b-micro">Date Range</div>
      <div class="cols-2 mobile:cols-1 gap-thin">
        <Field
          v-model:field="currentDiscount.date.start"
          label="Start Date"
          type="date"
          class="w-100 bg-light radius-small pd-small"
        />
        
        <Field
          v-model:field="currentDiscount.date.end"
          label="End Date"
          type="date"
          class="w-100 bg-light radius-small pd-small"
        />
      </div>

      <div class="t-medium mn-t-micro mn-b-micro">Time Range</div>
      <div class="cols-2 mobile:cols-1 gap-thin">
        <Field
          v-model:field="currentDiscount.time.start"
          label="Start Time"
          type="time"
          class="w-100 bg-light radius-small pd-small"
        />
        
        <Field
          v-model:field="currentDiscount.time.end"
          label="End Time"
          type="time"
          class="w-100 bg-light radius-small pd-small"
        />
      </div>
      
    
     
      <div class="flex gap-thin mn-t-medium">
        <Button
          :showSuccess="false"
          :showLoader="false"
          class="bg-red t-white w-100"
          @click="closeDiscountPopup"
        >
          Cancel
        </Button>
        <Button
          class="bg-main w-100"
          @click="saveDiscount"
        >
          Save Discount
        </Button>
      </div>
    </div>
  </Popup>
</template>

<script setup>
import { ref, reactive, defineModel, computed } from 'vue';
import Block from '@martyrs/src/components/Block/Block.vue';
import Field from '@martyrs/src/components/Field/Field.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import Select from '@martyrs/src/components/Select/Select.vue';
import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue';
import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';

// Используем defineModel для более простой работы с v-model в родительском компоненте
const discounts = defineModel('discounts', { default: () => [] });

// Локальное состояние
const isDiscountPopupOpen = ref(false);
const editingDiscountIndex = ref(null);
const currentDiscount = reactive({
  name: '',
  description: '',
  type: 'discount', // discount или special_price
  value: 0,
  quantity: 1,
  date: {
    start: null,
    end: null
  },
  time: {
    start: '',
    end: ''
  },
  users: []
});

// Используется для форматирования диапазона дат
function formatDateRange(dateRange) {
  if (!dateRange) return '';
  
  let result = '';
  
  if (dateRange.start) {
    const startDate = new Date(dateRange.start);
    result += startDate.toLocaleDateString();
  }
  
  result += ' - ';
  
  if (dateRange.end) {
    const endDate = new Date(dateRange.end);
    result += endDate.toLocaleDateString();
  }
  
  return result;
}

// Функция открытия попапа добавления/редактирования
function openDiscountPopup(index) {
  // Если передан индекс, это редактирование существующей скидки
  if (index !== undefined) {
    editingDiscountIndex.value = index;
    const discount = discounts.value[index];
    
    // Копируем данные в currentDiscount
    Object.assign(currentDiscount, {
      name: discount.name || '',
      description: discount.description || '',
      type: discount.type || 'discount',
      value: discount.value || 0,
      quantity: discount.quantity || 1,
      date: {
        start: discount.date?.start || null,
        end: discount.date?.end || null
      },
      time: {
        start: discount.time?.start || '',
        end: discount.time?.end || ''
      },
      users: Array.isArray(discount.users) ? [...discount.users] : []
    });
  } else {
    // Сброс данных при создании новой скидки
    editingDiscountIndex.value = null;
    Object.assign(currentDiscount, {
      name: '',
      description: '',
      type: 'discount',
      value: 0,
      quantity: 1,
      date: {
        start: null,
        end: null
      },
      time: {
        start: '',
        end: ''
      },
      users: []
    });
  }
  
  isDiscountPopupOpen.value = true;
}

// Закрытие попапа
function closeDiscountPopup() {
  isDiscountPopupOpen.value = false;
  editingDiscountIndex.value = null;
}



// Сохранение скидки
function saveDiscount() {
  // Проверка на основные поля
  if (currentDiscount.type === 'discount' && (currentDiscount.value < 0 || currentDiscount.value > 100)) {
    alert('Discount value must be between 0 and 100');
    return;
  }

  if (currentDiscount.type === 'special_price' && currentDiscount.value < 0) {
    alert('Special price must be greater than or equal to 0');
    return;
  }

  // Создаем копию текущей скидки для сохранения
  const discountToSave = {
    name: currentDiscount.name,
    description: currentDiscount.description,
    type: currentDiscount.type || 'discount',
    value: parseFloat(currentDiscount.value) || 0,
    quantity: parseInt(currentDiscount.quantity) || 1,
    date: {
      start: currentDiscount.date.start,
      end: currentDiscount.date.end
    },
    time: {
      start: currentDiscount.time.start,
      end: currentDiscount.time.end
    },
    users: [...currentDiscount.users]
  };

  // Если редактируем существующую скидку
  if (editingDiscountIndex.value !== null) {
    // Обновляем существующую скидку
    discounts.value.splice(editingDiscountIndex.value, 1, discountToSave);
  } else {
    // Добавляем новую скидку
    if (!discounts.value) {
      discounts.value = [];
    }
    discounts.value.push(discountToSave);
  }

  // Закрываем попап
  closeDiscountPopup();
}
</script>