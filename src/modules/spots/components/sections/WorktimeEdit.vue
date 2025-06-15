<template>
  <div class="working-hours-editor w-100">
    <div class="mn-b-small flex flex-nowrap flex-v-center">
      <h4 class="mn-r-auto">{{ t('workingHours.title') }}</h4>
      <Button 
        class="bg-main"
        :submit="addRegularDay"
        :showSucces="false" 
        :showLoader="false"
      >
        {{ t('workingHours.addRegularDay') }}
      </Button>
    </div>

    <!-- Таблица для регулярных часов работы -->
    <div class="bg-white radius-small pd-small mn-b-medium">
      <h5 class="mn-b-small">{{ t('workingHours.regularSchedule') }}</h5>
      
      <div v-if="worktime.regular && worktime.regular.length > 0" class="regular-schedule mn-b-small">
        <div 
          v-for="(day, index) in worktime.regular" 
          :key="`regular-${index}`" 
          class="schedule-item pd-small mn-b-small flex flex-v-center flex-nowrap"
          :class="index % 2 === 0 ? 'bg-light' : ''"
        >
          <div class="day-info flex-child-1">
            <div class="day-name t-semi">{{ getWeekdayName(day.dayOfWeek) }}</div>
            <div class="day-hours" v-if="day.isOpen && day.periods && day.periods.length > 0">
              <template v-for="(period, pIndex) in day.periods" :key="`period-${pIndex}`">
                <span class="period t-small t-transp">
                  {{ period.open }} - {{ period.close }}
                </span>
                <span v-if="pIndex < day.periods.length - 1" class="t-small t-transp">, </span>
              </template>
            </div>
            <div v-else class="day-hours t-small t-transp t-red">
              {{ t('workingHours.closed') }}
            </div>
          </div>
          <div class="day-actions flex-nowrap flex gap-small">
            <Button 
              class="pd-micro bg-light"
              :submit="() => editRegularDay(index)"
              :showSucces="false" 
              :showLoader="false"
            >
              {{ t('workingHours.edit') }}
            </Button>
            <Button 
              class="pd-micro bg-fourth-nano"
              :submit="() => removeRegularDay(index)"
              :showSucces="false" 
              :showLoader="false"
            >
              {{ t('workingHours.remove') }}
            </Button>
          </div>
        </div>
      </div>
      <div v-else class="empty-schedule bg-light pd-medium radius-small t-center mn-b-small">
        {{ t('workingHours.noRegularSchedule') }}
      </div>
    </div>

    <!-- Таблица для особых дней -->
    <div class="bg-white radius-small pd-small mn-b-small">
      <div class="mn-b-small flex flex-nowrap flex-v-center">
        <h5 class="mn-r-auto">{{ t('workingHours.specialDays') }}</h5>
        <Button 
          class="bg-light mn-l-small"
          :submit="addSpecialDay"
          :showSucces="false" 
          :showLoader="false"
        >
          {{ t('workingHours.addSpecialDay') }}
        </Button>
      </div>
      <div v-if="worktime.special && worktime.special.length > 0" class="special-schedule mn-b-small">
        <div 
          v-for="(day, index) in worktime.special" 
          :key="`special-${index}`" 
          class="schedule-item pd-small mn-b-small flex flex-v-center flex-nowrap"
          :class="index % 2 === 0 ? 'bg-light' : ''"
        >
          <div class="day-info flex-child-1">
            <div class="flex flex-nowrap flex-v-center">
              <div class="day-name t-semi">{{ formatDate(day.date) }}</div>
              <div v-if="day.description" class="t-small t-transp mn-l-small">({{ day.description }})</div>
            </div>
            <div class="day-hours" v-if="day.isOpen && day.periods && day.periods.length > 0">
              <template v-for="(period, pIndex) in day.periods" :key="`special-period-${pIndex}`">
                <span class="period t-small t-transp">
                  {{ period.open }} - {{ period.close }}
                </span>
                <span v-if="pIndex < day.periods.length - 1" class="t-small t-transp">, </span>
              </template>
            </div>
            <div v-else class="day-hours t-small t-transp t-red">
              {{ t('workingHours.closed') }}
            </div>
          </div>
          <div class="day-actions flex-nowrap flex gap-small">
            <Button 
              class="pd-micro bg-light"
              :submit="() => editSpecialDay(index)"
              :showSucces="false" 
              :showLoader="false"
            >
              {{ t('workingHours.edit') }}
            </Button>
            <Button 
              class="pd-micro bg-fourth-nano"
              :submit="() => removeSpecialDay(index)"
              :showSucces="false" 
              :showLoader="false"
            >
              {{ t('workingHours.remove') }}
            </Button>
          </div>
        </div>
      </div>
      <div v-else class="empty-schedule bg-light pd-medium radius-small t-center">
        {{ t('workingHours.noSpecialDays') }}
      </div>
    </div>

    <!-- Модальное окно для добавления/редактирования регулярного дня -->
    <Popup 
      :isPopupOpen="showRegularDayModal" 
      @close-popup="showRegularDayModal = false"
      :title="editingRegularIndex !== null ? t('workingHours.editRegularDay') : t('workingHours.addRegularDay')"
      class="bg-white pd-semi w-m-33r radius-big"
    >
      <div class="schedule-editor">
        <Select 
          v-model:select="currentRegularDay.dayOfWeek"
          value="text"
          :options="availableWeekdays"
          property="value"
          class="pos-relative w-100 mn-b-small bg-light radius-small pd-medium"
        />

        <Checkbox 
          :label="t('workingHours.isOpen')"
          name="isOpenRegular"
          :value="true"
          :radio="currentRegularDay.isOpen"
          @update:radio="val => currentRegularDay.isOpen = val"
          class="w-100 mn-b-small bg-light radius-small pd-small"
        />
        
        <div v-if="currentRegularDay.isOpen">
          <div class="flex flex-nowrap flex-v-center mn-b-small">
            <h5 class="mn-r-auto">{{ t('workingHours.periods') }}</h5>
            <Button 
              class="pd-micro bg-light"
              :submit="addPeriodToRegular"
              :showSucces="false" 
              :showLoader="false"
            >
              {{ t('workingHours.addPeriod') }}
            </Button>
          </div>
          
          <div v-if="validationErrors.overlappingPeriods" class="error-message mn-b-small pd-small radius-small bg-fourth-nano">
            {{ t('workingHours.errorOverlappingPeriods') }}
          </div>
          
          <div 
            v-for="(period, pIndex) in currentRegularDay.periods" 
            :key="`edit-period-${pIndex}`"
            class="period-row mn-b-small flex flex-nowrap gap-small"
          >
            <div class="flex-child-1 time-inputs cols-2 gap-small">
              <Field 
                v-model:field="period.open"
                :label="t('workingHours.opens')"
                type="time"
                class="bg-light radius-small pd-medium"
                @blur="validatePeriods"
              />
              <Field 
                v-model:field="period.close"
                :label="t('workingHours.closes')"
                type="time"
                class="bg-light radius-small pd-medium"
                @blur="validatePeriods"
              />
            </div>
            <Button 
              v-if="currentRegularDay.periods.length > 1"
              class="pd-micro bg-fourth-nano"
              :submit="() => removeRegularPeriod(pIndex)"
              :showSucces="false" 
              :showLoader="false"
            >
              {{ t('workingHours.remove') }}
            </Button>
          </div>
        </div>
        
        <div class="button-group flex flex-nowrap gap-small mn-t-medium">
          <Button 
            class="w-100 bg-light"
            :submit="() => showRegularDayModal = false"
            :showSucces="false" 
            :showLoader="false"
          >
            {{ t('workingHours.cancel') }}
          </Button>
          <Button 
            class="w-100 bg-main"
            :submit="saveRegularDay"
            :showSucces="false"
            :disabled="!isValidRegularDay"
          >
            {{ t('workingHours.save') }}
          </Button>
        </div>
      </div>
    </Popup>

    <!-- Модальное окно для добавления/редактирования особого дня -->
    <Popup 
      :isPopupOpen="showSpecialDayModal" 
      @close-popup="showSpecialDayModal = false"
      :title="editingSpecialIndex !== null ? t('workingHours.editSpecialDay') : t('workingHours.addSpecialDay')"
      class="bg-white pd-semi w-m-33r radius-big"
    >
      <div class="schedule-editor">
        <Field 
          v-model:field="currentSpecialDay.dateInput"
          :label="t('workingHours.date')"
          type="date"
          class="bg-light radius-small pd-medium mn-b-small"
          @blur="validateSpecialDate"
        />
        
        <div v-if="validationErrors.duplicateDate" class="error-message mn-b-small pd-small radius-small bg-fourth-nano">
          {{ t('workingHours.errorDuplicateDate') }}
        </div>
        
        <Field 
          v-model:field="currentSpecialDay.description"
          :label="t('workingHours.description')"
          :placeholder="t('workingHours.descriptionPlaceholder')"
          class="bg-light radius-small pd-medium mn-b-small"
        />

        <Checkbox 
          :label="t('workingHours.isOpen')"
          name="isOpenSpecial"
          :value="true"
          :radio="currentSpecialDay.isOpen"
          @update:radio="val => currentSpecialDay.isOpen = val"
          class="w-100 mn-b-small bg-white radius-small pd-small"
        />
        
        <div v-if="currentSpecialDay.isOpen">
          <div class="flex flex-nowrap flex-v-center mn-b-small">
            <h5 class="mn-r-auto">{{ t('workingHours.periods') }}</h5>
            <Button 
              class="pd-micro bg-light"
              :submit="addPeriodToSpecial"
              :showSucces="false" 
              :showLoader="false"
            >
              {{ t('workingHours.addPeriod') }}
            </Button>
          </div>
          
          <div v-if="validationErrors.overlappingPeriods" class="error-message mn-b-small pd-small radius-small bg-fourth-nano">
            {{ t('workingHours.errorOverlappingPeriods') }}
          </div>
          
          <div 
            v-for="(period, pIndex) in currentSpecialDay.periods" 
            :key="`edit-special-period-${pIndex}`"
            class="period-row mn-b-small flex flex-nowrap gap-small"
          >
            <div class="flex-child-1 time-inputs cols-2 gap-small">
              <Field 
                v-model:field="period.open"
                :label="t('workingHours.opens')"
                type="time"
                class="bg-light radius-small pd-medium"
                @blur="validatePeriods"
              />
              <Field 
                v-model:field="period.close"
                :label="t('workingHours.closes')"
                type="time"
                class="bg-light radius-small pd-medium"
                @blur="validatePeriods"
              />
            </div>
            <Button 
              v-if="currentSpecialDay.periods.length > 1"
              class="pd-micro bg-fourth-nano"
              :submit="() => removeSpecialPeriod(pIndex)"
              :showSucces="false" 
              :showLoader="false"
            >
              {{ t('workingHours.remove') }}
            </Button>
          </div>
        </div>
        
        <div class="button-group flex flex-nowrap gap-small mn-t-medium">
          <Button 
            class="w-100 bg-light"
            :submit="() => showSpecialDayModal = false"
            :showSucces="false" 
            :showLoader="false"
          >
            {{ t('workingHours.cancel') }}
          </Button>
          <Button 
            class="w-100 bg-main"
            :submit="saveSpecialDay"
            :showSucces="false"
            :disabled="!isValidSpecialDay"
          >
            {{ t('workingHours.save') }}
          </Button>
        </div>
      </div>
    </Popup>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import Button from '@martyrs/src/components/Button/Button.vue';
