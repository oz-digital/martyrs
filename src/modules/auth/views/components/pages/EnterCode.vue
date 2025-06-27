<template>
	<section class="t-center pd-medium">
		<!-- <img loading="lazy" src="@/assets/icons/message1.png" class="i-extra mn-b-small"> -->

		<h3 class="mn-b-medium">
			{{ t('auth.enterCode.verifyNumberTitle') }}
		</h3>

		<p class="mn-b-big t-transp">{{ t('auth.enterCode.instructions') }}</p>

		<div class="w-100 mn-b-big flex-nowrap flex">
      		<input 
      			type="number" 
      			v-model="state.digits[0]" 
      			ref="firstInput" 
      			maxlength="1" 
      			@input="onInput(0)" 
      			@paste="($event) => onPaste($event, 0)" 
      			@keydown="($event) => onKeyDown($event, 0)" 
      			class="w-100 h1 pd-small t-center bg-light radius-small mn-r-small"
      		>
			<input 
				type="number" 
				v-model="state.digits[1]" 
				maxlength="1" 
				@input="onInput(1)" 
				@paste="($event) => onPaste($event, 1)" 
				@keydown="($event) => onKeyDown($event, 1)" 
				class="w-100 h1 pd-small t-center bg-light radius-small mn-r-small"
			>
			<input 
				type="number" 
				v-model="state.digits[2]" 
				maxlength="1" 
				@input="onInput(2)" 
				@paste="($event) => onPaste($event, 2)" 
				@keydown="($event) => onKeyDown($event, 2)" 
				class="w-100 h1 pd-small t-center bg-light radius-small mn-r-small"
			>
			<input 
				type="number" 
				v-model="state.digits[3]" 
				maxlength="1" 
				@input="onInput(3)" 
				@paste="($event) => onPaste($event, 3)" 
				@keydown="($event) => onKeyDown($event, 3)" 
				class="w-100 h1 pd-small t-center bg-light radius-small"
			>
    	</div>

		<a v-if="resendTimer < 1" @click="sendAgain" class="t-blue">
			{{ t('auth.enterCode.resendCode') }}
		</a>

		<span v-else>
			{{resendTimer}} {{ t('auth.enterCode.secondsResend') }}
		</span>
	</section>
</template>

<script setup>
	// Import components
	import Field from '@martyrs/src/components/Field/Field.vue'
	// Import libs
	import { computed,reactive,ref, onMounted, onBeforeMount, watch } from 'vue'
	import { useRoute,useRouter } from 'vue-router'
	import { useI18n } from 'vue-i18n'
	// Import state
	import * as auth 	from '@martyrs/src/modules/auth/views/store/auth.js'
	import * as twofa 	from '@martyrs/src/modules/auth/views/store/twofa.js'
	import { setError } from '@martyrs/src/modules/globals/views/store/globals.js'
	
	const route = useRoute()
	const router = useRouter()

	// Localization
	// Localization
	const { t } = useI18n({
		useScope: 'global', 
	})
	
	const state = reactive({
	  digits: ['', '', '', ''],
	  error: null,
	});

	watch(
	    () => state.digits[0],
	    (newVal) => {
	        if (newVal && String(newVal).length > 1) {
	            let newValArray = String(newVal).split('');
	            console.log(newValArray);

	            let newDigits = [...state.digits];
	            newValArray.forEach((digit, i) => {
	                console.log(i);
	                console.log(newDigits[i]);
	                console.log(digit);
	                newDigits[i] = digit;
	            });

	            state.digits = newDigits;

	            onInput(3);
	        }
	    }
	);

	const firstInput = ref(null);

	const resendTimer = ref(0);

	async function sendAgain () {
		try {
		  	await twofa.sendCode(
		  		auth.state.user, 
		  		route.query.method, 
		  		route.query.type, 
		  	)

		  	resendTimer.value = 30;

	     	// Start the timer using `setInterval()`
	      	const timer = setInterval(() => {
		        if (resendTimer.value > 0) {
		          // Decrement the timer by 1 second
		          resendTimer.value -= 1;
		        } else {
		          // Stop the timer when it reaches 0 seconds
		          clearInterval(timer);
		        }
		     }, 1000);
	  } catch (error) {
			setError({ response: {data: { errorCode: "CODE_NOT_SENT"}}})
		}
	}


	const onKeyDown = (event, index) => {
	    if (event.key === "Backspace" && (state.digits[index] === null || state.digits[index] === undefined || state.digits[index] === '')) {
	        event.preventDefault();

	        const inputs = document.querySelectorAll('input');
	        const prevInput = index > 0 ? inputs[index - 1] : null;

	        if (prevInput) {
	            prevInput.focus();
	            prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
	        }
	    }
	};

	// const onPaste = (event, index) => {
	//   event.preventDefault();
	//   const pastedData = event.clipboardData.getData('text/plain');
	  
	//   // Проверим, что вставленный текст состоит только из 4 цифр
	//   if (/^\d{4}$/.test(pastedData)) {
	//     for (let i = 0; i < 4; i++) {
	//       state.digits[index + i] = pastedData[i];
	//     }
	//     onInput(index + 3); // Вызываем обработчик onInput для последнего инпута, чтобы обработать логику ввода
	//   } else {
	//    	setError({ response: {data: { errorCode: "INPUT_ERROR"}}})
	//   }
	// };

	const onInput = (index) => {
	    const inputs = document.querySelectorAll('input');
	    const nextInput = inputs[index + 1];
	    const prevInput = index > 0 ? inputs[index - 1] : null;

	    // Переход на следующий инпут
	    if (state.digits[index] !== '' && state.digits[index] !== null && state.digits[index] !== undefined && index < 4) {
	        if (index < 3) nextInput.focus();
	        else firstInput.value.focus();
	    }

	    // Переход на предыдущий инпут при удалении
	    if ((state.digits[index] === null || state.digits[index] === undefined || state.digits[index] === '') && index > 0) {
	        prevInput.focus();
	    }

	    // Проверка введенного кода
	    if (state.digits.every(digit => digit !== '')) {
	        const enteredCode = state.digits.join('');
	        const correctCode = twofa.state.code.code.toString();

	        if (enteredCode === correctCode) {
	            twofa.state.code.isValid = true;

	            router.push({
	                path: '/auth/enter-password',
	                query: { type: twofa.state.code.type, method: route.query.method, returnUrl: route.query.returnUrl }
	            });

	        } else {
	            setError({ response: {data: { errorCode: "WRONG_CODE"}}})
	            firstInput.value.focus()
	            state.digits = ['', '', '', ''];
	        }
	    }
	};
</script>