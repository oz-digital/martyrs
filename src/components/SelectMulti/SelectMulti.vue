<template>
  <div
    ref="multiselect"
    :tabindex="searchable ? -1 : tabindex"
    :class="{
      'multiselect--active': isOpen,
      'multiselect--disabled': disabled,
      'multiselect--above': isAbove,
      'multiselect--has-options-group': hasOptionGroup
    }"
    @focus="activate"
    @blur="searchable ? false : deactivate"
    @keydown.self.down.prevent="pointerForward"
    @keydown.self.up.prevent="pointerBackward"
    @keypress.enter.tab.stop.self="addPointerElement"
    @keyup.esc="deactivate"
    class="multiselect flex flex-v-center"
    role="combobox"
    :aria-owns="`listbox-${id}`">
    
    <slot name="caret" :toggle>
      <div @mousedown.prevent.stop="toggle" class="multiselect__select"></div>
    </slot>
    
    <slot name="clear" :search />
    
    <div ref="tags" class="multiselect__tags">
      <slot
        name="selection"
        :search
        :remove="removeElement"
        :values="visibleValues"
        :is-open="isOpen">
        <div class="multiselect__tags-wrap" v-show="visibleValues.length > 0">
          <template v-for="(option, index) of visibleValues" :key="index">
            <slot name="tag" :option :search :remove="removeElement">
              <span class="multiselect__tag">
                <span v-text="getOptionLabel(option)" />
                <i 
                  tabindex="1" 
                  @keypress.enter.prevent="removeElement(option)"
                  @mousedown.prevent="removeElement(option)" 
                  class="multiselect__tag-icon" />
              </span>
            </slot>
          </template>
        </div>
        <template v-if="internalValue?.length > limit">
          <slot name="limit">
            <strong class="multiselect__strong" v-text="limitText(internalValue.length - limit)" />
          </slot>
        </template>
      </slot>
      <transition name="multiselect__loading">
        <slot name="loading">
          <div v-show="loading" class="multiselect__spinner" />
        </slot>
      </transition>
      <input
        ref="searchInput"
        v-if="searchable"
        :name
        :id
        type="text"
        autocomplete="off"
        spellcheck="false"
        :placeholder
        :style="inputStyle"
        :value="search"
        :disabled
        :tabindex
        @input="updateSearch($event.target.value)"
        @focus.prevent="activate"
        @blur.prevent="deactivate"
        @keyup.esc="deactivate"
        @keydown.down.prevent="pointerForward"
        @keydown.up.prevent="pointerBackward"
        @keypress.enter.prevent.stop.self="addPointerElement"
        @keydown.delete.stop="removeLastElement"
        class="multiselect__input"
        :aria-controls="`listbox-${id}`" />
      <span
        v-if="isSingleLabelVisible"
        class="multiselect__single"
        @mousedown.prevent="toggle">
        <slot name="singleLabel" :option="singleValue">
          {{ currentOptionLabel }}
        </slot>
      </span>
      <span
        v-if="isPlaceholderVisible"
        class="multiselect__placeholder"
        @mousedown.prevent="toggle">
        <slot name="placeholder">
          {{ placeholder }}
        </slot>
      </span>
    </div>
    
    <transition name="multiselect">
      <div
        class="multiselect__content-wrapper"
        v-show="isOpen"
        @focus="activate"
        tabindex="-1"
        @mousedown.prevent
        :style="{ maxHeight: `${optimizedHeight}px` }"
        ref="list">
        <ul class="multiselect__content" :style="contentStyle" role="listbox" :id="`listbox-${id}`">
          <slot name="beforeList" />
          <li v-if="multiple && max === internalValue.length">
            <span class="multiselect__option">
              <slot name="maxElements">
                Maximum of {{ max }} options selected. First remove a selected option to select another.
              </slot>
            </span>
          </li>
          <template v-if="!max || internalValue.length < max">
            <li 
              class="multiselect__element"
              v-for="(option, index) of filteredOptions"
              :key="index"
              :id="`${id}-${index}`"
              :role="!(option?.$isLabel || option?.$isDisabled) ? 'option' : null">
              <span
                v-if="!(option?.$isLabel || option?.$isDisabled)"
                :class="optionHighlight(index, option)"
                @click.stop="select(option)"
                @mouseenter.self="pointerSet(index)"
                :data-select="option?.isTag ? tagPlaceholder : selectLabelText"
                :data-selected="selectedLabelText"
                :data-deselect="deselectLabelText"
                class="multiselect__option">
                <slot name="option" :option :search :index>
                  <span>{{ getOptionLabel(option) }}</span>
                </slot>
              </span>
              <span
                v-if="option?.$isLabel || option?.$isDisabled"
                :data-select="groupSelect && selectGroupLabelText"
                :data-deselect="groupSelect && deselectGroupLabelText"
                :class="groupHighlight(index, option)"
                @mouseenter.self="groupSelect && pointerSet(index)"
                @mousedown.prevent="selectGroup(option)"
                class="multiselect__option">
                <slot name="option" :option :search :index>
                  <span>{{ getOptionLabel(option) }}</span>
                </slot>
              </span>
            </li>
          </template>
          <li v-show="showNoResults && filteredOptions.length === 0 && search && !loading">
            <span class="multiselect__option">
              <slot name="noResult" :search>
                No elements found. Consider changing the search query.
              </slot>
            </span>
          </li>
          <li v-show="showNoOptions && (options.length === 0 || (hasOptionGroup && filteredOptions.length === 0)) && !search && !loading">
            <span class="multiselect__option">
              <slot name="noOptions">List is empty.</slot>
            </span>
          </li>
          <slot name="afterList" />
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