import Field from '@martyrs/src/components/Field/Field.vue';
import Select from '@martyrs/src/components/Select/Select.vue';
import Checkbox from '@martyrs/src/components/Checkbox/Checkbox.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';

const worktime = defineModel('worktime')
const emit = defineEmits(['update:worktime']);

// i18n
const { t, locale } = useI18n({
  messages: {
    en: {
      workingHours: {
        title: 'Working Hours',
        regularSchedule: 'Regular Schedule',
        specialDays: 'Special Days',
        addRegularDay: 'Add Day',
        addSpecialDay: 'Add Day',
        editRegularDay: 'Edit Regular Day',
        editSpecialDay: 'Edit Special Day',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        remove: 'Remove',
        weekday: 'Weekday',
        date: 'Date',
        isOpen: 'Open on this day',
        description: 'Description',
        descriptionPlaceholder: 'Holiday, Special event, etc.',
        periods: 'Operating Hours',
        addPeriod: 'Add Period',
        opens: 'Opens at',
        closes: 'Closes at',
        closed: 'Closed',
        noRegularSchedule: 'No regular schedule set. Add working days to define your regular hours.',
        noSpecialDays: 'No special days set. Add special days for holidays or events.',
        errorDuplicateDate: 'This date already exists in special days.',
        errorOverlappingPeriods: 'Time periods cannot overlap.',
        selectDate: 'Please select a date.',
        errorInvalidPeriod: 'Invalid time period. Closing time must be after opening time.'
      }
    },
    ru: {
      workingHours: {
        title: 'Часы работы',
        regularSchedule: 'Регулярное расписание',
        specialDays: 'Особые дни',
        addRegularDay: 'Добавить день',
        addSpecialDay: 'Добавить особый день',
        editRegularDay: 'Изменить рабочий день',
        editSpecialDay: 'Изменить особый день',
        save: 'Сохранить',
        cancel: 'Отмена',
        edit: 'Изменить',
        remove: 'Удалить',
        weekday: 'День недели',
        date: 'Дата',
        isOpen: 'Открыто в этот день',
        description: 'Описание',
        descriptionPlaceholder: 'Праздник, особое событие и т.д.',
        periods: 'Часы работы',
        addPeriod: 'Добавить период',
        opens: 'Открывается в',
        closes: 'Закрывается в',
        closed: 'Закрыто',
        noRegularSchedule: 'Регулярное расписание не установлено. Добавьте рабочие дни для определения регулярных часов.',
        noSpecialDays: 'Особые дни не установлены. Добавьте особые дни для праздников или событий.',
        errorDuplicateDate: 'Эта дата уже существует в особых днях.',
        errorOverlappingPeriods: 'Временные периоды не могут пересекаться.',
        selectDate: 'Пожалуйста, выберите дату.',
        errorInvalidPeriod: 'Недопустимый временной период. Время закрытия должно быть после времени открытия.'
      }
    }
  }
});

