<template>
  <div class="notification-preferences">
    <h2>Notification Preferences</h2>
    <p class="description">Choose how you want to receive notifications</p>
    
    <div v-if="loading" class="preferences-loading">
      <div class="loading-spinner">🔄</div>
      <p>Loading preferences...</p>
    </div>
    
    <div v-else class="preferences-form">
      <div 
        v-for="(enabled, channelType) in preferences" 
        :key="channelType" 
        class="preference-item"
      >
        <div class="preference-info">
          <div class="preference-icon">{{ getChannelIcon(channelType) }}</div>
          <div class="preference-details">
            <h3>{{ getChannelName(channelType) }}</h3>
            <p>{{ getChannelDescription(channelType) }}</p>
          </div>
        </div>
        <label class="toggle-switch">
          <input
            type="checkbox"
            :checked="enabled"
            @change="updatePreference(channelType, $event.target.checked)"
          >
          <span class="toggle-slider"></span>
        </label>
      </div>
      
      <div class="form-actions">
        <button 
          class="save-btn" 
          :disabled="!hasChanges || saving" 
          @click="savePreferences"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
        <button 
          v-if="hasChanges" 
          class="cancel-btn" 
          @click="resetChanges"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue';

// Get notification preferences functionality
const { 
  preferences: storePreferences,
  loading,
  getPreferences,
  updatePreferences
} = inject('useNotifications')();

// Local reactive state for form
const preferences = reactive({...storePreferences.value});
const originalPreferences = ref({});
const saving = ref(false);

// Computed properties
const hasChanges = computed(() => {
  return Object.keys(preferences).some(key => 
    preferences[key] !== originalPreferences.value[key]
  );
});

// Methods
const updatePreference = (channelType, value) => {
  preferences[channelType] = value;
};

const savePreferences = async () => {
  try {
    saving.value = true;
    await updatePreferences(preferences);
    originalPreferences.value = {...preferences};
    saving.value = false;
  } catch (error) {
    console.error('Error saving preferences:', error);
    saving.value = false;
  }
};

const resetChanges = () => {
  Object.keys(preferences).forEach(key => {
    preferences[key] = originalPreferences.value[key];
  });
};

const getChannelIcon = (channelType) => {
  switch (channelType) {
    case 'web': return '🖥️';
    case 'push': return '📱';
    case 'email': return '📧';
    case 'sms': return '📱';
    case 'telegram': return '📬';
    case 'whatsapp': return '💬';
    default: return '🔔';
  }
};

const getChannelName = (channelType) => {
  switch (channelType) {
    case 'web': return 'Web Notifications';
    case 'push': return 'Mobile Push Notifications';
    case 'email': return 'Email Notifications';
    case 'sms': return 'SMS Notifications';
    case 'telegram': return 'Telegram Messages';
    case 'whatsapp': return 'WhatsApp Messages';
    default: return channelType;
  }
};

const getChannelDescription = (channelType) => {
  switch (channelType) {
    case 'web': 
      return 'Real-time notifications in your browser';
    case 'push': 
      return 'Notifications on your mobile device even when the app is closed';
    case 'email': 
      return 'Receive notifications in your email inbox';
    case 'sms': 
      return 'Get text messages for important notifications';
    case 'telegram': 
      return 'Receive notifications via Telegram bot';
    case 'whatsapp': 
      return 'Get notifications as WhatsApp messages';
    default: 
      return '';
  }
};

// Lifecycle
onMounted(async () => {
  await getPreferences();
  
  // Copy store preferences to local state
  Object.keys(storePreferences.value).forEach(key => {
    preferences[key] = storePreferences.value[key];
  });
  
  // Create a deep copy of the original preferences
  originalPreferences.value = {...preferences};
});
</script>

<style scoped>
.notification-preferences {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

h2 {
  margin-top: 0;
  margin-bottom: 8px;
}

.description {
  color: #666;
  margin-bottom: 24px;
}

.preferences-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}

.loading-spinner {
  font-size: 2rem;
  margin-bottom: 16px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.preference-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.preference-item:last-child {
  border-bottom: none;
}

.preference-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.preference-icon {
  font-size: 1.5rem;
  margin-right: 16px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preference-details h3 {
  margin: 0 0 4px 0;
  font-size: 1rem;
}

.preference-details p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

/* Toggle switch styles */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #2196F3;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.save-btn, .cancel-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  background-color: #2196F3;
  border: none;
  color: white;
}

.save-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: white;
  border: 1px solid #ccc;
}
</style>