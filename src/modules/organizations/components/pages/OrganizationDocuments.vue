<template>
  <div class="documents pd-medium bg-light">
    <h3 class="mn-b-small">Загрузите документы</h3>
    
    <div class="mn-b-big cols-4">
	    <div v-for="(doc, index) in documents" :key="index" @click="openPopup(index)">
	      <div class="pd-medium bg-white radius-small">
	      	<h3 class="mn-b-small">{{ doc.name }}</h3>
	      	<p class="t-semi t-transp radius-small">{{ doc.status }}</p>
	      </div>
	    </div>
	  </div>

	   <Popup title="Добавить документ" @close-popup="closePopup" :isPopupOpen="showPopup">

      <div v-for="input in documents[currentIndex].inputs" :key="input.name">
        <Field
        	v-model:field="input.value" 		
        	:label="input.name"
          :_id="input.name" 
          :placeholder="input.name" 
          class="w-100"
        />
      </div>
      <button @click="submitData" class="w-100 mn-b-small button ">Отправить на верификацию</button>

  		</Popup>

  		<Button :submit="onSubmit" :callback="redirectTo" class="mn-b-thin">Перейти к людям</Button>

  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router'

import Field    from '@martyrs/src/components/Field/Field.vue'
import Button   from '@martyrs/src/components/Button/Button.vue'
import Popup    from '@martyrs/src/components/Popup/Popup.vue'
// const props = defineProps({
//   documents: {
//     type: Array,
//     required: true,
//   },
// });


const router 	= useRouter()
const route 	= useRoute()

let documents = [{
	name: 'Паспорт',
	status: 'Не добавлен',
	inputs: [{
		type: 'text',
		name: 'Номер и серия'
	},{
		type: 'text',
		name: 'Место выдачи'
	},{
		type: 'text',
		name: 'Дата выдачи'
	}]
},{
	name: 'ИНН',
	status: 'Не добавлен',
	inputs: [{
		type: 'text',
		name: 'Дата регистрации'
	}]
},{
	name: 'СНИЛС',
	status: 'Не добавлен',
	inputs: [{
		type: 'text',
		name: 'Дата регистрации'
	}]
},{
	name: 'Военный билет',
	status: 'Не добавлен',
	inputs: [{
		type: 'text',
		name: 'Дата регистрации'
	}]
}]

const showPopup = ref(false);
const currentIndex = ref(null);

const openPopup = (index) => {
  currentIndex.value = index;
  showPopup.value = true;
};

const closePopup = () => {
  showPopup.value = false;
};

const handleFileUpload = (e) => {
  const files = e.target.files;
  // Handle file uploads as needed
};

const submitData = () => {
  // Handle submission of the data and update the document status
  closePopup();
};

watchEffect(() => {
  // Do any necessary updates when the documents prop changes
});

async function onSubmit() {
  // await Store.auth.login(Store.auth.state.user)
}

function redirectTo () {
	router.push({ name: 'Create Organization People'})
	// Store.auth.toggleSignInPopup()
}
</script>

<style scoped>
.documents {
  display: flex;
  flex-direction: column;
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 1px solid #ccc;
  padding: 20px;
  z-index: 10;
}
</style>