// Форматирование даты с использованием браузерных API
const formatDate = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
};

// Получение названия дня недели по номеру
const getWeekdayName = (dayNumber) => {
  if (dayNumber === undefined || dayNumber === null) return '';
  
  // Создаем дату с известным начальным днем недели (1 января 2023 - воскресенье)
  const date = new Date(2023, 0, 1 + dayNumber);
  
  return new Intl.DateTimeFormat(locale.value, { weekday: 'long' }).format(date);
};

// Состояние для модальных окон
const showRegularDayModal = ref(false);
const showSpecialDayModal = ref(false);

// Индексы для редактирования
const editingRegularIndex = ref(null);
const editingSpecialIndex = ref(null);

// Валидация
const validationErrors = ref({
  overlappingPeriods: false,
  duplicateDate: false,
  invalidPeriod: false
});

// Текущие значения для редактирования
const currentRegularDay = ref({
  dayOfWeek: 1, // Понедельник по умолчанию
  isOpen: true,
  periods: [{
    open: '09:00',
    close: '18:00'
  }]
});

const currentSpecialDay = ref({
  dateInput: '', // Для ввода даты в формате YYYY-MM-DD
  date: null,
  description: '',
  isOpen: false,
  periods: [{
    open: '09:00',
    close: '18:00'
  }]
});