// Props
const props = defineProps({
  modelValue: { type: null, default: () => [] },
  options: { type: Array, required: true },
  multiple: { type: Boolean, default: false },
  trackBy: String,
  label: String,
  searchable: { type: Boolean, default: true },
  clearOnSelect: { type: Boolean, default: true },
  hideSelected: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Select option' },
  allowEmpty: { type: Boolean, default: true },
  resetAfter: { type: Boolean, default: false },
  closeOnSelect: { type: Boolean, default: true },
  customLabel: {
    type: Function,
    default: (option, label) => {
      if (!option && option !== 0) return ''
      return label ? option[label] : option
    }
  },
  taggable: { type: Boolean, default: false },
  tagPlaceholder: { type: String, default: 'Press enter to create a tag' },
  tagPosition: { type: String, default: 'top' },
  max: { type: [Number, Boolean], default: false },
  id: { default: null },
  optionsLimit: { type: Number, default: 1000 },
  groupValues: String,
  groupLabel: String,
  groupSelect: { type: Boolean, default: false },
  blockKeys: { type: Array, default: () => [] },
  preserveSearch: { type: Boolean, default: false },
  preselectFirst: { type: Boolean, default: false },
  preventAutofocus: { type: Boolean, default: false },
  internalSearch: { type: Boolean, default: true },
  name: { type: String, default: '' },
  selectLabel: { type: String, default: 'Press enter to select' },
  selectGroupLabel: { type: String, default: 'Press enter to select group' },
  selectedLabel: { type: String, default: 'Selected' },
  deselectLabel: { type: String, default: 'Press enter to remove' },
  deselectGroupLabel: { type: String, default: 'Press enter to deselect group' },
  showLabels: { type: Boolean, default: true },
  limit: { type: Number, default: 99999 },
  maxHeight: { type: Number, default: 300 },
  limitText: { type: Function, default: count => `and ${count} more` },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  openDirection: { type: String, default: '' },
  showNoOptions: { type: Boolean, default: true },
  showNoResults: { type: Boolean, default: true },
  tabindex: { type: Number, default: 0 },
  showPointer: { type: Boolean, default: true },
  optionHeight: { type: Number, default: 40 }
})

// Emits
const emit = defineEmits(['open', 'search-change', 'close', 'select', 'update:modelValue', 'remove', 'tag'])

// Refs
const multiselect = ref(null)
const searchInput = ref(null)
const list = ref(null)
const tags = ref(null)

// State
const search = ref('')
const isOpen = ref(false)
const preferredOpenDirection = ref('below')
const optimizedHeight = ref(props.maxHeight)
const pointer = ref(0)
const pointerDirty = ref(false)

// Helper functions
const isEmpty = opt => {
  if (opt === 0) return false
  if (Array.isArray(opt) && opt.length === 0) return true
  return !opt
}

const includes = (str, query) => {
  if (str === undefined) str = 'undefined'
  if (str === null) str = 'null'
  if (str === false) str = 'false'
  return str.toString().toLowerCase().indexOf(query.trim()) !== -1
}

