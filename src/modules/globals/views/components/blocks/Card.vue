<template>
  <component :is="tag || 'div'" @click="handleClick">
    <!-- Skeleton режим -->
    <Skeleton
      v-if="loading"
      :structure="skeletonStructure"
      :horizontal="true"
      :loading="true"
    />
    
    <!-- Обычный режим -->
    <template v-else>
      <!-- Изображение -->
      <slot name="image">
        <img
          v-if="photo"
          :src="(FILE_SERVER_URL || '') + photo"
          :alt="title"
          loading="lazy"
        />
        <component
          v-else-if="placeholder"
          :is="placeholder"
        />
        <PlaceholderUserpic v-else />
      </slot>

      <!-- Контент -->
      <div>
        <slot name="header">
          <p v-if="title">{{ title }}</p>
          <span v-if="subtitle">{{ subtitle }}</span>
        </slot>
        
        <slot />
        
        <slot name="footer" />
      </div>

      <!-- Действия -->
      <slot name="actions">
        <button
          v-if="action"
          @click.stop="action.method"
        >
          <component 
            v-if="action.label?.is" 
            :is="action.label.is" 
            v-bind="action.label.props"
          />
          <template v-else>
            {{ action.label }}
          </template>
        </button>
      </slot>
    </template>
  </component>
</template>

<script setup>
import { useSlots } from 'vue'
import Skeleton from '@martyrs/src/components/Skeleton/Skeleton.vue'
import PlaceholderUserpic from '@martyrs/src/modules/icons/placeholders/PlaceholderUserpic.vue'

const props = defineProps({
  // Данные
  photo: String,
  title: String,
  subtitle: String,
  action: Object,
  
  // Функционал
  tag: String,
  placeholder: [String, Object],
  loading: Boolean,
  skeletonStructure: Array
})

const emit = defineEmits(['click'])
const slots = useSlots()

const handleClick = () => {
  emit('click')
}
</script>