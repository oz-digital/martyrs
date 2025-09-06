<template>
  <Popup :title="mode === 'add' ? 'Add New Icon' : 'Replace Icon'" :isPopupOpen="isOpen" @close-popup="closePopup" class="bg-white pd-big radius-big w-max-60r">
    <div class="icon-search-popup">
      <div v-if="mode === 'add'" class="mn-b-medium cols-2 gap-small">
        <input 
          v-model="iconName" 
          type="text" 
          placeholder="Icon name (e.g., IconCart)"
          class="pd-small radius-medium border-light"
        />
        <select v-model="category" class="pd-small radius-medium border-light">
          <option value="">Select category</option>
          <option value="navigation">Navigation</option>
          <option value="entities">Entities</option>
          <option value="actions">Actions</option>
          <option value="socials">Socials</option>
        </select>
      </div>

      <Feed
        :search="true"
        :showLoadMore="false"
        :skeleton="{
          hide: false,
          horizontal: false,
          structure: [
            { block: 'image', size: 'medium' },
            { block: 'text', size: 'small' }
          ]
        }"
        :states="{
          empty: {
            title: 'No icons found',
            description: 'Try searching for different terms'
          }
        }"
        :store="{
          read: (options) => store.read(options)
        }"
        :options="{ limit: 20 }"
        v-slot="{ items }"
        class="cols-4 gap-small icon-grid"
      >
        <div 
          v-for="icon in items" 
          :key="icon.id"
          @click="selectIcon(icon)"
          class="icon-item aspect-1x1 bg-light radius-medium flex-center flex-v-center flex-column cursor-pointer hover-scale-1 pd-small"
        >
          <div class="icon-preview w-3r h-3r mn-b-thin flex-center flex-v-center">
            <div 
              class="icon-svg w-100 h-100"
              v-html="getIconSvg(icon)"
            ></div>
          </div>
          <div class="t-small t-truncate w-100 t-center">{{ icon.term }}</div>
        </div>
      </Feed>

      <div v-if="error" class="mn-t-medium pd-small bg-danger radius-medium t-white">
        {{ error }}
      </div>
    </div>
  </Popup>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import Feed from '@martyrs/src/components/Feed/Feed.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'add', // 'add' or 'replace'
    validator: (value) => ['add', 'replace'].includes(value)
  },
  currentIcon: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'icon-selected']);

const error = ref('');
const iconName = ref('');
const category = ref('');
const loading = ref(false);
const searchValue = ref('');

// Store configuration for Feed component
const store = {
  async read(params = {}) {
    try {
      if (!params.search) {
        return [];
      }

      const response = await fetch('/api/icons/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search icons');
      }

      return data.icons || [];
    } catch (err) {
      console.error('Search error:', err);
      error.value = err.message;
      return [];
    }
  }
};

// Auto-populate fields for replace mode
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.mode === 'replace' && props.currentIcon) {
    iconName.value = props.currentIcon.name;
    category.value = props.currentIcon.category;
    // Set initial search term (remove Icon prefix)
    searchValue.value = props.currentIcon.name.replace(/^Icon/, '');
  }
});

// Function to get icon preview - use PNG with black filter for now
function getIconSvg(icon) {
  // Use the PNG preview from Noun Project but apply CSS filter to make it black
  if (icon.preview_url) {
    return `<img src="${icon.preview_url}" alt="${icon.term}" style="width: 100%; height: 100%; object-fit: contain; filter: brightness(0) saturate(100%);" />`;
  }
  
  // Fallback SVG placeholder
  return `
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="rgb(var(--black))" opacity="0.8"/>
      <text x="12" y="16" text-anchor="middle" fill="white" font-size="8" font-family="monospace">
        ${icon.term.slice(0, 3)}
      </text>
    </svg>
  `;
}

async function selectIcon(icon) {
  if (props.mode === 'add' && (!iconName.value || !category.value)) {
    error.value = 'Please enter icon name and select category';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await fetch('/api/icons/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        iconId: icon.id,
        category: category.value,
        iconName: iconName.value,
        mode: props.mode,
        currentIconName: props.currentIcon?.name
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save icon');
    }

    emit('icon-selected', {
      ...data,
      icon: {
        name: iconName.value,
        category: category.value,
        term: icon.term
      }
    });
    
    closePopup();
  } catch (err) {
    console.error('Save error:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function closePopup() {
  error.value = '';
  iconName.value = '';
  category.value = '';
  searchValue.value = '';
  emit('close');
}
</script>

<style scoped>
.icon-search-popup {
  min-height: 500px;
}

.icon-grid {
  min-height: 400px;
}

.icon-item {
  transition: all 0.2s ease;
}

.icon-item:hover {
  background-color: rgb(var(--light-hover));
  transform: scale(1.05);
}

.icon-preview {
  background: rgb(var(--light));
  border-radius: 8px;
}

.icon-svg {
  filter: none;
}

.w-max-800 {
  max-width: 800px;
  width: 90vw;
}

::v-deep(.feed-enter-active),
::v-deep(.feed-leave-active) {
  transition: all 0.3s ease;
}

::v-deep(.feed-enter-from),
::v-deep(.feed-leave-to) {
  opacity: 0;
  transform: scale(0.9);
}
</style>