const filterOptions = (options, search, label, customLabel) => {
  return search 
    ? options.filter(option => includes(customLabel(option, label), search))
        .sort((a, b) => customLabel(a, label).length - customLabel(b, label).length)
    : options
}

const flattenOptions = (values, label) => options =>
  options.reduce((prev, curr) => {
    if (curr[values]?.length) {
      prev.push({ $groupLabel: curr[label], $isLabel: true })
      return prev.concat(curr[values])
    }
    return prev
  }, [])

const stripGroups = options => options.filter(option => !option.$isLabel)

const filterGroups = (search, label, values, groupLabel, customLabel) => groups =>
  groups.map(group => {
    if (!group[values]) {
      console.warn(`Options passed to vue-multiselect do not contain groups, despite the config.`)
      return []
    }
    const groupOptions = filterOptions(group[values], search, label, customLabel)
    return groupOptions.length ? { [groupLabel]: group[groupLabel], [values]: groupOptions } : []
  })

const flow = (...fns) => x => fns.reduce((v, f) => f(v), x)

// Computed
const internalValue = computed(() => {
  const val = props.modelValue
  return val || val === 0 ? (Array.isArray(val) ? val : [val]) : []
})

const filteredOptions = computed(() => {
  const searchVal = search.value || ''
  const normalizedSearch = searchVal.toLowerCase().trim()
  let options = props.options.concat()

  if (props.internalSearch) {
    options = props.groupValues 
      ? filterAndFlat(options, normalizedSearch, props.label)
      : filterOptions(options, normalizedSearch, props.label, props.customLabel)
  } else {
    options = props.groupValues 
      ? flattenOptions(props.groupValues, props.groupLabel)(options) 
      : options
  }

  options = props.hideSelected ? options.filter(o => !isSelected(o)) : options

  if (props.taggable && normalizedSearch.length && !isExistingOption(normalizedSearch)) {
    if (props.tagPosition === 'bottom') {
      options.push({ isTag: true, label: searchVal })
    } else {
      options.unshift({ isTag: true, label: searchVal })
    }
  }

  return options.slice(0, props.optionsLimit)
})

const valueKeys = computed(() => 
  props.trackBy ? internalValue.value.map(el => el[props.trackBy]) : internalValue.value
)

const optionKeys = computed(() => {
  const options = props.groupValues ? flatAndStrip(props.options) : props.options
  return options.map(el => props.customLabel(el, props.label).toString().toLowerCase())
})

const currentOptionLabel = computed(() =>
  props.multiple 
    ? (props.searchable ? '' : props.placeholder)
    : internalValue.value.length 
      ? getOptionLabel(internalValue.value[0])
      : props.searchable ? '' : props.placeholder
)

const hasOptionGroup = computed(() => props.groupValues && props.groupLabel && props.groupSelect)

const isSingleLabelVisible = computed(() =>
  (singleValue.value || singleValue.value === 0) &&
  (!isOpen.value || !props.searchable) &&
  !visibleValues.value.length
)

const isPlaceholderVisible = computed(() =>
  !internalValue.value.length && (!props.searchable || !isOpen.value)
)

const visibleValues = computed(() =>
  props.multiple ? internalValue.value.slice(0, props.limit) : []
)

const singleValue = computed(() => internalValue.value[0])

const deselectLabelText = computed(() => props.showLabels ? props.deselectLabel : '')
const deselectGroupLabelText = computed(() => props.showLabels ? props.deselectGroupLabel : '')
const selectLabelText = computed(() => props.showLabels ? props.selectLabel : '')
const selectGroupLabelText = computed(() => props.showLabels ? props.selectGroupLabel : '')
const selectedLabelText = computed(() => props.showLabels ? props.selectedLabel : '')

const inputStyle = computed(() => {
  if (props.searchable || (props.multiple && props.modelValue?.length)) {
    return isOpen.value
      ? { width: '100%' }
      : { width: '0', position: 'absolute', padding: '0' }
  }
  return ''
})

const contentStyle = computed(() => 
  props.options.length ? { display: 'inline-block' } : { display: 'block' }
)

const isAbove = computed(() => {
  if (['above', 'top'].includes(props.openDirection)) return true
  if (['below', 'bottom'].includes(props.openDirection)) return false
  return preferredOpenDirection.value === 'above'
})