// Список доступных дней недели (0-6)
const weekdays = [0, 1, 2, 3, 4, 5, 6];

// Получаем доступные дни недели (исключая те, которые уже добавлены)
const availableWeekdays = computed(() => {
  const usedDays = new Set((worktime.value?.regular || []).map(d => d.dayOfWeek));
  
  // Фильтруем дни, которые еще не добавлены или это текущий редактируемый день
  return weekdays
    .filter(day => 
      !usedDays.has(day) || 
      (editingRegularIndex.value !== null && 
       worktime.value?.regular[editingRegularIndex.value]?.dayOfWeek === day)
    )
    .map(day => ({
      text: getWeekdayName(day),
      value: day
    }));
});

// Проверка валидности текущего состояния
const isValidRegularDay = computed(() => {
  return !validationErrors.value.overlappingPeriods && !validationErrors.value.invalidPeriod;
});

const isValidSpecialDay = computed(() => {
  return !validationErrors.value.duplicateDate && 
         !validationErrors.value.overlappingPeriods && 
         !validationErrors.value.invalidPeriod && 
         !!currentSpecialDay.value.dateInput;
});

// Функции добавления дней
const addRegularDay = () => {
  editingRegularIndex.value = null;
  currentRegularDay.value = {
    dayOfWeek: availableWeekdays.value[0]?.value ?? 1,
    isOpen: true,
    periods: [{
      open: '09:00',
      close: '18:00'
    }]
  };
  validationErrors.value = {
    overlappingPeriods: false,
    duplicateDate: false,
    invalidPeriod: false
  };
  showRegularDayModal.value = true;
};

