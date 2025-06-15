<template>
	<section class="t-left pd-medium">
		<!-- Header -->
		<h3 class="mn-b-small">You have been invited to the organization</h3>
		<p class="mn-b-semi t-transp">Please provide a password to complete the registration.</p>
		
		<!-- Form -->
		<div  class="mn-b-semi radius-small o-hidden">
			<Field 
				v-model:field="auth.state.user.password"
				type="password" 	
				:validation="passswordValidation" 
				label="Password"		
				placeholder="******" 
				class="mn-b-thin bg-light pd-medium radius-small" 
			/>
			<Field 
				v-model:field="auth.state.user.passwordRepeat"
				type="password" 	
				label="Repeat Password"		
				placeholder="******" 
				class="bg-light pd-medium radius-small" 
				
			/>
		</div>
		<!-- Button -->
		<Button 
			:submit="onSubmit" 
			:callback="redirectTo" 
			class="w-100 bg-main mn-b-big">
			<span>Join</span>
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
// Import state
import * as auth 		from '@martyrs/src/modules/auth/views/store/auth.js'
import * as invites from '@martyrs/src/modules/organizations/store/invites.js'
// Import validation
import * as inputsValidation from '@martyrs/src/modules/auth/views/validations/inputs.validation'
const passswordValidation = ref(null)
// Accessing router
const route = useRoute()
const router = useRouter()
// Lifecycles
onMounted(async () => {
	await invites.actions.readOne(route.query.inviteCode)
})
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
	try {
		await auth.actions.signup(auth.state.user, route.query.type, route.query.inviteCode)
	} catch (err) {
		console.log(err)
	}
}

function redirectTo () {
	router.push({ name: 'User Profile', 
		params: { 
			_id: auth.state.user._id 
		},
		query: { 
			afterAuth: 'true' 
		}})
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
