<template>
	<section class="t-left pd-medium">
		<!-- Header -->
		<!-- <img loading="lazy" src="@/assets/icons/password.png" class="i-extra mn-b-small"> -->
		<h3 class="mn-b-small">{{ t('almostDone') }}</h3>
		<p v-if="route.query.method === 'reset-password'" class="mn-b-semi t-transp">{{ t('newPasswordPrompt') }}</p>
		<p v-else class="mn-b-semi t-transp">{{ t('registrationPasswordPrompt') }}</p>
	
		<!-- Form -->
		<div class="mn-b-semi radius-small o-hidden">
			<Field 
				v-model:field="auth.state.user.password"
				type="password" 	
				:validation="passswordValidation" 
				:placeholder="t('passwordPlaceholder')"		
				class="bg-light pd-small radius-small mn-b-thin"
			/>
			<Field 
				v-model:field="auth.state.user.passwordRepeat"
				type="password" 	
				:placeholder="t('repeatPasswordPlaceholder')"
				class="bg-light pd-small radius-small mn-b-thin"
			/>
		</div>
		<div
			 v-if="route.query.method !== 'reset-password'" 
			 class="p-medium t-semi mn-b-semi "
		>
			 By registering, you agree to our <a class="t-second" href="/legal/eula" target="_blank" rel="noopener noreferrer">End User License Agreement (EULA)</a>
		</div>
		<!-- Button -->
		<Button :submit="onSubmit" :callback="redirectTo" class="w-100 bg-main mn-b-big">
			<span  v-if="route.query.method === 'reset-password'">{{ t('changePasswordBtn') }}</span>
			<span v-else>{{ t('registerBtn') }}</span>
		</Button>
	</section> 
</template>

<script setup>
// Import components
import Tab           from '@martyrs/src/components/Tab/Tab.vue'
import Field         from '@martyrs/src/components/Field/Field.vue'
import Button        from '@martyrs/src/components/Button/Button.vue'
// Import libs
import { computed, onMounted, ref, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
// Import state
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
// Import validation
import * as inputsValidation from '@martyrs/src/modules/auth/views/validations/inputs.validation'
const passswordValidation = ref(null)
// Localization
import text from '@martyrs/src/modules/auth/views/localization/EnterPassword.json'
// Localization
const { t } = useI18n({
	useScope: 'global', 
	...text
})
// Accessing router
const route = useRoute()
const router = useRouter()
// Accessing state
const tabAuth = ref('phone')
// Methods
async function onSubmit() {
	try {
		await inputsValidation.validateInputs(
			passswordValidation, 
			inputsValidation.validatePassword, 
			auth.state.user.password, 
			'Некорректный пароль'
		)
	} catch (error) {
		throw new Error
	}

	if (route.query.method === 'reset-password') await auth.actions.updatePassword(auth.state.user, route.query.type)
	if (route.query.method !== 'reset-password') await auth.actions.signup(auth.state.user, route.query.type)
}

function redirectTo () {
	if (route.query.returnUrl) {
		router.push({ 
			path: route.query.returnUrl,
			query: { 
				afterAuth: 'true' 
			}
		})
	} else { 
		router.push({ 
			name: 'User Profile', 
			params: { 
				_id: auth.state.user._id 
			},
			query: { 
				afterAuth: 'true' 
			}
		})
	}
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
