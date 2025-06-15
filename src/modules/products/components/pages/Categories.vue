<template>
  <div class="pd-thin bg-white">
    <Block v-if="!MOBILE_APP" 
      class="radius-medium mn-b-thin mobile:flex-wrap flex-nowrap flex-v-center flex"
    >
      <h2 class="mn-r-auto">
        Categories
      </h2>

      <router-link 
        :to="{
          name: 'Category Add', 
          params: { 
            _id: $route.params._id
          } 
        }"
        class="uppercase t-medium pd-small radius-medium bg-white nav-link"
      >
        Add New
      </router-link>
    </Block>

     <Feed
        :search="true"
        :showLoadMore="false"
        :states="{
          empty: {
            title: 'No Products Found',
            description: 'Currently, there are no products available.'
          }
        }"
        :store="{
          read: (options) => categories.actions.read(options),
          state: categories.state
        }"
        :options="{
          user: auth.state.user._id,
          rootOnly: true,
          excludeChildren: false
        }"
        v-model:sort="sort"
        v-model:items="categories.state.all"
        v-slot="{ 
          items 
        }"
        class="cols-1 pos-relative w-100 rows-1 gap-thin"
      >
        <Tree 
          v-if="items" 
          :items="categories.state.all" 
          :state="categories.state.all" 
          @update="updateCategoriesOrder" 
          v-slot="{ item }"
        >
          <CardCategory 
            :category="item" 
            @delete="deleteCategory" 
          />
        </Tree>
      </Feed>
  </div>
</template>

<script setup>
  import { onMounted, onUnmounted, computed, ref,reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import * as globals from '@martyrs/src/modules/globals/views/store/globals.js';
  import * as auth from '@martyrs/src/modules/auth/views/store/auth.js'; 
  import * as categories from '@martyrs/src/modules/products/store/categories.js'; 

  const route = useRoute();
  const router = useRouter();

  import Button from "@martyrs/src/components/Button/Button.vue";
  import Block from '@martyrs/src/components/Block/Block.vue';
  import Feed from '@martyrs/src/components/Feed/Feed.vue'
  import Tree from "@martyrs/src/components/Tree/Tree.vue";
  
  import CardCategory from '@martyrs/src/modules/products/components/blocks/CardCategory.vue';

  import IconPlus from '@martyrs/src/modules/icons/navigation/IconPlus.vue'

  let search = ref(null)

  let sort = reactive({
    param: 'order',
    order: 'asc',
    options: [{
      label: 'Order',
      value: 'order'
    },{
      label: 'Name',
      value: 'name'
    },{
      label: 'Date',
      value: 'createdAt'
    }]
  })

  globals.state.navigation_bar.actions = [{
    component: IconPlus,
    props: {
      fill: "rgb(var(--main))" 
    },
    condition: () => auth.state.user && auth.state.user._id,
    action: () => route.params._id ? router.push({ name: 'Category Add', params: { _id: route.params._id} }) : router.push({ name: 'Category Add' })
  }],

  onUnmounted(() => {
    globals.state.navigation_bar.actions = [];
  });

  onMounted(async () => {
    
  });

  // Функция для преобразования иерархического дерева категорий в плоский массив
  function flattenCategoryTree(categories) {
    let flatCategories = [];
    
    function flatten(category) {
      const { children, ...categoryWithoutChildren } = category;
      flatCategories.push(categoryWithoutChildren);
      
      if (children && Array.isArray(children)) {
        children.forEach(child => flatten(child));
      }
    }
    
    categories.forEach(category => flatten(category));
    return flatCategories;
  }


  // Функция для обновления порядка категорий
  async function updateCategoriesOrder(updatedCategories) {
    alert('helo')
    try {
      // Преобразуем категории в плоский массив
      const flattenedCategories = flattenCategoryTree(categories.state.all);
      
      console.log(flattenedCategories)
      console.log( categories.state.all)
      await categories.actions.updateOrder(flattenedCategories);
        
      console.log('Categories order updated successfully');
    } catch (error) {
      console.error('Error updating categories order:', error);
      throw error;
    }
  }

  async function deleteCategory(category) {
    // Запрашиваем подтверждение у пользователя
    const isConfirmed = confirm(`Are you sure you want to delete the category "${category.name}"?`);
    
    // Если пользователь подтвердил удаление, продолжаем процесс
    if (isConfirmed) {
      await categories.actions.delete(category.url);
    } else {
      alert('Category deletion cancelled'); 
    }
  }
</script>

<style lang="scss">
</style>