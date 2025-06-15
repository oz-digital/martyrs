<template>
	<div class="for-transition w-100">
		<div id="dash" class="pd-medium bg-light">
			{{organization.state.current}}
			<Select 
        :options="[
          {name: 'Dispensary',	value: 'dispensary'}, 
          {name: 'Farm',    		value: 'farm'},
          {name: 'Space',				value: 'space'},
        ]"
        label="Type"
        v-model:select="organization.state.current.types" 
        placeholder="Select type"
        class="
          bg-white
          pd-small
          radius-small
          mn-b-small
          t-black
        "
      />

			<h3 class="mn-b-small">Profile</h3>
			
			<div class="mn-b-semi radius-small">
				<Field 
					v-model:field="organization.state.current.profile.name" 	
					placeholder="Name" 
					class="bg-white pd-small"
				/>

				<Field 
					v-model:field="organization.state.current.profile.description" 		
					placeholder="Description" 
					class="bg-white pd-small"
				/>
			</div>
			
			<Button :submit="onSubmit" :callback="redirectTo" class="mn-b-thin">Create organization</Button>

		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import Field from '@martyrs/src/components/Field/Field.vue';
import Select from '@martyrs/src/components/Select/Select.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Places from '@martyrs/src/modules/organizations/components/sections/Places.vue';
import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import * as organization from '@martyrs/src/modules/organizations/store/organizations.js';
import * as inputsValidation from '@martyrs/src/modules/auth/views/validations/inputs.validation';

const router = useRouter();
const route = useRoute();
const organizationName = ref(null);

async function onSubmit() {
  try {
    await organization.actions.create(organization.state.current, auth.state.user._id)
  } catch (error) {
    console.error(error);
  }
}

function redirectTo () {
  // router.push({ name: 'Organizations'})
}
</script>


<style lang="scss">
  #header {
    // height: 3rem;
  }
</style>

