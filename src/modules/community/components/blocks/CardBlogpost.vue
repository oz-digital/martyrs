<template>
	<article 
		class="pos-relative flex-column flex o-hidden"
	>
		<CardHeader 
	    :class="{
	    	'mn-b-medium pd-medium': type !== 'short',
	    	'flex-child-order-last flex-child mn-l-small': type === 'short',
	    }"
	    :entity="blogpost"
	    :entityType="'blogpost'"
	    :user="user"
	    :owner="blogpost.owner" 
    	:creator="blogpost.creator"
    	:date="blogpost.createdAt"
    	:actions="user && user === blogpost.creator.target._id ? [
        { to: { name: 'Edit BlogPost', params: {url: blogpost.url } }, label: 'Edit' }
       ]: null"
		/>

	
		<section
			class="pd-t-zero pd-b-zero pd-medium"
		>
			
			<div v-if="type !== 'blogpostPage'" class="cursor-pointer mn-b-medium flex-nowrap flex w-100">

				<Text 
					v-if="!hideTitle"
				 	:text="blogpost.name || ''" 
				 	:maxLen="80" 
				 	class="h3 d-block"
				 	@click="router.push({
						name: 'BlogPost', 
						params: { 
							url: blogpost.url 
						}
					})"
				/>

				<div 
					v-if="blogpost.status === 'draft'" 
					class="pd-micro t-white uppercase t-semi p-small flex-center flex pd-r-small pd-l-small mn-l-thin w-min bg-second radius-extra"
				>
					{{blogpost.status}}
				</div>
				
			</div>
			
			<p 
				v-if="firstText && firstText.content && type !== 'blogpostPage' && !hideDescription" 
				class='mn-b-medium t-transp p-semi'
			>
				{{firstText.content.slice(0,120)}}...
			</p>

			<h3 
				v-if="type === 'blogpostPage' && !hideTitle" 
				class="mn-b-medium h2"
			>
				{{blogpost.name}}
			</h3>

			<slot></slot>

			<!-- <Chips 
      	v-if="type !== 'short' && blogpost.tags?.length > 0" 
      	:chips="blogpost.tags"
     	/> -->

		</section>

			<!-- <Image :prop="{content:firstImage.content}" class="h-100"/> -->

		<template
			v-if="firstImage && firstImage.content && type !== 'blogpostPage'"
		>
			<img loading="lazy" 
				:src="(FILE_SERVER_URL || '') + firstImage.content" 
				alt="Blog post image" 
				class="mn-b-medium object-fit-cover w-100 h-min-10r  h-100"
			/>
		</template>

		<template
			v-if="!firstImage?.content && firstVideo && firstVideo.content && type !== 'blogpostPage'"
		>
			<!-- <div class="flex-center flex"> -->
	      <video controls class="mn-b-medium object-fit-fit bg-black w-100 h-max-20r">
	        <source :src="firstVideo.content" type="video/mp4">
	        Your browser does not support the video tag.
	      </video>
	    <!-- </div> -->
		</template>

		
		<FooterBlogpost 
			class="pd-t-zero pd-medium" 
			:blogpost="blogpost" :user="user"
		/>
	
	</article>

</template>


<script setup="props">
	import CardHeader  from '@martyrs/src/modules/globals/views/components/blocks/CardHeader.vue'
	import FooterBlogpost  from '@martyrs/src/modules/community/components/blocks/FooterBlogpost.vue'	

	import Image  from '@martyrs/src/modules/constructor/components/elements/Image.vue';

  import Text     from '@martyrs/src/components/Text/Text.vue'
	import Chips  from '@martyrs/src/components/Chips/Chips.vue'

	import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue'

	import { computed } from 'vue'

	import { useRouter } from 'vue-router'

	const router = useRouter()

	const props = defineProps({
		blogpost: {
			type: Object,
		},
		user: {
			type: String,
		},
		type: {
			type: String,
		},
		hideDescription: {
			type: Boolean,
			default: false
		},
		hideTitle: {
			type: Boolean,
			default: false
		}
	})

  const firstImage = computed(() => {
	  return props.blogpost.content.find(block => block.type === 'ImageUpload');
	});

	const firstVideo = computed(() => {
	  return props.blogpost.content.find(block => block.type === 'Video');
	});

	const firstText = computed(() => {
	  return props.blogpost.content.find(block => 
	    block.type === 'Textarea' && block.class !== 'h2'
	  );
	});

</script>

<style lang="scss">
</style>


