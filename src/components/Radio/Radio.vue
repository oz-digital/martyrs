<template>
  <label class="flex-v-center flex-nowrap flex">
    <!-- ////////////////////////// -->
    <!-- Checkmark -->
    <!-- ////////////////////////// -->
    <div 
      class="cursor-pointer radius-extra pd-micro h-100 aspect-1x1 pos-relative"
      :class="{
        'bg-main': radio === value,
      }"
    >
      <div 
        class="radius-extra pd-micro w-100 h-100"
        :class="{
          'bg-white': radio === value,
        }"
      >

      </div> 

      <div 
        v-if="radio !== value"
        class="br-solid br-2px br-grey-transp-25 pos-absolute pos-t-0 pos-r-0 radius-extra w-100 h-100"
      >

      </div> 
    </div> 
    <!-- ////////////////////////// -->
    <!-- Label -->
    <!-- ////////////////////////// -->

    <div v-if="label" class="mn-l-thin mn-r-auto t-transp mn-r-small">
      <span>{{label}}</span>
    </div>

    <!-- ////////////////////////// -->
    <!-- Input -->
    <!-- ////////////////////////// -->
    <input 
      @input="event => text = emit('update:radio', event.target.value)"
      class="round radiobutton" 
      type="checkbox" 
      :name="name" 
      :value="value"
      :checked="value === radio"
    >
  </label>
</template>

<script setup>
  const props = defineProps({
    label: String,
    name: String,
    value: false,
    radio: [Object, String]
  })

  const emit = defineEmits(['update:radio'])

  const updateInputText = () => {
    emit('update:radio', value)
  }
</script>

<style lang="scss">
</style>