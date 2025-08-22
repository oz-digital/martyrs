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

    <div class="rows-1">
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
          tree: true
        }"
        v-model:sort="sort"
        v-model:items="categories.state.all"
        v-slot="{ 
          items 
        }"
        class="rows-1 gap-thin"
      >
        <Tree 
          v-if="items" 
          :items="categories.state.all" 
          :state="categories.state.all"
          :parent-id="null"
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

  // Функция для сбора затронутых категорий при drag-n-drop
  function collectAffectedCategories(eventData) {
    const result = {
      movedCategory: null,
      affectedCategories: []
    };
    
    console.log('collectAffectedCategories - eventData:', eventData);
    
    // Проверяем, что это объект от Tree компонента с полной информацией
    if (eventData && eventData.movedItem) {
      // Если категория переместилась между уровнями
      if (eventData.movedItem._id) {
        result.movedCategory = {
          _id: eventData.movedItem._id,
          newParent: eventData.parentId // Используем parentId из события (null для корня)
        };
      }
      
      // Собираем все категории текущего уровня с их новым порядком
      const items = eventData.items || [];
      console.log('Level items:', items);
      
      items.forEach((item, index) => {
        result.affectedCategories.push({
          _id: item._id,
          order: index
        });
      });
    } else if (eventData && eventData._id) {
      // Fallback для старого формата (простой объект категории)
      result.movedCategory = {
        _id: eventData._id,
        newParent: eventData.parent || null
      };
      
      // Пытаемся найти категории того же уровня
      const parentId = eventData.parent;
      const sameLevel = parentId 
        ? categories.state.all.find(c => c._id === parentId)?.children || []
        : categories.state.all;
      
      sameLevel.forEach((item, index) => {
        result.affectedCategories.push({
          _id: item._id,
          order: index
        });
      });
    } else {
      // Если нет данных о перемещении, собираем корневые категории
      console.log('No event data, collecting root level categories');
      categories.state.all.forEach((item, index) => {
        result.affectedCategories.push({
          _id: item._id,
          order: index
        });
      });
    }
    
    console.log('collectAffectedCategories - result:', result);
    
    return result;
  }

  // Функция для обновления порядка категорий
  async function updateCategoriesOrder(event) {
    console.log('updateCategoriesOrder called with event:', event);
    
    try {
      const data = collectAffectedCategories(event);
      
      // ОДИН КОНСОЛЬ ЛОГ НА ФРОНТЕНДЕ - ЧТО ОТПРАВЛЯЕМ
      console.log('📤 FRONTEND SENDING:', JSON.stringify(data, null, 2));
      await categories.actions.updateOrder(data);
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
      await categories.actions.delete(category._id);
    }
  }
</script>

<style lang="scss">
</style>