const pointerPosition = computed(() => pointer.value * props.optionHeight)
const visibleElements = computed(() => optimizedHeight.value / props.optionHeight)

// Methods
const filterAndFlat = (options, search, label) =>
  flow(
    filterGroups(search, label, props.groupValues, props.groupLabel, props.customLabel),
    flattenOptions(props.groupValues, props.groupLabel)
  )(options)

const flatAndStrip = options =>
  flow(
    flattenOptions(props.groupValues, props.groupLabel),
    stripGroups
  )(options)

const updateSearch = query => {
  search.value = query
}

const isExistingOption = query => 
  props.options ? optionKeys.value.indexOf(query) > -1 : false

const isSelected = option => {
  const opt = props.trackBy ? option[props.trackBy] : option
  return valueKeys.value.indexOf(opt) > -1
}

const isOptionDisabled = option => !!option?.$isDisabled

const getOptionLabel = option => {
  if (isEmpty(option)) return ''
  if (option.isTag) return option.label
  if (option.$isLabel) return option.$groupLabel
  const label = props.customLabel(option, props.label)
  return isEmpty(label) ? '' : label
}

const select = (option, key) => {
  if (option.$isLabel && props.groupSelect) {
    selectGroup(option)
    return
  }
  if (props.blockKeys.indexOf(key) !== -1 || props.disabled || option.$isDisabled || option.$isLabel) return
  if (props.max && props.multiple && internalValue.value.length === props.max) return
  if (key === 'Tab' && !pointerDirty.value) return
  
  if (option.isTag) {
    emit('tag', option.label, props.id)
    search.value = ''
    if (props.closeOnSelect && !props.multiple) deactivate()
  } else {
    if (isSelected(option)) {
      if (key !== 'Tab') removeElement(option)
      return
    }

    emit('update:modelValue', props.multiple ? internalValue.value.concat([option]) : option)
    emit('select', option, props.id)

    if (props.clearOnSelect) search.value = ''
  }
  
  if (props.closeOnSelect) deactivate()
}

const selectGroup = selectedGroup => {
  const group = props.options.find(option => 
    option[props.groupLabel] === selectedGroup.$groupLabel
  )
  if (!group) return

  if (wholeGroupSelected(group)) {
    emit('remove', group[props.groupValues], props.id)
    const newValue = internalValue.value.filter(option => 
      group[props.groupValues].indexOf(option) === -1
    )
    emit('update:modelValue', newValue)
  } else {
    let optionsToAdd = group[props.groupValues].filter(option => 
      !(isOptionDisabled(option) || isSelected(option))
    )
    if (props.max) optionsToAdd.splice(props.max - internalValue.value.length)
    
    emit('select', optionsToAdd, props.id)
    emit('update:modelValue', internalValue.value.concat(optionsToAdd))
  }

  if (props.closeOnSelect) deactivate()
}

const wholeGroupSelected = group =>
  group[props.groupValues].every(option => isSelected(option) || isOptionDisabled(option))

const wholeGroupDisabled = group =>
  group[props.groupValues].every(isOptionDisabled)

const removeElement = (option, shouldClose = true) => {
  if (props.disabled || option?.$isDisabled) return
  if (!props.allowEmpty && internalValue.value.length <= 1) {
    deactivate()
    return
  }

  const index = typeof option === 'object' 
    ? valueKeys.value.indexOf(option[props.trackBy])
    : valueKeys.value.indexOf(option)

  const newValue = props.multiple
    ? internalValue.value.slice(0, index).concat(internalValue.value.slice(index + 1))
    : null

  emit('update:modelValue', newValue)
  emit('remove', option, props.id)

  if (props.closeOnSelect && shouldClose) deactivate()
}

const removeLastElement = () => {
  if (props.blockKeys.indexOf('Delete') !== -1) return
  if (search.value.length === 0 && Array.isArray(internalValue.value) && internalValue.value.length) {
    removeElement(internalValue.value[internalValue.value.length - 1], false)
  }
}

const activate = () => {
  if (isOpen.value || props.disabled) return

  adjustPosition()
  if (props.groupValues && pointer.value === 0 && filteredOptions.value.length) {
    pointer.value = 1
  }

  isOpen.value = true
  if (props.searchable) {
    if (!props.preserveSearch) search.value = ''
    if (!props.preventAutofocus) nextTick(() => searchInput.value?.focus())
  } else if (!props.preventAutofocus) {
    multiselect.value?.focus()
  }
  emit('open', props.id)
}

