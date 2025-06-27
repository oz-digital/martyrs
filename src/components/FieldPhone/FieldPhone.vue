<template>
  <div 
    :class="[
      rootClass, 
      classes,
      $attrs.class, 
      { 'bg-fourth-nano': validation }, 
      { disabled: disabled }
    ]" 
    :style="[rootStyle, styles]" 
    ref="rootElement"
    class="vue3-reactive-tel-input"
  >
    <div
      v-click-outside="clickedOutside"
      :class="['vti__dropdown', { open: open }]"
      :style="[dropdownStyle]"
      :tabindex="dropdownOptions.tabindex"
      @keydown.esc="reset"
      class="br-solid br-black-transp br-1px radius-thin"
    >
      <span class="flex-nowrap flex flex-v-center p-medium vti__selection">
        <span v-if="dropdownOptions.showFlags" v-html="activeCountryFlag" class="mn-r-nano" />
        
        <!-- Новый инпут для ввода кода страны -->
        <input
          v-if="dropdownOptions.showDialCodeInSelection"
          v-model="dialCodeInput"
          @input="onDialCodeInput"
          @focus="openDropdown"
          @blur="onDialCodeBlur"
          @keydown="keyboardNav"
          type="text"
          class="vti__country-code-input"
          :placeholder="`+${activeCountry?.dialCode || ''}`"
          :disabled="disabled"
          :size="Math.max((dialCodeInput?.length || 0) + 1, 3)"
          maxlength="5"
        />

      </span>
      
      <ul 
        ref="list" 
        class="bs-black radius-small vti__dropdown-list"
        v-show="open" 
        :class="dropdownOpenDirection"
        :style="[listStyle]"
      >
        <li
          v-for="(pb, index) in filteredAndSortedCountries"
          class="flex-nowrap flex w-max"
          :class="['vti__dropdown-item', getItemClass(index, pb.iso2)]"
          :key="pb.iso2 + (pb.preferred ? '-preferred' : '')"
          @click="choose(pb)"
          @mousemove="selectedIndex = index"
        >
          <span v-if="dropdownOptions.showFlags" v-html="pb.flag" class="mn-r-thin"/>
          <strong>{{ pb.name }}</strong>
          <span v-if="dropdownOptions.showDialCodeInList"> +{{ pb.dialCode }} </span>
        </li>
      </ul>
    </div>
    
    <input
      v-model="phone"
      inputmode="numeric" 
      pattern="\d*"
      ref="input"
      :type="inputOptions.type"
      :autocomplete="inputOptions.autocomplete"
      :autofocus="inputOptions.autofocus"
      :class="['vti__input', inputOptions.styleClasses, inputClass, Iclasses]"
      :style="[inputStyle, Istyles]"
      :disabled="disabled"
      :id="inputId !== '' ? inputId : inputOptions.id"
      :maxlength="inputOptions.maxlength"
      :name="inputId !== '' ? inputId : inputOptions.name"
      :placeholder="parsedPlaceholder"
      :readonly="inputOptions.readonly"
      :required="inputOptions.required"
      :tabindex="inputOptions.tabindex"
      @blur="onBlur"
      @focus="onFocus"
      @input="onInput"
      @keyup.enter="onEnter"
      @keyup.space="onSpace"
    />
    <slot></slot>
  </div>
  
  <!-- Validation -->
  <transition name="fade">
    <div v-if="validation" class="mn-t-thin mn-b-thin invalid-feedback">
      * {{validation.message}}
    </div>
  </transition>
</template>

