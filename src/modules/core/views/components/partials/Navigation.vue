<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import IconChevronBottom from '@martyrs/src/modules/icons/navigation/IconChevronBottom.vue'

import * as core from '@martyrs/src/modules/core/views/store/core.store.js'
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'

const router = useRouter()
const route = useRoute()

import Dropdown from '@martyrs/src/components/Dropdown/Dropdown.vue'
import Spoiler from '@martyrs/src/components/Spoiler/Spoiler.vue'

const props = defineProps({
  navigationItems: Array,
  theme: {
    type: String,
    default: "light"
  },
  stateSidebar: {
    type: Boolean,
    default: false
  },
  horizontal: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits([
  'closeSidebar'
])

const expandedSections = ref([])

const toggleSection = (title) => {
  if (!props.stateSidebar) {
    if (menuItems.value.flatMap(section => section.items).find(item => item.title === title && item.subItems)) {
      emits('closeSidebar')
      setTimeout(() => {
        expandedSections.value.push(title)
      }, 50)
    }
    return
  }
  
  const index = expandedSections.value.indexOf(title)

  if (index === -1) {
    expandedSections.value.push(title)
  } else {
    expandedSections.value.splice(index, 1)
  }
}

const isSectionExpanded = (title) => {
  return expandedSections.value.includes(title)
}

// Process route functions with auth data and route
const processRoute = (routeFn) => {
  if (typeof routeFn === 'function') {
    return routeFn(auth.state, route)
  }
  return routeFn
}
</script>

<template>
  <nav
    class="transition-quint-out o-x-visible  h-100"
    :class="[
      stateSidebar ? 'pd-small' : 'pd-micro',
      horizontal ? 'w-100 desktop-only gap-thin flex flex-center flex-nowrap o-y-visible' : 'o-y-scroll gap-medium rows-1',
    ]"
  >
    <div 
      v-for="section in props.navigationItems" 
      v-show="!section.visible || (typeof section.visible === 'function' ? section.visible(auth.state, route) : true)"
      :key="section.category" 
      class="transition-quint-out"
      :class="[
        horizontal ? 'w-max  flex-child-default flex flex-nowrap' : '',
        stateSidebar && !horizontal ? '' : '',
      ]"
    >
      <div
        v-if="section.category && stateSidebar && !horizontal"
        class="uppercase t-medium t-transp p-small"
        :class="{
          't-black': theme === 'light',
          't-white':  theme === 'dark'
        }"
      >
        {{ section.category }}
      </div>

      <ul 
        :class="[
          horizontal ? 'w-100 gap-micro flex flex-nowrap' : 'flex flex-column gap-micro',
        ]"
      >
        <li
          v-for="item in section.items"
          v-show="!item.visible || (typeof item.visible === 'function' ? item.visible(auth.state, route) : true)"
          class="w-100 pos-relative"
          :key="item.title"

        >
        <Dropdown
          v-if="item.subItems && horizontal"
          class="w-100"
          align="left"
          trigger="hover"
        >
          <template #label>
            <button
              class="transition-quint-out w-100 flex radius-small flex-nowrap cursor-pointer flex-v-center pd-thin"
              @click="item.route ? router.push(processRoute(item.route)) : null"
              :class="[
                item.route && route.path === processRoute(item.route) ? theme === 'light' ? 'bg-light' : 'bg-dark' : '',
                theme === 'light' ? 'hover-bg-light' : 'hover-bg-dark'
              ]"
            >
              <span class="t-medium">{{ item.title }}</span>
              <!-- <IconChevronBottom :fill="theme === 'dark' ? 'rgb(var(--white))': 'rgb(var(--black))'" class="i-small mn-l-thin"/> -->
            </button>
          </template>
          <ul class="dropdown-submenu bg-blur-small" :class="theme === 'light' ? 'bg-white-transp-50 ' : 'bg-black-transp-50'">
            <li v-for="subItem in item.subItems" :key="subItem.title">
              <a
                @click="subItem.route ? router.push(processRoute(subItem.route)) : null"
                href="#"
                class="transition-quint-out flex flex-v-center flex-nowrap gap-thin pd-thin radius-small"
                :class="[
                  subItem.route && route.path === processRoute(subItem.route) ? theme === 'light' ? 'bg-light' : 'bg-dark' : '',
                  theme === 'light' ? 'hover-bg-light' : 'hover-bg-dark'
                ]"
              >
                <component
                  v-if="subItem.iconComponent"
                  :is="subItem.iconComponent"
                  class="i-medium"
                  :fill="core.state.theme.darkmode || theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'"
                />
                <span v-else class="">{{ subItem.icon }}</span>
                <span class="w-100">{{ subItem.title }}</span>
              </a>
            </li>
          </ul>
        </Dropdown>
        <button
          v-else
          class="transition-quint-out w-100 flex radius-small flex-nowrap cursor-pointer flex-v-center"
          @click="item.route ? (isPhone ? (stateSidebar = false) : null, route.path !== processRoute(item.route) ? router.push(processRoute(item.route)) : null) : null"
          :class="[
              horizontal ? 'pd-thin' : '',
              item.route && route.path === processRoute(item.route) ? theme === 'light' ? 'bg-light' : 'bg-dark' : '',
              theme === 'light' ? 'hover-bg-light' : 'hover-bg-dark'
            ]"
        >
          <div v-if="!horizontal" class="w-100 flex-child-default w-max-big flex flex-center aspect-1x1">
            <component
              v-if="item.iconComponent"
              :is="item.iconComponent"
              class="i-medium flex-child-default"
              :fill="core.state.theme.darkmode || theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'"
            />
            <span
              v-if="!item.iconComponent "
              class="p-regular"
            >
              {{ item.icon }}
            </span>
          </div>

          <span
            class="transition-quint-out w-100 t-left t-medium"
            :class="{ 'hidden': !stateSidebar && !horizontal, 'visible': stateSidebar || horizontal }"
          >
            {{ item.title }}
          </span>

          <span
            v-if="item.subItems && stateSidebar && !horizontal"
            class="mn-l-auto mn-r-small sidebar-dropdown-icon"
            :class="{ 'rotate-180': isSectionExpanded(item.title) }"
            @click.stop="toggleSection(item.title)"
          >
             <IconChevronBottom :class="{ 'rotate-180 mn-t-micro-negative': isOpen }" :fill=" theme === 'dark' ? 'rgb(var(--white))': 'rgb(var(--black))'" class="i-small"/>
          </span>
        </button>
        <transition
          enter-active-class="dropdown-enter"
          leave-active-class="dropdown-leave"
          enter-from-class="dropdown-enter-from"
          enter-to-class="dropdown-enter-to"
          leave-from-class="dropdown-leave-from"
          leave-to-class="dropdown-leave-to"
        >
          <ul
            v-if="item.subItems && isSectionExpanded(item.title) && stateSidebar && !horizontal"
            class="mn-l-small mn-t-thin"
          >
            <li v-for="subItem in item.subItems" :key="subItem.title">

              <a
               @click="subItem.route ? (isPhone ? (stateSidebar = false) : null, route.path !== processRoute(subItem.route) ? router.push(processRoute(subItem.route)) : null) : null"
                href="#"
                class="transition-quint-out flex flex-v-center flex-nowrap gap-thin pd-thin radius-small"
                :class="[
                  subItem.route && route.path === processRoute(subItem.route) ? theme === 'light' ? 'bg-light' : 'bg-dark' : '',
                    theme === 'light' ? 'hover-bg-light' : 'hover-bg-dark'
                    ]"
              >
                <component
                  v-if="subItem.iconComponent"
                  :is="subItem.iconComponent"
                  class="i-medium"
                 :fill="core.state.theme.darkmode || theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'"
                />
                <span v-else class="">{{ subItem.icon }}</span>
                <span class="w-100">{{ subItem.title }}</span>
              </a>
            </li>
          </ul>
        </transition>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>

.rotate-180 {
  transform: rotate(180deg);
}

.hidden {
/*  opacity: 0;*/
  width: 0;
  display: none;
}

.visible {
/*  opacity: 1;*/
  display: block;
}

/* Dropdown animations */
.dropdown-enter, .dropdown-leave {
  transition: all 0.3s ease-in-out;
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.dropdown-enter-to, .dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Horizontal dropdown submenu */
.dropdown-submenu {
  list-style: none;
  padding: 0.5rem;
  margin: 0;
  min-width: 12rem;
}

.dropdown-submenu li {
  width: 100%;
}

.dropdown-submenu a {
  display: flex;
  text-decoration: none;
  white-space: nowrap;
}

/* Transition for horizontal dropdown */
:deep(.TransitionTranslateY-enter-active),
:deep(.TransitionTranslateY-leave-active) {
  transition: translateY 0.2s ease;
   transition: opacity 0.2s ease;
}

:deep(.TransitionTranslateY-enter-from),
:deep(.TransitionTranslateY-leave-to) {
  opacity: 0;
  transform: translateY(-0.5rem);
}

:deep(.TransitionTranslateY-enter-to),
:deep(.TransitionTranslateY-leave-from) {
  opacity: 1;
  transform: translateY(0);
}
</style>