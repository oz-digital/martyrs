<template>
	<div class="for-transition w-100">
		<div id="dash" class="pd-medium bg-light">
				
			<section class="radius-medium pd-big t-white bg-second">
				<ul class="flex-nowrap flex">
					<li :class="{'t-transp': route.path !== '/app/organization/create/details'}" class="w-100 mn-r-medium">
						<span class="h1 d-block">1</span>
						<span>Fill the data</span>
					</li>
					<li :class="{'t-transp': route.path !== '/app/organization/create/documents'}" class="w-100  mn-r-medium">
						<span class="h1 d-block">2</span>
						<span>Add locations</span>
					</li>
					<li :class="{'t-transp': route.path !== '/app/organization/create/people'}" class="w-100">
						<span class="h1 d-block">3</span>
						<span>Invite people</span>
					</li>
				</ul>
			</section>
		</div>

			<router-view v-slot="{ Component, route }"  class="w-100 bg-light">
				<transition  name="slide" mode="out-in">
					<component :is="Component" :key="route.path"/>
				</transition>
			</router-view>

	<!-- 		<div class="pd-medium flex-nowrap flex">
      <button class="bg-white mn-r-small button w-100">Сохранить</button>
      <button class="bg-white button w-100">Сбросить</button>
	    </div> -->
	</div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';

import Tab from '@martyrs/src/components/Tab/Tab.vue';
import Field from '@martyrs/src/components/Field/Field.vue';
import Select from '@martyrs/src/components/Select/Select.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Places from '@martyrs/src/modules/organizations/components/sections/Places.vue';

import * as auth from '@martyrs/src/modules/auth/views/store/auth.js';
import * as organization from '@martyrs/src/modules/organizations/store/organizations.js';

const router = useRouter();
const route = useRoute();

async function onSubmit() {
  // await Store.auth.login(Store.auth.state.user)
}

function redirectTo() {
  // router.push({ name: 'Dashboard'})
  // Store.auth.toggleSignInPopup()
}
</script>

<style lang="scss">
  #header {
    // height: 3rem;
  }
</style>
