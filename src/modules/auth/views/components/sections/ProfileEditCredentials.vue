<template>
  <div v-if="show" class="">
    <h3 class="mn-b-small">Phone and Email</h3>

    <!-- Email section -->
    <div v-if="!users.state.current.email" class="mn-b-semi">
      <div v-if="isAddingEmail">
        <Field 
          v-model:field="newEmail"     
          label="Email"  
          placeholder="Enter your email" 
          class="mn-b-thin bg-light pd-medium radius-small"
          :disabled="isVerificationSent"
        />
        <div class="flex gap-2">
          <Button 
            v-if="!isVerificationSent"
            :submit="() => sendVerification('email', 'add')" 
            class="mn-b-thin t-white bg-second  flex-1"
          >
            Add Email
          </Button>
          <Button 
            v-if="!isVerificationSent"
            :submit="() => cancelAdding('email')" 
            class="mn-b-thin bg-red t-white flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
      <Button 
        v-if="!isAddingEmail"
        :submit="() => startAdding('email')" 
        class="mn-b-thin t-white bg-second w-100"
      >
        Add Email
      </Button>
    </div>

    <!-- Phone section -->
    <div v-if="!users.state.current.phone" class="mn-b-semi">
      <div v-if="isAddingPhone">
        <FieldPhone
          @change="(event) => newPhone = event"  
          :dropdownOptions="{
            showDialCodeInSelection: true,
            showFlags: true,
            showDialCodeInList: true
          }"
          :validCharactersOnly="true"
          mode="national"
          :inputOptions="{placeholder: 'Enter your phone number', type: 'tel'}"
          class="bg-light h-4r pd-small radius-small mn-b-thin" 
        />

        <div class="flex gap-2">
          <Button 
            v-if="!isVerificationSent"
            :submit="() => sendVerification('phone', 'add')" 
            class="mn-b-thin t-white bg-second flex-1"
          >
            Add Phone
          </Button>
          <Button 
            v-if="!isVerificationSent"
            :submit="() => cancelAdding('phone')" 
            class="mn-b-thin  t-white bg-second t-white flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
      <Button 
        v-if="!isAddingPhone"
        :submit="() => startAdding('phone')" 
        class="mn-b-thin bg-main w-100"
      >
        Add Phone
      </Button>
    </div>

    <!-- Current contact info with edit options -->
    <div class="mn-b-semi">
      <!-- Current/Edit Phone -->
      <div v-if="users.state.current.phone" class="mn-b-thin">
        <Field 
          v-if="!isEditingPhone"
          v-model:field="users.state.current.phone"     
          label="Phone"  
          class="mn-b-thin bg-light pd-medium radius-small" 
          disabled="true"
        />
        <Field 
          v-else
          v-model:field="newPhone"     
          label="New Phone"  
          placeholder="Enter new phone number" 
          class="mn-b-thin t-black  bg-light pd-medium radius-small"
          :disabled="isVerificationSent"
        />
        <Button 
          v-if="!isEditingPhone && !isVerificationSent"
          :submit="() => startEditing('phone')" 
          class="mn-b-thin t-black bg-light w-100"
        >
          Change Phone
        </Button>
        <Button 
          v-if="isEditingPhone && !isVerificationSent"
          :submit="() => sendVerification('phone', 'edit')" 
          class="mn-b-thin bg-main w-100"
        >
          Verify New Phone
        </Button>
      </div>

      <!-- Current/Edit Email -->
      <div v-if="users.state.current.email">
        <Field 
          v-if="!isEditingEmail"
          v-model:field="users.state.current.email"     
          label="Email"  
          class="mn-b-thin bg-light pd-medium radius-small" 
          disabled="true"
        />
        <Field 
          v-else
          v-model:field="newEmail"     
          label="New Email"  
          placeholder="Enter new email" 
          class="mn-b-thin bg-light pd-medium radius-small"
          :disabled="isVerificationSent"
        />
        <Button 
          v-if="!isEditingEmail && !isVerificationSent"
          :submit="() => startEditing('email')" 
          class="mn-b-thin t-black bg-light w-100"
        >
          Change Email
        </Button>
        <Button 
          v-if="isEditingEmail && !isVerificationSent"
          :submit="() => sendVerification('email', 'edit')" 
          class="mn-b-thin bg-main w-100"
        >
          Verify New Email
        </Button>
      </div>
    </div>

    <!-- Verification code section -->
    <div v-if="isVerificationSent" class="mn-b-semi">
      <Field 
        v-model:field="verificationCode"     
        label="Verification Code"  
        placeholder="Enter the code" 
        class="mn-b-thin bg-light pd-medium radius-small"
      />
      <div class="flex gap-2">
        <Button 
          :submit="verifyCode" 
          class="mn-b-thin bg-main flex-1"
        >
          Verify
        </Button>
        <Button 
          :submit="resendCode" 
          class="mn-b-thin bg-light flex-1"
        >
          Resend Code
        </Button>
        <Button 
          :submit="cancelEdit" 
          class="mn-b-thin bg-red t-white flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import components