const deactivate = () => {
  if (!isOpen.value) return

  isOpen.value = false
  if (props.searchable) {
    searchInput.value?.blur()
  } else {
    multiselect.value?.blur()
  }
  if (!props.preserveSearch) search.value = ''
  emit('close', getValue(), props.id)
}

const toggle = () => {
  isOpen.value ? deactivate() : activate()
}

const adjustPosition = () => {
  if (typeof window === 'undefined') return

  const spaceAbove = multiselect.value.getBoundingClientRect().top
  const spaceBelow = window.innerHeight - multiselect.value.getBoundingClientRect().bottom
  const hasEnoughSpaceBelow = spaceBelow > props.maxHeight

  if (hasEnoughSpaceBelow || spaceBelow > spaceAbove || ['below', 'bottom'].includes(props.openDirection)) {
    preferredOpenDirection.value = 'below'
    optimizedHeight.value = Math.min(spaceBelow - 40, props.maxHeight)
  } else {
    preferredOpenDirection.value = 'above'
    optimizedHeight.value = Math.min(spaceAbove - 40, props.maxHeight)
  }
}

const getValue = () => 
  props.multiple ? internalValue.value : internalValue.value.length === 0 ? null : internalValue.value[0]

// Pointer methods
const optionHighlight = (index, option) => ({
  'multiselect__option--highlight': index === pointer.value && props.showPointer,
  'multiselect__option--selected': isSelected(option)
})

const groupHighlight = (index, selectedGroup) => {
  if (!props.groupSelect) {
    return ['multiselect__option--disabled', { 'multiselect__option--group': selectedGroup.$isLabel }]
  }
  const group = props.options.find(option => 
    option[props.groupLabel] === selectedGroup.$groupLabel
  )
  return group && !wholeGroupDisabled(group)
    ? ['multiselect__option--group', 
       { 'multiselect__option--highlight': index === pointer.value && props.showPointer },
       { 'multiselect__option--group-selected': wholeGroupSelected(group) }]
    : 'multiselect__option--disabled'
}

const addPointerElement = ({ key } = 'Enter') => {
  if (filteredOptions.value.length > 0) {
    select(filteredOptions.value[pointer.value], key)
  }
  pointerReset()
}

const pointerForward = () => {
  if (pointer.value < filteredOptions.value.length - 1) {
    pointer.value++
    if (list.value.scrollTop <= pointerPosition.value - (visibleElements.value - 1) * props.optionHeight) {
      list.value.scrollTop = pointerPosition.value - (visibleElements.value - 1) * props.optionHeight
    }
    if (filteredOptions.value[pointer.value]?.$isLabel && !props.groupSelect) pointerForward()
  }
  pointerDirty.value = true
}

const pointerBackward = () => {
  if (pointer.value > 0) {
    pointer.value--
    if (list.value.scrollTop >= pointerPosition.value) {
      list.value.scrollTop = pointerPosition.value
    }
    if (filteredOptions.value[pointer.value]?.$isLabel && !props.groupSelect) pointerBackward()
  } else {
    if (filteredOptions.value[pointer.value]?.$isLabel && !props.groupSelect) pointerForward()
  }
  pointerDirty.value = true
}

const pointerReset = () => {
  if (!props.closeOnSelect) return
  pointer.value = 0
  if (list.value) list.value.scrollTop = 0
}

const pointerAdjust = () => {
  if (pointer.value >= filteredOptions.value.length - 1) {
    pointer.value = filteredOptions.value.length ? filteredOptions.value.length - 1 : 0
  }
  if (filteredOptions.value.length > 0 && filteredOptions.value[pointer.value]?.$isLabel && !props.groupSelect) {
    pointerForward()
  }
}

const pointerSet = index => {
  pointer.value = index
  pointerDirty.value = true
}

// Watchers
watch(() => internalValue.value, () => {
  if (props.resetAfter && internalValue.value.length) {
    search.value = ''
    emit('update:modelValue', props.multiple ? [] : null)
  }
}, { deep: true })

watch(search, () => emit('search-change', search.value))

watch(filteredOptions, () => pointerAdjust())

watch(isOpen, () => pointerDirty.value = false)

