<template>
  <transition name="moveFromTop">
    <teleport to="body" v-if="isPopupOpen">
      <div v-if="isPopupOpen" key="popup-content" class="z-index-6 popup-wrapper"
        :class="{
          'pd-t-extra': MOBILE_APP === 'ios',
          [alignClass]: true
        }"
      >
        <transition name="TransitionTranslateY" mode="out-in">
          <section class="h-max-100 o-y-scroll pos-relative z-index-4" v-bind="$attrs" :class="$attrs.class">
            <h4 v-if="title" class="mn-b-medium">{{title}}</h4>
            <IconCross :fill="'rgb(var(--white))'" @click="closePopup()" class="cursor-pointer bg-second pd-micro radius-extra pos-absolute pos-t-0 pos-r-0 mn-t-medium mn-r-medium hover-scale-1 i-medium z-index-5"/>
            <slot></slot>
          </section>  
        </transition>

        <div 
          @click="closePopup()" 
          :class="{'active':isPopupOpen === true}" 
          class="color-overlay z-index-3">
        </div>
      </div>
    </teleport>
  </transition>
</template>

<script setup>
import { computed, watch, onMounted, ref, nextTick } from 'vue';
// Import libs
import { useRoute, useRouter } from 'vue-router'
// import { useI18n } from 'vue-i18n'
// Icons
import IconCross from '@martyrs/src/modules/icons/navigation/IconCross.vue';
// Define props
const props = defineProps({
  isPopupOpen: {
    type: Boolean,
    default: false
  },
  style: String,
  title: String,
  align: {
    type: String,
    default: 'center center',
    validator: (value) => {
      const validAlignments = [
        'top left', 'top center', 'top right',
        'center left', 'center center', 'center right',
        'bottom left', 'bottom center', 'bottom right'
      ];
      return validAlignments.includes(value);
    }
  }
});

const emits = defineEmits(['close-popup'])

// Compute the alignment class from the align prop
const alignClass = computed(() => {
  return `align-${props.align.replace(/\s+/g, '-')}`;
});

function closePopup() {
  emits("close-popup");
} 

watch(() => props.isPopupOpen, (newVal) => {
  if (newVal) {
    document.body.classList.add('no-scroll');
  } else {
    document.body.classList.remove('no-scroll');
  }
});

// Accessing router and store
const route = useRoute()
const router = useRouter()
// Localization
const text = {
  messages: {
    en: {},
    ru: {}
  }
}
// const { t } = useI18n(text)
</script>

<style lang="scss">
  .no-scroll {
    overflow: hidden;

    #view {
      overflow: hidden;
    }
  }

  .popup-wrapper {
    display: flex;
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 40;

    /* Default alignment - center center */
    &.align-center-center {
      align-items: center;
      justify-content: center;
    }

    /* Top alignments */
    &.align-top-left {
      align-items: flex-start;
      justify-content: flex-start;
    }
    
    &.align-top-center {
      align-items: flex-start;
      justify-content: center;
    }
    
    &.align-top-right {
      align-items: flex-start;
      justify-content: flex-end;
    }

    /* Center alignments */
    &.align-center-left {
      align-items: center;
      justify-content: flex-start;
    }
    
    &.align-center-right {
      align-items: center;
      justify-content: flex-end;
    }

    /* Bottom alignments */
    &.align-bottom-left {
      align-items: flex-end;
      justify-content: flex-start;
    }
    
    &.align-bottom-center {
      align-items: flex-end;
      justify-content: center;
    }
    
    &.align-bottom-right {
      align-items: flex-end;
      justify-content: flex-end;
    }

    .popup {
      position: absolute;
      height: auto;
      padding: 2rem;
      min-width: 24rem;
      border-radius: 2rem;
      overflow: hidden;
      color: white;
      background: black;
      z-index: 40;
    }
  }

  .color-overlay {
    display: block;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.0);
    pointer-events: none;
    transform: scale(1.5);
    transition: all 0.5s cubic-bezier(.31,.79,.24,.92);
    
    &.active {
      background: rgba(#000,0.25);
      pointer-events: all;
    }
  }
</style>