import Field from '@martyrs/src/components/Field/Field.vue'
import Button from '@martyrs/src/components/Button/Button.vue'

// Import libs
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Import state
import * as users from '@martyrs/src/modules/auth/views/store/users.js'
import * as twofa from '@martyrs/src/modules/auth/views/store/twofa.js'

// Component state
const show = ref(false)
const newEmail = ref('')
const newPhone = ref('')
const verificationCode = ref('')
const isVerificationSent = ref(false)
const currentVerificationType = ref(null)
const currentAction = ref(null) // 'add' or 'edit'
const isEditingEmail = ref(false)
const isEditingPhone = ref(false)
const isAddingEmail = ref(false)
const isAddingPhone = ref(false)

// Router
const route = useRoute()
const router = useRouter()

import FieldPhone from '@martyrs/src/components/FieldPhone/FieldPhone.vue'

// Lifecycle hooks
onMounted(async () => {
  await users.actions.read({ _id: route.params._id })
  show.value = true
})

// Methods
function startEditing(type) {
  if (type === 'email') {
    isEditingEmail.value = true
    newEmail.value = ''
  } else {
    isEditingPhone.value = true
    newPhone.value = ''
  }
}

// Methods for adding new contact info
function startAdding(type) {
  if (type === 'email') {
    isAddingEmail.value = true
    newEmail.value = ''
  } else {
    isAddingPhone.value = true
    newPhone.value = ''
  }
}

function cancelAdding(type) {
  if (type === 'email') {
    isAddingEmail.value = false
    newEmail.value = ''
  } else {
    isAddingPhone.value = false
    newPhone.value = ''
  }
}

function cancelEdit() {
  isEditingEmail.value = false
  isEditingPhone.value = false
  isAddingEmail.value = false
  isAddingPhone.value = false
  isVerificationSent.value = false
  verificationCode.value = ''
  newEmail.value = ''
  newPhone.value = ''
  currentVerificationType.value = null
  currentAction.value = null
}

async function sendVerification(type, action) {
  try {
    // Validate input before sending verification
    if (action === 'edit') {
      if (type === 'email' && (!newEmail.value || newEmail.value === users.state.current.email)) {
        throw new Error('Please enter a different email address')
      }
      if (type === 'phone' && (!newPhone.value || newPhone.value === users.state.current.phone)) {
        throw new Error('Please enter a different phone number')
      }
    }

    const userData = {
      phone: type === 'phone' ? newPhone.value : users.state.current.phone,
      email: type === 'email' ? newEmail.value : users.state.current.email
    }

    await twofa.sendCode(userData, 'update', type)
    isVerificationSent.value = true
    currentVerificationType.value = type
    currentAction.value = action
  } catch (error) {
    console.error('Failed to send verification code:', error)
  }
}

async function verifyCode() {
  try {
    // Проверяем, что код существует в state
    if (!twofa.state.code || !twofa.state.code.code) {
      throw new Error('Verification code not found')
    }

    // Сравниваем введенный код с кодом из state
    if (String(twofa.state.code.code) === String(verificationCode.value)) {
      const updateData = { ...users.state.current }
      
      if (currentVerificationType.value === 'email') {
        updateData.email = newEmail.value
      } else {
        updateData.phone = newPhone.value
      }

      await users.actions.update(updateData)
      
      // Reset state
      cancelEdit()
      
      // Refresh user data
      await users.actions.read({ _id: route.params._id })
    } else {
      throw new Error('Invalid verification code')
    }
  } catch (error) {
    console.error('Verification failed:', error)
  }
}

async function resendCode() {
  verificationCode.value = ''
  await sendVerification(currentVerificationType.value, currentAction.value)
}
</script>