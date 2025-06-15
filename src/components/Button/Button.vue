<script setup>
	import { ref } from 'vue'

	import Loader from '@martyrs/src/components/Loader/Loader.vue'

	const props = defineProps({
		submit: {
			type: Function,
			default: async () => { console.log('Button click.') }
		},
		text: {
			type: Object,
			default: (textComponent) => {
				return textComponent = {
					...textComponent.text,
					success: '✔',
					error: '✖'
				}
			}
		},
		counter: {
	    type: Object
	  },
		callback: {
			type: Function,
			default: async () => { console.log('Button callback.') }
		},
		callbackDelay: {
			type: Number,
			default: 750
		},
		showSucces: {
			type: Boolean,
			default: true
		},
		showLoader: {
			type: Boolean,
			default: true
		},
		validation: {
			type: Boolean,
			default: false
		},
	})	

	const emits = defineEmits(['error'])

	const button = ref(null);
	const error = ref(null);
	const loading = ref(false);
	const finished = ref(false);

	async function Submit() {
			console.log('click')
			
	    button.value.style['pointer-events'] = 'none';
	    error.value = null;
	    loading.value = true;

	    // Функция для сброса состояния кнопки.
	    const resetButton = () => {
        if (button.value) {
          // button.value.classList.replace('bg-second', 'bg-main');
          button.value.style.pointerEvents = 'auto';
          loading.value = false;
          finished.value = false;
          error.value = null;
        }
	    };

	    try {
        await props.submit();

        button.value.classList.replace('bg-main', 'bg-second');

        loading.value = false;

        // Используем функцию сброса состояния кнопки здесь.
        if (props.showSucces) { 
					finished.value = true;
          setTimeout(resetButton, 500);
        } else {
          resetButton();
        }

        // Если есть callback, мы также установим таймер для его вызова.
        if (props.callback) setTimeout(() => props.callback(), props.callbackDelay);

	    } catch (err) {
    		emits('error',err)
        // Если возникла ошибка, мы изменяем стили и устанавливаем сообщение об ошибке.
        button.value.classList.replace('bg-main', 'bg-fourth-nano');
        error.value = props.error;
        
        // После задержки снова сбрасываем состояние кнопки.
        setTimeout(() => {
          resetButton();
          // Так как класс кнопки был изменен, вернем его в исходное состояние.
          button.value.classList.replace('bg-fourth-nano', 'bg-main');
        }, 1330);
	    }
	}

</script>

<template>
	<button @click.stop="Submit" :disabled="validation" ref="button" class="button">
		<transition name="FromTop" >
			<!-- Slot -->
			<template v-if="!loading && !error && !finished || !showLoader"><slot></slot></template>
			<!-- Loading Circle Animation -->
			<template v-else-if="loading && !error && showLoader"><Loader  class="pos-relative pos-t-0 pos-l-0 loading"/></template>
			<!-- <Loader v-else-if="loading && !error && showLoader"/> -->
			<!-- Success -->
			<span v-else-if="finished && showSucces" class="t-semi t-center w-100  loading t-black">{{text.success}}</span>
			<!-- Error if not finished -->
			<span v-else-if="error" class="t-center w-100 error">{{ error }}</span>
		</transition>
		<!-- Counter -->
		<div v-if="counter" class="button-counter flex-center"><span>{{counter}}</span></div> 

	</button> 
</template>


<style lang="scss">
	.FromTop-enter-active,
	.FromTop-leave-active {
		transform: translateY(0);
		opacity: 1;
		transition: all 0.5s ease; 
		
	}
	.FromTop-enter-from,
	.FromTop-leave-to {
		position: absolute;
		transform: translateY(-1rem);
		opacity: 0;
		transition: all 0.5s ease;
	}

	button[disabled] {
		opacity: 0.75  !important;
	 	pointer-events: none  !important;
	 	cursor: default  !important;
	 	color: rgba(var(--black), 0.5)  !important;
		background: rgba(var(--grey), 1) !important; 
	}

	a.button {
			text-box: trim-both cap alphabetic;
	}

	.button {
		display: flex;

		padding: 0.5rem;
		border-radius: 3rem;
		text-box: trim-both cap alphabetic;

		transform: scale(1);
		opacity: 1;

		align-items: center;
		justify-content: center;
		
		color: black;
		text-align: center;
		text-transform: uppercase;
		font-size: 1rem;
		letter-spacing: 5%;

		transition: all 0.33s ease;
	 
		&:hover {
			cursor: pointer;
			opacity: 0.9;
		}

		&:active {
			transform: scale(0.95);
		}

		&-small {
			padding: 0.75rem;
			border-radius: 0.5rem;
			height: fit-content;
		}

		.button-counter {
			position: absolute;
			right: -8px;
	    bottom: -8px;
	    background: yellow;
	    height: 16px;
	    border-radius: 16px;
	    width: 16px;
	    font-weight: 500;
	    text-align: center;
	    line-height: 16px;
	    font-size: 10px;
		}
	}
</style>