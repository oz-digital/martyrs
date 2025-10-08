<template>
  <div class="total-calculations">
    <!-- Base price calculation -->
    <p class="flex flex-nowrap pd-t-small">
      <span class="w-100 t-transp">{{ t('subtotal') }}</span>
      <span class="w-100 t-right">{{currency}}{{totalPrice}}</span>
    </p>
    
    <!-- Platform fee (conditional) -->
    <p v-if="showFees" class="flex flex-nowrap pd-t-small">
      <span class="w-100 t-transp">{{ t('feesRate') }}</span>
      <span class="w-100 t-right">{{currency}}{{feesRate}}</span>
    </p>
    
    <!-- VAT calculation (conditional) -->
    <p v-if="showVat" class="flex flex-nowrap pd-t-small">
      <span class="w-100 t-transp">{{ t('vat', { rate: vatRate * 100 }) }}</span>
      <span class="w-100 t-right">{{currency}}{{vatAmount}}</span>
    </p>

    <!-- Delivery fee (conditional) -->
    <p v-if="showDeliveryFee" class="flex flex-nowrap br-black-transp-10 br-solid br-b pd-b-small pd-t-small">
      <span class="w-100 t-transp">{{ t('delivery') }}</span>
      <span class="w-100 t-right">{{currency}}{{deliveryAmount}}</span>
    </p>
    
    <!-- Grand total -->
    <p class="p-medium flex flex-nowrap pd-b-small pd-t-small">
      <span class="w-100 t-medium">{{ t('intotal') }}</span>
      <span class="w-100 t-main t-medium t-right">{{currency}}{{grandTotal}}</span>
    </p>
  </div>
</template>


<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  totalPrice: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  showFees: {
    type: Boolean,
    default: false
  },
  feesRate: {
    type: Number,
    default: 0
  },
  showVat: {
    type: Boolean,
    default: false
  },
  vatRate: {
    type: Number,
    default: 0
  },
  showDeliveryFee: {
    type: Boolean,
    default: false
  },
  deliveryRate: {
    type: Number,
    default: 0
  }
});

const text = {
  messages: {
    en: {
      subtotal: 'Subtotal',
      feesRate: 'Platform Fee',
      vat: 'VAT ({rate}%)',
      delivery: 'Delivery',
      intotal: 'In Total'
    },
    ru: {
      subtotal: 'Подытог',
      feesRate: 'Плата за платформу',
      vat: 'НДС ({rate}%)',
      delivery: 'Доставка',
      intotal: 'Итого'
    }
  }
};

const { t } = useI18n(text);

const formatPrice = (value) => value.toFixed(0);

const vatAmount = computed(() => {
  if (!props.showVat) return 0;
  return formatPrice(props.totalPrice * props.vatRate);
});

const feesRate = computed(() => {
  if (!props.showFees) return 0;
  return formatPrice(props.totalPrice * props.feesRate);
});

const deliveryAmount = computed(() => {
  if (!props.showDeliveryFee) return 0;
  return formatPrice(props.deliveryRate);
});

const grandTotal = computed(() => {
  return formatPrice(
    parseFloat(props.totalPrice) +
    parseFloat(feesRate.value) +
    parseFloat(vatAmount.value) +
    parseFloat(deliveryAmount.value)
  );
});
</script>
