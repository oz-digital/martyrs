<template>
  <label class="flex-v-center flex-nowrap flex">
    <!-- ////////////////////////// -->
    <!-- Checkmark -->
    <!-- ////////////////////////// -->
    <div 
      class="cursor-pointer mn-r-thin radius-extra pd-micro h-100 aspect-1x1 pos-relative"
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
    <!-- <div v-if="radio === value" class="">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="24 / basic / check-mark">
          <path id="icon" fill-rule="evenodd" clip-rule="evenodd" d="M7.28033 10.7197L14.25 3.75L15.3107 4.81066L7.28033 12.841L3 8.56066L4.06066 7.5L7.28033 10.7197Z" fill="#000000"/>
        </g>
      </svg>
    </div> -->

    <!-- ////////////////////////// -->
    <!-- Label -->
    <!-- ////////////////////////// -->

    <div v-if="label" class="mn-r-auto t-transp mn-r-small">
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