const addSpecialDay = () => {
  editingSpecialIndex.value = null;
  // Устанавливаем текущую дату по умолчанию
  const today = new Date();
  const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  currentSpecialDay.value = {
    dateInput: todayFormatted,
    date: today,
    description: '',
    isOpen: false,
    periods: [{
      open: '09:00',
      close: '18:00'
    }]
  };
  
  validationErrors.value = {
    overlappingPeriods: false,
    duplicateDate: false,
    invalidPeriod: false
  };
  
  showSpecialDayModal.value = true;
  
  // Сразу проверяем на дублирование даты
  validateSpecialDate();
};

// Валидация периодов (проверка на пересечение)
const validatePeriods = () => {
  const periods = showRegularDayModal.value ? 
                 currentRegularDay.value.periods : 
                 currentSpecialDay.value.periods;
  
  if (!periods || periods.length <= 1) {
    validationErrors.value.overlappingPeriods = false;
    validationErrors.value.invalidPeriod = false;
    return;
  }
  
  // Проверка на недопустимые периоды (конец раньше начала)
  validationErrors.value.invalidPeriod = periods.some(period => 
    period.open >= period.close
  );
  
  if (validationErrors.value.invalidPeriod) {
    return;
  }
  
  // Сортируем периоды по времени начала
  const sortedPeriods = [...periods].sort((a, b) => a.open.localeCompare(b.open));
  
  // Проверяем пересечения
  for (let i = 0; i < sortedPeriods.length - 1; i++) {
    if (sortedPeriods[i].close > sortedPeriods[i + 1].open) {
      validationErrors.value.overlappingPeriods = true;
      return;
    }
  }
  
  validationErrors.value.overlappingPeriods = false;
};

// Валидация даты для особого дня (проверка на дублирование)
const validateSpecialDate = () => {
  if (!currentSpecialDay.value.dateInput) {
    validationErrors.value.duplicateDate = false;
    return;
  }
  
  const newDateObj = new Date(currentSpecialDay.value.dateInput);
  newDateObj.setHours(0, 0, 0, 0); // Нормализуем время
  
  const isDuplicate = worktime.value.special.some((specialDay, index) => {
    if (editingSpecialIndex.value === index) return false; // Пропускаем текущий редактируемый день
    
    const existingDate = new Date(specialDay.date);
    existingDate.setHours(0, 0, 0, 0); // Нормализуем время
    
    return existingDate.getTime() === newDateObj.getTime();
  });
  
  validationErrors.value.duplicateDate = isDuplicate;
};

// Методы для работы с регулярными днями
const editRegularDay = (index) => {
  editingRegularIndex.value = index;
  const day = JSON.parse(JSON.stringify(worktime.value.regular[index]));
  
  // Если нет периодов, добавляем пустой
  if (!day.periods || day.periods.length === 0) {
    day.periods = [{
      open: '09:00',
      close: '18:00'
    }];
  }
  
  currentRegularDay.value = day;
  validationErrors.value = {
    overlappingPeriods: false,
    duplicateDate: false,
    invalidPeriod: false
  };
  showRegularDayModal.value = true;
  
  // Валидируем периоды
  validatePeriods();
};

const removeRegularDay = (index) => {
  const updatedWorktime = { ...worktime.value };
  updatedWorktime.regular.splice(index, 1);
  emit('update:worktime', updatedWorktime);
};

const saveRegularDay = () => {
  // Проверяем валидность
  validatePeriods();
  if (!isValidRegularDay.value) {
    return;
  }
  
  // Копируем текущее значение модели
  const updatedWorktime = JSON.parse(JSON.stringify(worktime.value));
  
  // Убеждаемся, что regular существует
  if (!updatedWorktime.regular) {
    updatedWorktime.regular = [];
  }
  
  // Копируем текущий день
  const dayToSave = { ...currentRegularDay.value };
  
  // Если день закрыт, удаляем периоды
  if (!dayToSave.isOpen) {
    dayToSave.periods = [];
  }
  
  // Обновляем или добавляем
  if (editingRegularIndex.value !== null) {
    updatedWorktime.regular[editingRegularIndex.value] = dayToSave;
  } else {
    updatedWorktime.regular.push(dayToSave);
  }
  
  // Сортируем по дням недели
  updatedWorktime.regular.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  
  // Обновляем модель
  worktime.value = updatedWorktime
  emit('update:worktime', updatedWorktime);
  showRegularDayModal.value = false;
};

