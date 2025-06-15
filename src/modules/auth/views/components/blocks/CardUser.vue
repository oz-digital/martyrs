<template>
  <div class="flex-v-center flex-nowrap flex">
    <img loading="lazy" 
      v-if="photo" 
      :src="(FILE_SERVER_URL || '') + photo" 
      class="radius-medium aspect-1x1 bg-white object-fit-cover mn-r-thin h-100 w-max" 

      @click.stop="$router.push({
        name: user.type === 'user' ? 'User Profile' : 'Organization', 
        params: {
          _id: user._id
        }
      })" 
    />

    <PlaceholderUserpic
      v-if="!photo"
      class="radius-medium aspect-1x1 mn-r-thin h-100 w-auto"

      @click.stop="$router.push({
        name: 'User Profile', 
        params: {
          _id: user._id || _id
        }
      })" 
    />

    <div>
      <p class="h4">{{ name }}</p>
      <span class="t-transp mn-r-small">{{phone || email}}</span>
    </div>

    <div v-if="action || role" class="mn-l-auto  flex-stretch flex-v-center flex">
      <span 
        v-if="role"
        class="flex-child flex-child-shrink-0 capitalize w-max t-medium radius-big pd-b-nano pd-t-nano pd-r-thin pd-l-thin bg-main"
      >
        {{role}}
      </span>
      <button 
        v-if="action" 
        @click.stop="action.method" 
        class="h-2r w-2r t-white mn-l-thin capitalize t-medium radius-big bg-red"
      >
        <component v-if="action.label.is" :is="action.label.is" v-bind="action.label.props"></component>  

        <template v-else>
          {{action.label}} 
        </template>
      </button>
      <!-- {{`Member since  ${user.createdAt}. Invited by ${user.creator.target}`}} -->
    </div>
 
  </div>
</template>

<script setup>
  import PlaceholderUserpic from '@martyrs/src/modules/icons/placeholders/PlaceholderUserpic.vue'

  const props = defineProps({
    _id: {
      type: String,
      default: null
    },
    user: {
      type: Object,
      required: true
    },
    action: {
      type: Object,
    },
    photo: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: 'No name'
    },
    role: {
      type: String
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    }
  });
</script>