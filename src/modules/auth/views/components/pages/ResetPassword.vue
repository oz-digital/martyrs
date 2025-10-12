<template>
	<section class="t-left pd-medium">
		<!-- <img loading="lazy" src="@/assets/icons/password.png" class="i-extra mn-b-small"> -->
		<!-- Header -->
		<h3 class="mn-b-small">{{ t('auth.resetPassword.forgotPasswordTitle') }}</h3>
		<p class="mn-b-small t-transp">{{ t('auth.resetPassword.instructions') }}</p>
		
		<!-- Select -->
		<div 
			v-if="availableTabs.length > 1" 
			class="mn-b-small p-small uppercase t-semi bg-light radius-small o-hidden"
		>
			<Tab 
				v-model:selected="tabAuth"
				:tabs="availableTabs"
				classTab="pd-small pd-r-medium pd-l-medium w-100 pd-small radius-small"
			/>
		</div>

		<!-- Form -->
		<div class="pos-relative">
		<!-- Phone -->
			<transition name="slide-fade">
				<div v-if="tabAuth === 'phone'" class="mn-b-semi radius-small">
					<p class="mn-b-small t-transp">{{ t('auth.resetPassword.smsInfo') }}</p>
					<FieldPhone
						@change="(event) => auth.state.user.phone = event" 	
						:dropdownOptions="{
							showDialCodeInSelection: true,
							showFlags: true,
							showDialCodeInList: true
						}"
						:validation="phoneValidation" 
						mode="national"
						:inputOptions="{placeholder: t('auth.resetPassword.phonePlaceholder')}"
						class="bg-light h-4r pd-small radius-small mn-b-thin" 
					/>
				</div>
			</transition>
			<!-- Email -->
			<transition name="slide-fade">
				<div v-if="tabAuth === 'email'" class="mn-b-semi radius-small o-hidden">
					<p class="mn-b-small t-transp">{{ t('auth.resetPassword.emailInfo') }}</p>
					<Field 
						v-model:field="auth.state.user.email" 		
						:placeholder="t('auth.resetPassword.emailPlaceholder')" 	
						:validation="emailValidation" 
						class="bg-light h-4r pd-medium radius-small" 
					/>
				</div>
			</transition>
		</div>
		<!-- Button -->
		<Button :submit="onSubmit" :callback="redirectTo" class="w-100 bg-main">{{ t('auth.resetPassword.sendCode') }}</Button>
	</section> 
</template>

<script setup>
// Import components
import Tab           from '@martyrs/src/components/Tab/Tab.vue'
import Field         from '@martyrs/src/components/Field/Field.vue'
import FieldPhone    from '@martyrs/src/components/FieldPhone/FieldPhone.vue'
import Button        from '@martyrs/src/components/Button/Button.vue'
// Import libs
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
// Import store
import { useStore } from '@martyrs/src/modules/core/views/store/core.store.js'
// Import validation
import * as inputsValidation from '@martyrs/src/modules/auth/views/validations/inputs.validation'

// Get store
const store = useStore()
const auth = store.auth || { state: {}, actions: {} }
const twofa = store.twofa || { state: {}, actions: {}, sendCode: () => {} }
const core = store.core || { state: {}, actions: {} }
// Localization
const { t } = useI18n({
	useScope: 'global', 
})
// Validation
const phoneValidation = ref(null)
const emailValidation = ref(null)
// Accessing router
const route = useRoute()
const router = useRouter()
// Accessing state
const availableTabs = computed(() => {
    const tabs = [
        { name: t('auth.resetPassword.phone'), value: 'phone' },
        { name: t('auth.resetPassword.email'), value: 'email' }
    ];
    const excludeMethods = core.state?.options?.auth?.authMethodsExclude || [];
    return tabs.filter(tab => !excludeMethods.includes(tab.value));
});

const tabAuth = ref(availableTabs.value.length ? availableTabs.value[0].value : '');
// Methods
async function onSubmit() {
	try {
	  if (tabAuth.value === 'phone') await inputsValidation.validateInputs(
			phoneValidation, 
			inputsValidation.validatePhone, 
			auth.state.user.phone, 
			'Некорректный телефон'
		)
		if (tabAuth.value === 'email') await inputsValidation.validateInputs(
			emailValidation, 
			inputsValidation.validateEmail, 
			auth.state.user.email, 
			'Некорректный email'
		)
	} catch (error) {
		throw new Error
	}
	try {
  	await auth.actions.resetPassword(auth.state.user, tabAuth.value, 'reset-password')
  } catch (error) {
  	console.log(error)
		throw new Error
	}
}

function redirectTo () {
	router.push({ name: 'Enter Code', query: {type: tabAuth.value, method: 'reset-password'} })
}
</script>

<style lang="scss">
	.slide-fade-enter-active {
	  transition: all  0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.slide-fade-leave-active {
	  transition: all  0.3s cubic-bezier(0.4, 0, 0.2, 1);

	}

	.slide-fade-enter-from,
	.slide-fade-leave-to {
		position: absolute;
	  transform: translateX(20px);
	  opacity: 0;
	  left: 0;
	  top: 0;
	}

	.slide-fade-leave-to {

	}
</style>
