<template>
	<section class="">
		<!-- Header -->
		<img loading="lazy" :src="'/logo/logo.svg'" class="i-extra radius-small mn-b-small">

		<h3 class="mn-b-medium">
			{{ t('auth.signIn.title') }}
			<br>
			<span class="t-semi">{{ t('auth.signIn.subtitle') }}</span>
		</h3>

		<p class="mn-b-big">
			<router-link :to="{name: 'Sign Up', query: { returnUrl: route.query?.returnUrl}}" class="underline t-second">{{ t('auth.signIn.signup') }}</router-link>
		</p>
		
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
				<div v-show="tabAuth === 'phone'" class="mn-b-thin radius-small">
					<FieldPhone
						@change="(event) => auth.state.user.phone = event" 	
						:dropdownOptions="{
							showDialCodeInSelection: true,
							showFlags: true,
							showDialCodeInList: true,
							tabIndex: -1
						}"
						:validCharactersOnly="true"
						:validation="phoneValidation" 
						mode="national"
						:inputOptions="{placeholder: t('auth.signIn.phonePlaceholder'), type: 'tel'}"
						class="bg-light h-4r pd-small radius-small mn-b-thin" 
					/>
					
				</div>
			</transition>
			<transition name="slide-fade">
				<div v-show="tabAuth === 'email'" class="mn-b-thin radius-small o-hidden">
					<Field 
						v-model:field="auth.state.user.email" 	
						:placeholder="t('auth.signIn.emailPlaceholder')" 	
						:validation="emailValidation"
						:tabIndex="-1"
						class="bg-light h-4r pd-medium radius-small" 
					/>
				</div>
			</transition>
		</div>

		<!-- Password -->
		<Field 
			v-model:field="auth.state.user.password"
			type="password" 	
			:validation="passswordValidation" 
			:placeholder="t('auth.signIn.passwordPlaceholder')" 
			class="
        bg-light
        pd-medium
        radius-small
        mn-b-semi
        h-4r 
      "
		/>
		<!-- Links -->
		<div class="w-100 mn-b-big">
			<router-link
				:to="{name: 'Reset Password', query: { returnUrl: route.query?.returnUrl}}"
				class="underline d-block t-blue"
			>
				{{ t('auth.signIn.forgotPassword') }}
			</router-link>
		</div>
		<!-- Button -->
		<Button 
			:submit="onSubmit" 
			:callback="redirectTo" 
			class="w-100 bg-main"
		>
			{{ t('auth.signIn.signin') }}
		</Button>
		
		<!-- <Button 
			:submit="onSubmitApple" 
			:callback="redirectTo" 
			class="mn-b-thin bg-black t-white"
		>
			{{ t('auth.signIn.signin_apple') }}
		</Button> -->
	</section> 
</template>

<script setup>
// Import components
import Tab           from '@martyrs/src/components/Tab/Tab.vue'
import Field         from '@martyrs/src/components/Field/Field.vue'
import FieldPhone    from '@martyrs/src/components/FieldPhone/FieldPhone.vue'
import Button        from '@martyrs/src/components/Button/Button.vue'
// Import libs
import { computed, onMounted, ref, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
// Import state
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'
import * as globals from '@martyrs/src/modules/globals/views/store/globals.js'
// Import validation
import * as inputsValidation from '@martyrs/src/modules/auth/views/validations/inputs.validation'
// Init validation
const phoneValidation = ref(null)
const passswordValidation = ref(null)
const emailValidation = ref(null)
// Accessing router
const route = useRoute()
const router = useRouter()
// Localization
const { t } = useI18n({
	useScope: 'global'
})
// Accessing state
const availableTabs = computed(() => {
    const tabs = [
        { name: t('auth.signIn.phone'), value: 'phone' },
        { name: t('auth.signIn.email'), value: 'email' }
    ];
    return tabs.filter(tab => !globals.state.options.auth.authMethodsExclude.includes(tab.value));
});

const tabAuth = ref(availableTabs.value.length ? availableTabs.value[0].value : '');

const loadExternalScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

onMounted(async () => {
	await loadExternalScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js');
});
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
		console.log(error)
		throw new Error
	}

	// COSTIL PLEASE GOD MAKE IT GOOD, FUKEN INPUT COMPONENT RETURN OBJECT NUT NUMBER
	const userCopy = {...auth.state.user};
	// COSTIL PLEASE GOD MAKE IT GOOD, FUKEN INPUT COMPONENT RETURN OBJECT NUT NUMBER

 	await auth.actions.login(userCopy, tabAuth.value)
}

async function onSubmitApple() {
  try {
    window.AppleID.auth.init({
      clientId: 'com.thecommune.app.signin',
      scope: 'email name',
      redirectURI: 'https://thecommunephuket.com/auth/signin',
      usePopup: true,
    });

    let response = await window.AppleID.auth.signIn();

    if (response) {
      console.log(response);
      await auth.actions.login(response, 'apple');
    }

  } catch (error) {
    console.error(error);
    throw new Error('Error during Apple authentication');
  }
}

function redirectTo () {
	if (route.query?.returnUrl) {
		router.push({ 
			path: route.query?.returnUrl,
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

	.input-error {
	  border: 1px solid red;
	  box-shadow: 0 0 3px 0 red;
	}
</style>