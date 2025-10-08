<template>
  <Block
    title="Parameters"
    placeholder="No parameters added yet"
    :actions="[{
      label: '+',
      function: () => openAttributePopup()
    }]"
  >
    <div v-if="attributes.length > 0" class="cols-1 gap-thin">
      <div
        v-for="(attribute, index) in attributes"
        :key="index"
        class="bg-white radius-small pd-small flex-nowrap flex-v-center flex gap-thin"
      >
        <div class="w-100">
          <p class="p-regular mn-b-thin t-medium d-block">{{ attribute.name || 'Unnamed parameter' }}</p>
          <p class="t-medium t-transp">{{ attribute.value || 'No value' }}</p>
        </div>
        
        <div class="flex gap-thin">
          <div @click="() => openAttributePopup(index)" class="radius-small pd-small flex-center flex aspect-1x1 bg-light cursor-pointer hover-scale-1">
            <IconEdit
              class="i-medium"
            />
          </div>
          <div @click="() => attributes.splice(index, 1)" class="radius-small pd-small flex-center flex aspect-1x1 bg-red cursor-pointer hover-scale-1">
            <IconDelete
              class="i-medium"
            />
          </div>
        </div>
      </div>
    </div>
  </Block>

  <Popup
    title="Edit Parameter"
    @close-popup="closeAttributePopup"
    :isPopupOpen="isAttributePopupOpen"
    class="bg-white w-max-40r radius-medium pd-medium"
  >
    <div class="cols-1 gap-thin">
      <Field
        v-model:field="currentAttribute.name"
        label="Name"
        placeholder="Parameter Name"
        class="w-100 bg-light radius-small pd-small"
      />

      <Field
        v-model:field="currentAttribute.value"
        label="Value"
        placeholder="Parameter Value"
        class="w-100 bg-light radius-small pd-small"
      />

      <div class="flex gap-thin mn-t-medium">
        <Button
          :showSuccess="false"
          :showLoader="false"
          class="bg-red t-white w-100"
          @click="closeAttributePopup"
        >
          Cancel
        </Button>
        <Button
          class="bg-main w-100"
          @click="saveAttribute"
        >
          Save
        </Button>
      </div>
    </div>
  </Popup>
</template>

<script setup>
import { ref, reactive, defineModel } from 'vue';
import Block from '@martyrs/src/components/Block/Block.vue';
import Field from '@martyrs/src/components/Field/Field.vue';
import Button from '@martyrs/src/components/Button/Button.vue';
import Popup from '@martyrs/src/components/Popup/Popup.vue';
import IconEdit from '@martyrs/src/modules/icons/navigation/IconEdit.vue';
import IconDelete from '@martyrs/src/modules/icons/navigation/IconDelete.vue';

// Используем defineModel для работы с v-model в родительском компоненте
const attributes = defineModel('attributes');

// Локальное состояние
const isAttributePopupOpen = ref(false);
const editingAttributeIndex = ref(null);
const currentAttribute = reactive({
  name: '',
  value: ''
});

// Функция открытия попапа добавления/редактирования
function openAttributePopup(index) {
  // Если передан индекс, это редактирование существующего атрибута
  if (index !== undefined) {
    editingAttributeIndex.value = index;
    const attribute = attributes.value[index];
    
    // Копируем данные в currentAttribute
    Object.assign(currentAttribute, {
      name: attribute.name || '',
      value: attribute.value || ''
    });
  } else {
    // Сброс данных при создании нового атрибута
    editingAttributeIndex.value = null;
    Object.assign(currentAttribute, {
      name: '',
      value: ''
    });
  }
  
  isAttributePopupOpen.value = true;
}

// Закрытие попапа
function closeAttributePopup() {
  isAttributePopupOpen.value = false;
  editingAttributeIndex.value = null;
}

// Сохранение атрибута
function saveAttribute() {
  // Проверка на основные поля
  if (!currentAttribute.name) {
    alert('Parameter name is required');
    return;
  }

  // Создаем копию текущего атрибута для сохранения
  const attributeToSave = {
    name: currentAttribute.name,
    value: currentAttribute.value
  };

  // Если редактируем существующий атрибут
  if (editingAttributeIndex.value !== null) {
    // Обновляем существующий атрибут
    attributes.value.splice(editingAttributeIndex.value, 1, attributeToSave);
  } else {
    // Добавляем новый атрибут
    attributes.value.push(attributeToSave);
  }

  // Закрываем попап
  closeAttributePopup();
}
</script>