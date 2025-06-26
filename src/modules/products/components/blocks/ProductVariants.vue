<template>
  <div class="w-100">
    <div v-if="selected" class="mn-b-small">
      <span class="h2 t-bold">${{ selected.price.toFixed(2) }}</span>
    </div>

    <div
      v-for="group in groups"
      :key="group.label"
      class="w-100 mn-b-medium"
    >
      <p class="capitalize mn-b-thin t-medium">{{ group.label }}</p>

      <div class="flex flex-wrap gap-thin mn-b-medium">
        <button
          v-for="item in group.items"
          :key="item.key"
          @click="group.label === 'Options' ? pick(item.variant) : pickAttr(group.label, item.value)"
          :disabled="item.off"
          class="pd-small radius-small"
          :class="[
            isSelected(group, item) ? 'br-main' : 'br-black-transp-10',
            item.off ? 'o-50 cursor-not-allowed' : 'cursor-pointer hover-scale-1',
          ]"
        >
          <img
            v-if="item.img"
            :src="`${FILE_SERVER_URL}${item.img}`"
            class="h-100 radius-thin aspect-1x1 object-fit-contain"
          />
          <p class="">
            {{ item.text }}
          </p>

          <div
            v-if="isSelected(group, item)"
            class="pos-absolute pos-b-0 pos-r-0 pos-l-0 flex flex-center h-1r bg-main t-white t-small"
          >
            Selected
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({ productVariants: Array });
const emit = defineEmits(['variant-selected', 'update-images']);

const selectedAttributes = ref({});
const selected = ref(null);

const hasAttrs = computed(() =>
  props.productVariants.some(v => v.attributes?.length)
);

const groups = computed(() => {
  if (hasAttrs.value) {
    const labels = [...new Set(props.productVariants[0].attributes.map(a => a.name))];
    return labels.map((lbl, i) => ({
      label: lbl,
      items: [...new Set(
        props.productVariants.map(v => v.attributes.find(a => a.name === lbl)?.value)
      )]
        .filter(Boolean)
        .map(val => {
          const v = props.productVariants.find(x => x.attributes.find(a => a.name === lbl && a.value === val));
          return {
            key: lbl + val,
            value: val,
            img: i === 0 ? v.images?.[0] : null,
            off: !v.available,
            text: val,
          };
        }),
    }));
  }
  if (props.productVariants.length > 1) {
    return [{
      label: 'Options',
      items: props.productVariants.map(v => ({
        key: v._id,
        variant: v,
        img: v.images?.[0],
        off: !v.available,
        text: v.name || v.sku,
      })),
    }];
  }
  return [];
});

const pick = v => {
  if (!v.available) return;
  selectedAttributes.value = Object.fromEntries(v.attributes?.map(a => [a.name, a.value]) || []);
  selected.value = v;
  emit('variant-selected', v);
  v.images?.length && emit('update-images', v.images);
};

const pickAttr = (lbl, val) => {
  const test = { ...selectedAttributes.value, [lbl]: val };
  if (!props.productVariants.some(v =>
    Object.entries(test).every(([k, x]) =>
      v.attributes.find(a => a.name === k && a.value === x)
    )
  )) return;
  selectedAttributes.value = test;
};

watch(selectedAttributes, attrs => {
  const m = props.productVariants.find(v =>
    Object.entries(attrs).every(([k, x]) => v.attributes.find(a => a.name === k && a.value === x))
  );
  m ? pick(m) : (selected.value = null);
});

onMounted(() => props.productVariants.length === 1 && pick(props.productVariants[0]));

const isSelected = (g, i) =>
  g.label === 'Options'
    ? selected.value?._id === i.variant?._id
    : selectedAttributes.value[g.label] === i.value;
</script>