<script setup>
  import { ref, reactive, watch, computed, onMounted, nextTick } from 'vue';
  import { parsePhoneNumberFromString } from 'libphonenumber-js';

  import clickOutside from './click-outside.js';
  import allCountries from './all-countries.js';

  let vClickOutside = clickOutside

  const props = defineProps({
    modelValue: { type: String, default: '' },
    badClass: { type: [String, Array, Object], default: '' },
    goodClass: { type: [String, Array, Object], default: '' },
    badStyle: { type: [String, Array, Object], default: '' },
    goodStyle: { type: [String, Array, Object], default: '' },
    badInputClass: { type: [String, Array, Object], default: '' },
    goodInputClass: { type: [String, Array, Object], default: '' },
    badInputStyle: { type: [String, Array, Object], default: '' },
    goodInputStyle: { type: [String, Array, Object], default: '' },
    allCountries: { type: Array, default: () => allCountries },
    autoFormat: { type: Boolean, default: true },
    validation: { type: [Boolean, Object], default: false },
    customValidate: { type: [Boolean, RegExp], default: false },
    defaultCountry: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    autoDefaultCountry: { type: Boolean, default: true },
    ignoredCountries: { type: Array, default: () => [] },
    invalidMsg: { type: String, default: '' },
    mode: { type: String, default: 'auto' },
    onlyCountries: { type: Array, default: () => [] },
    preferredCountries: { type: Array, default: () => [] },
    validCharactersOnly: { type: Boolean, default: false },
    rootClass: { type: [String, Array, Object], default: '' },
    inputClass: { type: [String, Array, Object], default: '' },
    rootStyle: { type: [String, Array, Object], default: '' },
    dropdownStyle: { type: [String, Array, Object], default: '' },
    listStyle: { type: [String, Array, Object], default: '' },
    inputStyle: { type: [String, Array, Object], default: '' },
    inputId: { type: [String, Array, Object], default: '' },
    Placeholder: { type: [String, Object, Function], default: '' },
    dropdownOptions: { 
      type: Object, 
      default: () => ({
        showDialCodeInList: true,
        showDialCodeInSelection: false,
        showFlags: true,
        tabindex: 0
      })
    },
    inputOptions: { 
      type: Object, 
      default: () => ({ 
        autocomplete: 'on',
        autofocus: false,
        id: '',
        maxlength: 25,
        name: 'telephone',
        placeholder: 'Enter a phone number',
        readonly: false,
        required: false,
        tabindex: 0,
        type: 'tel',
        styleClasses: ''
      })
    },
  });

  const emits = defineEmits([
    'update:modelValue', 
    'change',
    'validate', 
    'country-changed', 
    'open', 
    'close', 
    'blur', 
    'focus', 
    'enter', 
    'space'
  ]);

  // Reactive data
  const phone = ref(props.modelValue || '');
  const activeCountryCode = ref('');
  const dialCodeInput = ref('');
  const dialCodeFilter = ref('');
  const open = ref(false);
  const finishMounted = ref(false);
  const selectedIndex = ref(null);
  const typeToFindInput = ref('');
  const typeToFindTimer = ref(null);
  const dropdownOpenDirection = ref('below');
  const parsedPlaceholder = ref(props.Placeholder !== '' ? props.Placeholder : props.inputOptions.placeholder);

  // Element refs
  const rootElement = ref(null);
  const list = ref(null);
  const input = ref(null);

  // Lifecycle hooks
  onMounted(() => {
    if (props.modelValue) {
      phone.value = props.modelValue;
    }

    cleanInvalidCharacters();

    initializeCountry()
      .then(() => {
        if (!phone.value && props.inputOptions?.showDialCode && activeCountryCode.value) {
          phone.value = `+${activeCountryCode.value}`;
        }
        
        // Инициализируем dialCodeInput
        if (activeCountry.value && props.dropdownOptions.showDialCodeInSelection) {
          dialCodeInput.value = `+${activeCountry.value.dialCode}`;
        }
        
        emits('validate', phoneObject.value);
      })
      .catch(console.error)
      .then(() => {
        finishMounted.value = true;
      });
  });

  // Computed properties
  const activeCountry = computed(() => {
    return findCountry(activeCountryCode.value);
  });

  const activeCountryFlag = computed(() => {
    return activeCountry.value ? activeCountry.value.flag : null;
  });

  const parsedMode = computed(() => {
    if (props.mode === 'auto') {
      if (!phone.value || phone.value[0] !== '+') {
        return 'national';
      }
      return 'international';
    }
    if (!['international', 'national'].includes(props.mode)) {
      console.error('Invalid value of prop "mode"');
      return 'international';
    }
    return props.mode;
  });

  const filteredCountries = computed(() => {
    let countries = props.allCountries;

    // Фильтрация по onlyCountries/ignoredCountries
    if (props.onlyCountries && props.onlyCountries.length) {
      countries = countries.filter(({ iso2 }) => 
        props.onlyCountries.includes(iso2.toUpperCase())
      );
    } else if (props.ignoredCountries && props.ignoredCountries.length) {
      countries = countries.filter(({ iso2 }) =>
        !props.ignoredCountries.includes(iso2.toUpperCase()) && 
        !props.ignoredCountries.includes(iso2.toLowerCase())
      );
    }

    // Фильтрация по введенному коду страны
    if (dialCodeFilter.value) {
      const filterValue = dialCodeFilter.value.replace('+', '');
      countries = countries.filter(country => 
        country.dialCode.startsWith(filterValue)
      );
    }

    return countries;
  });

  const filteredAndSortedCountries = computed(() => {
    const preferredCountries = getCountries(props.preferredCountries)
      .filter(country => {
        if (!dialCodeFilter.value) return true;
        const filterValue = dialCodeFilter.value.replace('+', '');
        return country.dialCode.startsWith(filterValue);
      })
      .map(country => ({ ...country, preferred: true }));

    return [...preferredCountries, ...filteredCountries.value];
  });

  const phoneObject = computed(() => {
    let result = {};

    if (phone.value?.[0] === '+') {
      result = parsePhoneNumberFromString(phone.value) || {};
    } else {
      result = parsePhoneNumberFromString(phone.value, activeCountryCode.value) || {};
    }

    const { metadata, ...phoneDetails } = result;

    let valid = result.isValid?.();
    let formatted = phone.value;

    if (valid) {
      formatted = result.format?.(parsedMode.value.toUpperCase(), { nationalPrefix: false });
    }

    if (result.country && (props.ignoredCountries.length || props.onlyCountries.length)) {
      if (!findCountry(result.country)) {
        valid = false;
        result = { ...result, country: null };
      }
    }

    return {
      ...phoneDetails,
      countryCode: result.country,
      valid,
      country: activeCountry.value,
      formatted,
    };
  });

  const classes = computed(() => {
    return phoneObject.value.valid === true ? props.goodClass : 
           phoneObject.value.valid === false ? props.badClass : undefined;
  });

  const styles = computed(() => {
    return phoneObject.value.valid === true ? props.goodStyle : 
           phoneObject.value.valid === false ? props.badStyle : undefined;
  });

  const Iclasses = computed(() => {
    return phoneObject.value.valid === true ? props.goodInputClass : 
           phoneObject.value.valid === false ? props.badInputClass : undefined;
  });

  const Istyles = computed(() => {
    return phoneObject.value.valid === true ? props.goodInputStyle : 
           phoneObject.value.valid === false ? props.badInputStyle : undefined;
  });

  // Watchers
  watch(activeCountry, (newValue, oldValue) => {
    if (!newValue && oldValue?.iso2) {
      activeCountryCode.value = oldValue.iso2;
      return;
    }
    if (newValue?.iso2) {
      emits('country-changed', newValue);
      resetPlaceholder();
      // Обновляем dialCodeInput при смене страны
      dialCodeInput.value = `+${newValue.dialCode}`;
    }
  });

  watch(() => phoneObject.value.countryCode, (newValue) => {
    activeCountryCode.value = newValue;
  });

  watch(() => phoneObject.value.valid, () => {
    emits('validate', phoneObject.value);
  });

  watch(() => phoneObject.value.formatted, (newValue) => {
    if (!props.autoFormat || props.customValidate) {
      return;
    }
    emitInput(newValue);

    nextTick(() => {
      if (newValue && !props.modelValue) {
        phone.value = newValue;
      }
    });
  });

  watch(() => props.inputOptions.placeholder, () => {
    resetPlaceholder();
  });

  watch(() => props.modelValue, (newValue, oldValue) => {
    if (!testCharacters()) {
      nextTick(() => {
        phone.value = oldValue;
        onInput();
      });
    } else {
      phone.value = newValue;
    }
  });

  watch(open, (isDropdownOpened) => {
    if (isDropdownOpened) {
      setDropdownPosition();
      emits('open');
    } else {
      emits('close');
    }
  });

  // Methods
  function onDialCodeInput() {
    // Убеждаемся, что символ + всегда есть в начале
    if (!dialCodeInput.value.startsWith('+')) {
      dialCodeInput.value = '+' + dialCodeInput.value.replace(/^\+*/, '');
    }
    
    // Разрешаем только + и цифры
    dialCodeInput.value = dialCodeInput.value.replace(/[^\+\d]/g, '');
    
    // Убеждаемся что + только в начале
    const plusCount = (dialCodeInput.value.match(/\+/g) || []).length;
    if (plusCount > 1) {
      dialCodeInput.value = '+' + dialCodeInput.value.replace(/\+/g, '');
    }
    
    dialCodeFilter.value = dialCodeInput.value;
    open.value = true;
    
    // Автовыбор страны если код точно совпадает
    const exactMatch = filteredCountries.value.find(country => 
      `+${country.dialCode}` === dialCodeInput.value
    );
    
    if (exactMatch && filteredAndSortedCountries.value.length === 1) {
      choose(exactMatch);
    }
  }

  function onDialCodeBlur() {
    setTimeout(() => {
      if (!dialCodeInput.value && activeCountry.value) {
        dialCodeInput.value = `+${activeCountry.value.dialCode}`;
      }
    }, 200);
  }

  function openDropdown() {
    if (!props.disabled) {
      open.value = true;
    }
  }

  function setCaretPosition(ctrl, pos) {
    if (ctrl.setSelectionRange) {
      ctrl.focus();
      ctrl.setSelectionRange(pos, pos);
    } else if (ctrl.createTextRange) {
      const range = ctrl.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  }

  function resetPlaceholder() {
    parsedPlaceholder.value = props.inputOptions.placeholder;
  }

  function initializeCountry() {
    return new Promise((resolve) => {
      if (phone.value?.[0] === '+') { 
        resolve(); 
        return; 
      }
      
      if (props.defaultCountry) { 
        choose(props.defaultCountry); 
        resolve(); 
        return; 
      }
      
      const fallbackCountry = props.preferredCountries[0] || filteredCountries.value[0];
      
      if (props.autoDefaultCountry) {
        fetch('https://ip2c.org/s')
          .then((response) => response.text())
          .then((response) => {
            const result = (response || '').toString();
            if (!result || result[0] !== '1') {
              throw new Error('unable to fetch the country');
            }
            return result.substr(2, 2);
          })
          .then((res) => { 
            choose(res || activeCountryCode.value); 
          })
          .catch((error) => { 
            console.warn(error); 
            choose(fallbackCountry); 
          })
          .finally(() => { 
            resolve(); 
          });
      } else {
        choose(fallbackCountry);
        resolve();
      }
    });
  }

  function getCountries(list = []) {
    return list.map((countryCode) => findCountry(countryCode)).filter(Boolean);
  }

  function findCountry(iso = '') {
    return filteredCountries.value.find((country) => country.iso2 === iso.toUpperCase());
  }

  function getItemClass(index, iso2) {
    const highlighted = selectedIndex.value === index;
    const lastPreferred = index === props.preferredCountries.length - 1;
    const preferred = props.preferredCountries.some((c) => c.toUpperCase() === iso2);
    return { highlighted, 'last-preferred': lastPreferred, preferred };
  }

  function choose(country) {
    let parsedCountry = typeof country === 'string' ? findCountry(country) : country;
    if (!parsedCountry) return;
    
    if (phone.value?.[0] === '+' && parsedCountry.iso2 && phoneObject.value.nationalNumber) {
      activeCountryCode.value = parsedCountry.iso2;
      phone.value = parsePhoneNumberFromString(
        phoneObject.value.nationalNumber, 
        parsedCountry.iso2
      ).formatInternational();
    } else {
      activeCountryCode.value = parsedCountry.iso2;
    }

    dialCodeInput.value = `+${parsedCountry.dialCode}`;
    dialCodeFilter.value = '';
    
    // Закрываем дропдаун
    open.value = false;
    
    // Переводим фокус на основной инпут
    nextTick(() => {
      if (input.value) {
        input.value.focus();
      }
    });
    
    emitInput(phone.value);
  }

  function cleanInvalidCharacters() {
    const currentPhone = phone.value;

    if (props.validCharactersOnly) {
      const results = phone.value.match(/[()\-+0-9\s]*/g);
      phone.value = results.join('');
    }

    if (props.customValidate && props.customValidate instanceof RegExp) {
      const results = phone.value.match(props.customValidate);
      phone.value = results ? results.join('') : '';
    }

    if (currentPhone !== phone.value) {
      emitInput(phone.value);
    }
  }

  function testCharacters() {
    if (props.validCharactersOnly) {
      const result = /^[()\-+0-9\s]*$/.test(phone.value);
      if (!result) return false;
    }
    if (props.customValidate) {
      return testCustomValidate();
    }
    return true;
  }

  function testCustomValidate() {
    return props.customValidate instanceof RegExp ? props.customValidate.test(phone.value) : false;
  }

  function onInput() {
    input.value.setCustomValidity(phoneObject.valid ? '' : props.invalidMsg);
    emitInput(phone.value);
  }

  function emitInput(value) {
    emits('update:modelValue', value);

    if (phoneObject.value.valid) { 
      emits('change', phoneObject.value.number);
      emits('country', phoneObject.value.number);
    } else {
      emits('country', null);
    }
  }

  function onBlur() {
    emits('blur');
  }

  function onFocus() {
    setCaretPosition(input.value, phone.value.length);
    emits('focus');
  }

  function onEnter() {
    emits('enter');
  }

  function onSpace() {
    emits('space');
  }

  function focus() {
    input.value.focus();
  }

  function toggleDropdown() {
    if (props.disabled) return;
    open.value = !open.value;
  }

  function clickedOutside() {
    open.value = false;
    dialCodeFilter.value = '';
  }

  function keyboardNav(e) {
    if (e.keyCode === 40) { // down arrow
      e.preventDefault();
      open.value = true;
      selectedIndex.value = selectedIndex.value === null ? 0 : 
        Math.min(filteredAndSortedCountries.value.length - 1, selectedIndex.value + 1);
      nextTick(() => {
        const selEle = list.value.children[selectedIndex.value];
        if (selEle.offsetTop + selEle.clientHeight > list.value.scrollTop + list.value.clientHeight) {
          list.value.scrollTop = selEle.offsetTop - list.value.clientHeight + selEle.clientHeight;
        }
      });
    } else if (e.keyCode === 38) { // up arrow
      e.preventDefault();
      open.value = true;
      selectedIndex.value = selectedIndex.value === null ? 
        filteredAndSortedCountries.value.length - 1 : Math.max(0, selectedIndex.value - 1);
      nextTick(() => {
        const selEle = list.value.children[selectedIndex.value];
        if (selEle.offsetTop < list.value.scrollTop) {
          list.value.scrollTop = selEle.offsetTop;
        }
      });
    } else if (e.keyCode === 13) { // enter key
      e.preventDefault();
      if (selectedIndex.value !== null) {
        choose(filteredAndSortedCountries.value[selectedIndex.value]);
      }
    } else { 
      // Поиск по названию страны
      if (e.target.classList.contains('vti__country-code-input')) return;
      
      typeToFindInput.value += e.key;
      clearTimeout(typeToFindTimer);
      typeToFindTimer = setTimeout(() => {
        typeToFindInput.value = '';
      }, 700);
      
      nextTick(() => {
        const typedCountryI = filteredAndSortedCountries.value
          .slice(props.preferredCountries.length)
          .findIndex((c) => c.name.toLowerCase().startsWith(typeToFindInput.value));
        if (typedCountryI >= 0) {
          selectedIndex.value = props.preferredCountries.length + typedCountryI;
          const selEle = list.value.children[selectedIndex.value];
          const needToScroll = selEle.offsetTop < list.value.scrollTop || 
            selEle.offsetTop + selEle.clientHeight > list.value.scrollTop + list.value.clientHeight;
          if (needToScroll) {
            list.value.scrollTop = selEle.offsetTop - list.value.clientHeight / 2;
          }
        }
      });
    }
  }

  function reset() {
    selectedIndex.value = filteredAndSortedCountries.value
      .map(c => c.iso2).indexOf(activeCountryCode.value);
    open.value = false;
  }

  function setDropdownPosition() {
    const spaceBelow = window.innerHeight - rootElement.value.getBoundingClientRect().bottom;
    const hasEnoughSpaceBelow = spaceBelow > 200;
    dropdownOpenDirection.value = hasEnoughSpaceBelow ? 'below' : 'above';
  }
</script>

<style lang="scss">
.vue3-reactive-tel-input {
  display: flex;
}

.vue3-reactive-tel-input.disabled .dropdown,
.vue3-reactive-tel-input.disabled .selection,
.vue3-reactive-tel-input.disabled input {
  cursor: no-drop;
}

.vti__dropdown {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  position: relative;
  padding: 0.5rem;
  cursor: pointer;
}

.vti__dropdown.show {
  max-height: 300px;
  overflow: scroll;
}

.vti__dropdown-list {
  z-index: 1;
  padding: 0;
  margin: 0;
  text-align: left;
  list-style: none;
  max-height: 200px;
  overflow-y: scroll;
  position: absolute;
  left: -1px;
  background-color: #fff;
  width: fit-content;
}

.vti__dropdown-list.below {
  top: 33px;
}

.vti__dropdown-list.above {
  top: auto;
  bottom: 100%;
}

.vti__dropdown-item {
  cursor: pointer;
  padding: 4px 15px;
}

.vti__dropdown-item.highlighted {
  background-color: #f0f0f0;
}

.vti__dropdown-item.last-preferred {
  border-bottom: 1px solid #cacaca;
}

.vti__input {
  color: inherit;
  border: none;
  border-radius: 0 2px 2px 0;
  width: 100%;
  outline: 0;
  padding-left: 7px;
}

.vti__country-code-input {
  max-width: 70px;
  border: none;
  outline: none;
  background: transparent;
  font-size: inherit;
  color: inherit;
  text-align: center;
}
</style>