watch(pointer, () => {
  searchInput.value?.setAttribute('aria-activedescendant', `${props.id}-${pointer.value}`)
})

// Lifecycle
onMounted(() => {
  if (!props.multiple && props.max) {
    console.warn('[Vue-Multiselect warn]: Max prop should not be used when prop Multiple equals false.')
  }
  if (props.preselectFirst && !internalValue.value.length && props.options.length) {
    select(filteredOptions.value[0])
  }
})
</script>

<style>
fieldset[disabled] .multiselect {
  pointer-events: none;
}

.multiselect__spinner {
  position: absolute;
  right: 1px;
  top: 1px;
  width: 40px;
  height: 38px;
  background: #fff;
  display: block;
}

.multiselect__spinner::before,
.multiselect__spinner::after {
  position: absolute;
  content: "";
  top: 50%;
  left: 50%;
  margin: -8px 0 0 -8px;
  width: 16px;
  height: 16px;
  border-radius: 100%;
  border-color: #41b883 transparent transparent;
  border-style: solid;
  border-width: 2px;
  box-shadow: 0 0 0 1px transparent;
}

.multiselect__spinner::before {
  animation: spinning 2.4s cubic-bezier(0.41, 0.26, 0.2, 0.62);
  animation-iteration-count: infinite;
}

.multiselect__spinner::after {
  animation: spinning 2.4s cubic-bezier(0.51, 0.09, 0.21, 0.8);
  animation-iteration-count: infinite;
}

.multiselect__loading-enter-active,
.multiselect__loading-leave-active {
  transition: opacity 0.4s ease-in-out;
  opacity: 1;
}

.multiselect__loading-enter,
.multiselect__loading-leave-active {
  opacity: 0;
}

.multiselect,
.multiselect__input,
.multiselect__single {
  font-family: inherit;
  touch-action: manipulation;
}

.multiselect {
  display: block;
  position: relative;
  width: 100%;
  min-height: 40px;
}

.multiselect * {
  box-sizing: border-box;
}

.multiselect:focus {
  outline: none;
}

.multiselect--disabled {
  background: #ededed;
  pointer-events: none;
  opacity: 0.6;
}

.multiselect--active {
  z-index: 50;
}