const addPeriodToRegular = () => {
  currentRegularDay.value.periods.push({
    open: '09:00',
    close: '18:00'
  });
  validatePeriods();
};

const removeRegularPeriod = (index) => {
  currentRegularDay.value.periods.splice(index, 1);
  validatePeriods();
};

// Методы для работы с особыми днями
const editSpecialDay = (index) => {
  editingSpecialIndex.value = index;
  const day = JSON.parse(JSON.stringify(worktime.value.special[index]));
  
  // Форматируем дату для поля ввода
  const date = new Date(day.date);
  const dateForInput = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  // Если нет периодов, добавляем пустой
  if (!day.periods || day.periods.length === 0) {
    day.periods = [{
      open: '09:00',
      close: '18:00'
    }];
  }
  
  currentSpecialDay.value = {
    ...day,
    dateInput: dateForInput
  };
  
  validationErrors.value = {
    overlappingPeriods: false,
    duplicateDate: false,
    invalidPeriod: false
  };
  showSpecialDayModal.value = true;
  
  // Валидируем периоды
  validatePeriods();
};

const removeSpecialDay = (index) => {
  const updatedWorktime = { ...worktime.value };
  updatedWorktime.special.splice(index, 1);
  emit('update:worktime', updatedWorktime);
};

const saveSpecialDay = () => {
  // Проверяем валидность
  validateSpecialDate();
  validatePeriods();
  
  if (!isValidSpecialDay.value) {
    if (!currentSpecialDay.value.dateInput) {
      alert(t('workingHours.selectDate'));
    }
    return;
  }
  
  // Копируем текущее значение модели
  const updatedWorktime = JSON.parse(JSON.stringify(worktime.value));
  
  // Убеждаемся, что special существует
  if (!updatedWorktime.special) {
    updatedWorktime.special = [];
  }
  
  // Преобразуем дату из input в объект Date
  const dateParts = currentSpecialDay.value.dateInput.split('-');
  const specialDate = new Date(
    parseInt(dateParts[0]), 
    parseInt(dateParts[1]) - 1, 
    parseInt(dateParts[2])
  );
  
  // Копируем текущий день и обновляем дату
  const dayToSave = { 
    ...currentSpecialDay.value,
    date: specialDate
  };
  
  // Удаляем вспомогательное поле
  delete dayToSave.dateInput;
  
  // Если день закрыт, удаляем периоды
  if (!dayToSave.isOpen) {
    dayToSave.periods = [];
  }
  
  // Обновляем или добавляем
  if (editingSpecialIndex.value !== null) {
    updatedWorktime.special[editingSpecialIndex.value] = dayToSave;
  } else {
    updatedWorktime.special.push(dayToSave);
  }
  
  // Сортируем по датам
  updatedWorktime.special.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Обновляем модель
  emit('update:worktime', updatedWorktime);
  showSpecialDayModal.value = false;
};

const addPeriodToSpecial = () => {
  currentSpecialDay.value.periods.push({
    open: '09:00',
    close: '18:00'
  });
  validatePeriods();
};

const removeSpecialPeriod = (index) => {
  currentSpecialDay.value.periods.splice(index, 1);
  validatePeriods();
};

// Инициализация значений при монтировании
onMounted(() => {
  // Проверяем, что начальное значение модели имеет правильную структуру
  if (!worktime.value.regular || !worktime.value.special  ) worktime.value = {
    regular: [],
    special: []
  }
  // emit('update:worktime', worktime.value);
});
</script>

<style scoped>
.working-hours-editor {
  border-radius: 8px;
}

.schedule-item {
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(var(--grey), 0.1);
}

.schedule-item:last-child {
  border-bottom: none;
}

.period {
  display: inline-block;
}

.empty-schedule {
  color: rgba(var(--dark), 0.6);
}

.period-row {
  align-items: center;
}

.error-message {
  color: white;
}
</style>