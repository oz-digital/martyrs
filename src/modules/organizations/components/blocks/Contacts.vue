<template>
  <div class="mn-b-small w-100">
    <a v-if="formattedWebsite" :href="formattedWebsite" target="_blank" class="w-100 br-2px br-solid br-grey-transp-25 radius-small pd-small flex-v-center flex-nowrap flex">
      <!-- <img loading="lazy" class="i-medium mn-r-small" src="@/assets/icons/website.svg"> -->
      <span class="t-semi uppercase">Website</span>
    </a>
    <a v-if="props.phone" :href="`tel:${props.phone}`" class="w-100 br-2px br-solid br-grey-transp-25 radius-small pd-small flex-v-center flex-nowrap flex">
      <!-- <img loading="lazy" class="i-medium mn-r-small" src="@/assets/icons/phone.svg"> -->
      <span class="t-semi uppercase">Phone</span>
    </a>
    <a v-if="props.email" :href="`mailto:${props.email}`" target="_blank" class="w-100 br-2px br-solid br-grey-transp-25 radius-small pd-small flex-v-center flex-nowrap flex">
      <!-- <img loading="lazy" class="i-medium mn-r-small" src="@/assets/icons/email.svg"> -->
      <span class="t-semi uppercase">Email</span>
    </a>
    <a v-if="encodedAddress" :href="`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`" target="_blank" class="w-100 br-2px br-solid br-grey-transp-25 radius-small pd-small flex-v-center flex-nowrap flex">
      <!-- <img loading="lazy" class="i-medium mn-r-small" src="@/assets/icons/address.svg"> -->
      <span class="t-semi uppercase">Address</span>
    </a>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  website: String,
  phone: String,
  email: String,
  address: String
});

const formattedWebsite = computed(() => {
  if (props.website) {
    if (!props.website.startsWith('http://') && !props.website.startsWith('https://')) {
      return `http://${props.website}`;
    }
    return props.website;
  }
  return null;
});

const encodedAddress = computed(() => {
  if (props.address) {
    return encodeURIComponent(props.address);
  }
  return null;
});
</script>
