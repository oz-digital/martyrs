<template>
  <div
    :class="[
      $attrs.class,
      'field-date field-wrapper pos-relative',
      { 'focus-within': isCalendarOpen }
    ]"
  >
    <div
      @click="toggleCalendar"
      class="flex-center flex-nowrap flex cursor-pointer"
    >
      <div
        v-if="label"
        class="t-transp mn-r-small"
      >
        <span class="t-nowrap">
          {{ label }}
        </span>
      </div>

      <div class="w-100">
        <span v-if="formattedDate" class="t-black">{{ formattedDate }}</span>
        <span v-else class="t-transp">{{ placeholder }}</span>
      </div>
    </div>

    <div
      v-if="isCalendarOpen"
      class="field-date__dropdown pos-absolute w-100"
    >
      <Calendar
        v-model:date="dateValue"
        :allowRange="allowRange"
        :disabled="disabled"
        :enableTime="enableTime"
        :disablePastDates="disablePastDates"
        :disabledRanges="disabledRanges"
        :availabilityData="availabilityData"
        :showAvailability="showAvailability"
        :lowAvailabilityThreshold="lowAvailabilityThreshold"
        :requiredQuantity="requiredQuantity"
        :locale="locale"
        :showSelected="showSelected"
        @select="handleSelect"
        @cancel="handleCancel"
        class="radius-medium w-100 o-hidden bg-white"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Calendar from '@martyrs/src/components/Calendar/Calendar.vue';

const props = defineProps({
  modelValue: {
    type: [Date, Object],
    default: null
  },
  label: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: 'Select date'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  allowRange: {
    type: Boolean,
    default: false
  },
  enableTime: {
    type: Boolean,
    default: false
  },
  disablePastDates: {
    type: Boolean,
    default: false
  },
  disabledRanges: {
    type: Array,
    default: () => []
  },
  availabilityData: {
    type: Array,
    default: () => []
  },
  showAvailability: {
    type: Boolean,
    default: false
  },
  lowAvailabilityThreshold: {
    type: Number,
    default: 3
  },
  requiredQuantity: {
    type: Number,
    default: 1
  },
  locale: {
    type: String,
    default: 'en'
  },
  showSelected: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const isCalendarOpen = ref(false);

const dateValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);

    // If showSelected is enabled, don't auto-close - user must click select/cancel
    if (props.showSelected) return;

    // Close calendar after single date selection
    if (!props.allowRange) {
      closeCalendar();
    }
    // Close calendar after range end date selection
    if (props.allowRange && value?.start && value?.end) {
      closeCalendar();
    }
  }
});

const formattedDate = computed(() => {
  if (!props.modelValue) return '';

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    if (props.enableTime) {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}, ${day}.${month}.${year}`;
    }

    return `${day}.${month}.${year}`;
  };

  if (props.allowRange && props.modelValue?.start) {
    const start = formatDate(props.modelValue.start);
    const end = props.modelValue.end ? formatDate(props.modelValue.end) : '...';
    return `${start} - ${end}`;
  }

  return formatDate(props.modelValue);
});

function toggleCalendar() {
  if (props.disabled) return;
  isCalendarOpen.value = !isCalendarOpen.value;
}

function closeCalendar() {
  isCalendarOpen.value = false;
}

function handleSelect() {
  closeCalendar();
}

function handleCancel() {
  closeCalendar();
}
</script>

<style scoped>
.field-date__dropdown {
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 1000;
}
</style>