.multiselect--active:not(.multiselect--above) .multiselect__current,
.multiselect--active:not(.multiselect--above) .multiselect__input,
.multiselect--active:not(.multiselect--above) .multiselect__tags {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.multiselect--active .multiselect__select {
  transform: rotateZ(180deg);
}

.multiselect--above.multiselect--active .multiselect__current,
.multiselect--above.multiselect--active .multiselect__input,
.multiselect--above.multiselect--active .multiselect__tags {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.multiselect__input,
.multiselect__single,
.multiselect__placeholder {
  position: relative;
  display: inline-block;
  min-height: 20px;
  line-height: 20px;
  border: none;
  width: calc(100%);
  height: inherit;
  box-sizing: border-box;
  vertical-align: top;
  display: flex;
  align-items: center;
}

.multiselect__input::placeholder {
  color: #35495e;
}

.multiselect__tag ~ .multiselect__input,
.multiselect__tag ~ .multiselect__single {
  width: auto;
}

.multiselect__input:hover,
.multiselect__single:hover {
  border-color: #cfcfcf;
}

.multiselect__input:focus,
.multiselect__single:focus {
  border-color: #a8a8a8;
  outline: none;
}

.multiselect__tags-wrap {
  display: inline;
}

.multiselect__tags {
  display: block;
  height: inherit;
}

.multiselect__tag {
  position: relative;
  display: inline-block;
  padding: 4px 26px 4px 10px;
  border-radius: 5px;
  margin-right: 10px;
  color: #fff;
  line-height: 1;
  background: #41b883;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;
}

.multiselect__tag-icon {
  cursor: pointer;
  margin-left: 7px;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  font-weight: 700;
  font-style: initial;
  width: 22px;
  text-align: center;
  line-height: 22px;
  transition: all 0.2s ease;
  border-radius: 5px;
}

.multiselect__tag-icon::after {
  content: "×";
  color: #266d4d;
  font-size: 14px;
}

.multiselect__tag-icon:focus::after,
.multiselect__tag-icon:hover::after {
  color: white;
}

.multiselect__current {
  line-height: 16px;
  min-height: 40px;
  box-sizing: border-box;
  display: block;
  overflow: hidden;
  padding: 8px 12px 0;
  padding-right: 30px;
  white-space: nowrap;
  margin: 0;
  text-decoration: none;
  border-radius: 5px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
}

.multiselect__select {
  line-height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: center;
  position: absolute;
  box-sizing: border-box;
  width: 40px;
  height: 38px;
  right: 1px;
  top: calc(50% - 19px);
  padding: 4px 8px;
  margin: 0;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.multiselect__select::before {
  position: relative;
  color: #999;
  margin-top: 4px;
  border-style: solid;
  border-width: 5px 5px 0 5px;
  border-color: #999 transparent transparent transparent;
  content: "";
}

.multiselect--active .multiselect__placeholder {
  display: none;
}

.multiselect__content-wrapper {
  position: absolute;
  display: block;
  background: #fff;
  width: 100%;
  max-height: 240px;
  height: min-content;
  overflow: auto;
  left: 0;
  border-top: none;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  z-index: 50;
  -webkit-overflow-scrolling: touch;
}

.multiselect__content {
  list-style: none;
  display: inline-block;
  padding: 0;
  margin: 0;
  min-width: 100%;
  vertical-align: top;
}

.multiselect--above .multiselect__content-wrapper {
  bottom: 100%;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom: none;
  border-top: 1px solid #e8e8e8;
}

.multiselect__content::-webkit-scrollbar {
  display: none;
}

.multiselect__element {
  display: block;
}

.multiselect__option {
  display: block;
  padding: 12px;
  min-height: 40px;
  line-height: 16px;
  text-decoration: none;
  text-transform: none;
  vertical-align: middle;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
}

.multiselect__option::after {
  top: 0;
  right: 0;
  position: absolute;
  line-height: 40px;
  padding-right: 12px;
  padding-left: 20px;
  font-size: 13px;
}

.multiselect__option--highlight {
  background: rgba(var(--main), 0.1);
  outline: none;
}

.multiselect__option--highlight::after {
  content: attr(data-select);
}

.multiselect__option--selected {
  background: #f3f3f3;
  color: #35495e;
  font-weight: bold;
}

.multiselect__option--selected::after {
  content: attr(data-selected);
  color: silver;
  background: inherit;
}

.multiselect__option--selected.multiselect__option--highlight {
  background: rgba(var(--red), 0.1);
}

.multiselect__option--selected.multiselect__option--highlight::after {
  content: attr(data-deselect);
}

.multiselect--disabled .multiselect__current,
.multiselect--disabled .multiselect__select {
  background: #ededed;
  color: #a6a6a6;
}

.multiselect__option--disabled {
  background: #ededed !important;
  color: #a6a6a6 !important;
  cursor: text;
  pointer-events: none;
}

.multiselect__option--group {
  background: #ededed;
  color: #35495e;
}

.multiselect__option--group.multiselect__option--highlight {
  background: #35495e;
  color: #fff;
}

.multiselect__option--group.multiselect__option--highlight::after {
  background: #35495e;
}

.multiselect__option--disabled.multiselect__option--highlight {
  background: #dedede;
}

.multiselect__option--group-selected.multiselect__option--highlight {
  background: #ff6a6a;
  color: #fff;
}

.multiselect__option--group-selected.multiselect__option--highlight::after {
  background: #ff6a6a;
  content: attr(data-deselect);
  color: #fff;
}

.multiselect-enter-active,
.multiselect-leave-active {
  transition: all 0.15s ease;
}

.multiselect-enter,
.multiselect-leave-active {
  opacity: 0;
}

.multiselect__strong {
  margin-bottom: 8px;
  line-height: 20px;
  display: inline-block;
  vertical-align: top;
}

*[dir="rtl"] .multiselect {
  text-align: right;
}

*[dir="rtl"] .multiselect__select {
  right: auto;
  left: 1px;
}

*[dir="rtl"] .multiselect__tags {
  padding: 8px 8px 0 40px;
}

*[dir="rtl"] .multiselect__content {
  text-align: right;
}

*[dir="rtl"] .multiselect__option::after {
  right: auto;
  left: 0;
}

*[dir="rtl"] .multiselect__clear {
  right: auto;
  left: 12px;
}

*[dir="rtl"] .multiselect__spinner {
  right: auto;
  left: 1px;
}

@keyframes spinning {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(2turn);
  }
}
</style>