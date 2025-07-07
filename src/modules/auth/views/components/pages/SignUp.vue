<template>
	<section class="t-left pd-medium">
		<!-- Header -->
		<!-- <img loading="lazy" src="@/assets/images/logo.svg" class="i-extra mn-b-small"> -->
		<h3 class="mn-b-small">{{t('auth.signUp.title')}}</h3>
		
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
				<div v-show="tabAuth === 'phone'" class="mn-b-semi radius-small">
					<p class="mn-b-small t-transp">{{t('auth.signUp.smsNotice')}}</p>
					<FieldPhone
						@change="(event) => auth.state.user.phone = event" 	
						:dropdownOptions="{
							showDialCodeInSelection: true,
							showFlags: true,
							showDialCodeInList: true
						}"
						:validation="phoneValidation" 
						mode="national"
						:inputOptions="{placeholder: t('auth.signUp.phonePlaceholder')}"
						class="bg-light h-4r pd-small radius-small mn-b-thin" 
					/>
					
				</div>
			</transition>
			<transition name="slide-fade">
				<div v-show="tabAuth === 'email'" class="mn-b-semi radius-small o-hidden">
					<p class="mn-b-small t-transp">{{t('auth.signUp.emailNotice')}}</p>
					<Field 
						v-model:field="auth.state.user.email" 	
						:placeholder="t('auth.signUp.emailPlaceholder')" 	
						:validation="emailValidation"
						class="bg-light h-4r pd-medium radius-small" 
					/>
				</div>
			</transition>
		</div>
		
		<!-- Button -->
		<Button :submit="onSubmit" :callback="redirectTo" class="w-100 bg-main mn-b-big">{{t('auth.signUp.sendCode')}}</Button>
			
		<!-- Links -->
		<div class="w-100">
			<router-link :to="{name: 'Sign In', query: { returnUrl: route.query.returnUrl}}" class="underline mn-b-medium d-block t-blue">{{t('auth.signUp.haveAccount')}}</router-link>
		</div>

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
	// Import state
	import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
	import * as twofa from '@martyrs/src/modules/auth/views/store/twofa.js'
	import * as globals from '@martyrs/src/modules/globals/views/store/globals.js'
	// Import validation
	import * as inputsValidation from '@martyrs/src/modules/auth/views/validations/inputs.validation'
	// Localization
	const { t } = useI18n({
		useScope: 'global', 
	})
	// Validation
	const phoneValidation = ref(null)
	const emailValidation = ref(null)
	// Accessing router
	// const store = useStore()
	const route = useRoute()
	const router = useRouter()
	// Accessing state
	const availableTabs = computed(() => {
	    const tabs = [
	        { name: t('auth.signUp.phone'), value: 'phone' },
	        { name: t('auth.signUp.email'), value: 'email' }
	    ];
	    return tabs.filter(tab => !globals.state.options.auth.authMethodsExclude.includes(tab.value));
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
	  	await twofa.sendCode(auth.state.user, 'signup', tabAuth.value)
	  } catch (error) {
			throw new Error
		}
	}

	function redirectTo () {
		router.push({ name: 'Enter Code', query: { returnUrl: route.query.returnUrl}})
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
