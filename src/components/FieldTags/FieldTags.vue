<template>
  <div
    class="vue-tags-input pos-relative"
    :class="[{ 'ti-disabled': disabled }, { 'ti-focus': focused }, $attrs.class]"
    :style="$attrs.style"
  >
    <div class="ti-input">
      <ul v-if="tagsCopy.length || !disabled" class="ti-tags">
        <li
          v-for="(tag, index) in tagsCopy"
          :key="`tag-${index}-${tag.text}`"
          :style="tag.style"
          :class="[
            { 'ti-editing': tagsEditStatus[index] },
            tag.tiClasses,
            tag.classes,
            { 'ti-deletion-mark': isMarked(index) }
          ]"
          tabindex="0"
          class="ti-tag t-medium"
          @click="emit('tag-clicked', { tag, index })"
        >
          <div class="ti-content">
            <div
              v-if="$slots['tag-left']"
              class="ti-tag-left"
            >
              <slot
                name="tag-left"
                :tag="tag"
                :index="index"
                :edit="tagsEditStatus[index]"
                :perform-save-edit="performSaveTag"
                :perform-delete="performDeleteTag"
                :perform-cancel-edit="cancelEdit"
                :perform-open-edit="performEditTag"
                :deletion-mark="isMarked(index)"
              />
            </div>
            <div :ref="el => setTagCenter(el, index)" class="ti-tag-center">
              <span
                v-if="!$slots['tag-center']"
                :class="{ 'ti-hidden': tagsEditStatus[index] }"
                @click="performEditTag(index)"
              >{{ tag.text }}</span>
              <tag-input
                v-if="!$slots['tag-center']"
                :scope="{
                  edit: tagsEditStatus[index],
                  maxlength,
                  tag,
                  index,
                  validateTag: createChangedTag,
                  performCancelEdit: cancelEdit,
                  performSaveEdit: performSaveTag,
                }"
              />
              <slot
                name="tag-center"
                :tag="tag"
                :index="index"
                :maxlength="maxlength"
                :edit="tagsEditStatus[index]"
                :perform-save-edit="performSaveTag"
                :perform-delete="performDeleteTag"
                :perform-cancel-edit="cancelEdit"
                :validate-tag="createChangedTag"
                :perform-open-edit="performEditTag"
                :deletion-mark="isMarked(index)"
              />
            </div>
            <div
              v-if="$slots['tag-right']"
              class="ti-tag-right"
            >
              <slot
                name="tag-right"
                :tag="tag"
                :index="index"
                :edit="tagsEditStatus[index]"
                :perform-save-edit="performSaveTag"
                :perform-delete="performDeleteTag"
                :perform-cancel-edit="cancelEdit"
                :perform-open-edit="performEditTag"
                :deletion-mark="isMarked(index)"
              />
            </div>
          </div>
          <div class="ti-actions">
            <i
              v-if="!$slots['tag-actions']"
              v-show="tagsEditStatus[index]"
              class="ti-icon-undo"
              @click.stop="cancelEdit(index)"
            />
            <i
              v-if="!$slots['tag-actions']"
              v-show="!tagsEditStatus[index]"
              class="ti-icon-close"
              @click.stop="performDeleteTag(index)"
            />
            <slot
              v-if="$slots['tag-actions']"
              name="tag-actions"
              :tag="tag"
              :index="index"
              :edit="tagsEditStatus[index]"
              :perform-save-edit="performSaveTag"
              :perform-delete="performDeleteTag"
              :perform-cancel-edit="cancelEdit"
              :perform-open-edit="performEditTag"
              :deletion-mark="isMarked(index)"
            />
          </div>
        </li>
        <li class="ti-new-tag-input-wrapper">
          <input
            ref="newTagInputRef"
            :class="[createClasses(newTag, tags, validation, isDuplicate)]"
            :placeholder="placeholder"
            :value="newTag"
            :maxlength="maxlength"
            :disabled="disabled"
            type="text"
            size="1"
            class="ti-new-tag-input"
            @keydown="handleKeyDown"
            @paste="addTagsFromPaste"
            @keydown.delete="invokeDelete"
            @keydown.tab="performBlur"
            @keydown.up.prevent="selectItem('before')"
            @keydown.down.prevent="selectItem('after')"
            @input="updateNewTag"
            @focus="focused = true"
            @click="!addOnlyFromAutocomplete && (selectedItem = null)"
          >
        </li>
      </ul>
    </div>
    <slot name="between-elements" />
    <div
      v-if="autocompleteOpen"
      class="ti-autocomplete"
      :class="$attrs.class"
      @mouseleave="selectedItem = null"
    >
      <slot name="autocomplete-header" />
      <ul>
        <li
          v-for="(item, index) in filteredAutocompleteItems"
          :key="`autocomplete-${index}-${item.text}`"
          :style="item.style"
          :class="[
            item.tiClasses,
            item.classes,
            { 'ti-selected-item': isSelected(index) }
          ]"
          class="ti-item"
          @mouseenter="!disabled && (selectedItem = index)"
        >
          <div
            v-if="!$slots['autocomplete-item']"
            @click="performAddTags(item, undefined, 'autocomplete')"
          >
            {{ item.text }}
          </div>
          <slot
            v-else
            name="autocomplete-item"
            :item="item"
            :index="index"
            :perform-add="item => performAddTags(item, undefined, 'autocomplete')"
            :selected="isSelected(index)"
          />
        </li>
      </ul>
      <slot name="autocomplete-footer" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, shallowRef, toRef } from 'vue';
import equal from 'fast-deep-equal';
import { clone, createClasses, createTag, createTags } from './create-tags.js';
import TagInput from './tag-input.vue';
import props from './vue-tags-input.props.js';

// Props
const propsObj = defineProps(props);

// Emits
const emit = defineEmits([
  'adding-duplicate',
  'before-adding-tag',
  'before-deleting-tag',
  'before-editing-tag',
  'before-saving-tag',
  'max-tags-reached',
  'saving-duplicate',
  'tags-changed',
  'tag-clicked',
  'update:modelValue',
  'update:tags',
]);

// State
const tagCenterRefs = ref(new Map());
const newTag = ref(propsObj.modelValue || '');
const tagsCopy = shallowRef([]);
const tagsEditStatus = ref([]);
const deletionMark = ref(null);
const deletionMarkTimer = ref(null);
const selectedItem = ref(null);
const focused = ref(false);
const newTagInputRef = ref(null);

// Computed
const autocompleteOpen = computed(() => {
  if (propsObj.autocompleteAlwaysOpen) return true;
  return newTag.value !== null && 
         newTag.value.length >= propsObj.autocompleteMinLength && 
         filteredAutocompleteItems.value.length > 0 && 
         focused.value;
});

const filteredAutocompleteItems = computed(() => {
  const items = propsObj.autocompleteItems.map(i => 
    createTag(i, propsObj.tags, propsObj.validation, propsObj.isDuplicate)
  );

  if (!propsObj.autocompleteFilterDuplicates) return items;
  return items.filter(duplicateFilter);
});

// Methods
const getSelectedIndex = (method) => {
  const items = filteredAutocompleteItems.value;
  const current = selectedItem.value;
  const lastItem = items.length - 1;
  
  if (items.length === 0) return;
  if (current === null) return 0;
  if (method === 'before' && current === 0) return lastItem;
  if (method === 'after' && current === lastItem) return 0;
  return method === 'after' ? current + 1 : current - 1;
};

const selectDefaultItem = () => {
  selectedItem.value = propsObj.addOnlyFromAutocomplete && filteredAutocompleteItems.value.length > 0 ? 0 : null;
};

const selectItem = (method) => {
  selectedItem.value = getSelectedIndex(method);
};

const isSelected = (index) => selectedItem.value === index;
const isMarked = (index) => deletionMark.value === index;

const setTagCenter = (el, index) => {
  if (el) {
    tagCenterRefs.value.set(index, el);
  } else {
    tagCenterRefs.value.delete(index);
  }
};

const invokeDelete = () => {
  if (!propsObj.deleteOnBackspace || newTag.value.length > 0) return;
  
  const lastIndex = tagsCopy.value.length - 1;
  if (deletionMark.value === null) {
    clearTimeout(deletionMarkTimer.value);
    deletionMarkTimer.value = setTimeout(() => (deletionMark.value = null), 1000);
    deletionMark.value = lastIndex;
  } else {
    performDeleteTag(lastIndex);
  }
};

const addTagsFromPaste = () => {
  if (!propsObj.addFromPaste) return;
  setTimeout(() => performAddTags(newTag.value), 10);
};

const performEditTag = (index) => {
  if (!propsObj.allowEditTags) return;
  
  if (!propsObj.onBeforeEditingTag) {
    editTag(index);
  } else {
    emit('before-editing-tag', {
      index,
      tag: tagsCopy.value[index],
      editTag: () => editTag(index),
    });
  }
};

const editTag = (index) => {
  if (!propsObj.allowEditTags) return;
  toggleEditMode(index);
  focus(index);
};

const toggleEditMode = (index) => {
  if (!propsObj.allowEditTags || propsObj.disabled) return;
  tagsEditStatus.value[index] = !tagsEditStatus.value[index];
};

const createChangedTag = (index, event) => {
  const tag = tagsCopy.value[index];
  tag.text = event ? event.target.value : tagsCopy.value[index].text;
  
  const newTags = [...tagsCopy.value];
  newTags[index] = createTag(tag, tagsCopy.value, propsObj.validation, propsObj.isDuplicate);
  tagsCopy.value = newTags;
};

const focus = (index) => {
  nextTick(() => {
    const el = tagCenterRefs.value.get(index)?.querySelector('input.ti-tag-input');
    if (el) el.focus();
  });
};

const quote = (regex) => regex.replace(/([()[{*+.$^\\|?])/g, '\\$1');

const cancelEdit = (index) => {
  if (!propsObj.tags[index]) return;
  
  const newTags = [...tagsCopy.value];
  newTags[index] = clone(createTag(propsObj.tags[index], propsObj.tags, propsObj.validation, propsObj.isDuplicate));
  tagsCopy.value = newTags;
  tagsEditStatus.value[index] = false;
};

const hasForbiddingAddRule = (tiClasses) => {
  return tiClasses.some(type => {
    const rule = propsObj.validation.find(rule => type === rule.classes);
    return rule ? rule.disableAdd : false;
  });
};

const createTagTexts = (string) => {
  const regex = new RegExp(propsObj.separators.map(s => quote(s)).join('|'));
  return string.split(regex).map(text => ({ text }));
};

const performDeleteTag = (index) => {
  if (!propsObj.onBeforeDeletingTag) {
    deleteTag(index);
  } else {
    emit('before-deleting-tag', {
      index,
      tag: tagsCopy.value[index],
      deleteTag: () => deleteTag(index),
    });
  }
};

const deleteTag = (index) => {
  if (propsObj.disabled) return;
  
  deletionMark.value = null;
  clearTimeout(deletionMarkTimer.value);
  
  const newTags = [...tagsCopy.value];
  newTags.splice(index, 1);
  tagsCopy.value = newTags;
  
  tagsEditStatus.value.splice(index, 1);
  
  emit('update:tags', tagsCopy.value);
  emit('tags-changed', tagsCopy.value);
};

const noTriggerKey = (event, category) => {
  const triggerKey = propsObj[category].indexOf(event.keyCode) !== -1 || 
                     propsObj[category].indexOf(event.key) !== -1;
  if (triggerKey) event.preventDefault();
  return !triggerKey;
};

const performAddTags = (tag, event, source) => {
  if (propsObj.disabled || (event && noTriggerKey(event, 'addOnKey'))) return;

  let tags = [];
  if (typeof tag === 'object') tags = [tag];
  if (typeof tag === 'string') tags = createTagTexts(tag);

  tags = tags.filter(tag => tag.text.trim().length > 0);

  tags.forEach(tag => {
    tag = createTag(tag, propsObj.tags, propsObj.validation, propsObj.isDuplicate);
    if (!propsObj.onBeforeAddingTag) {
      addTag(tag, source);
    } else {
      emit('before-adding-tag', {
        tag,
        addTag: () => addTag(tag, source),
      });
    }
  });
};

const duplicateFilter = (tag) => {
  return propsObj.isDuplicate ? 
    !propsObj.isDuplicate(tagsCopy.value, tag) : 
    !tagsCopy.value.find(t => t.text === tag.text);
};

const addTag = (tag, source = 'new-tag-input') => {
  const options = filteredAutocompleteItems.value.map(i => i.text);
  if (propsObj.addOnlyFromAutocomplete && options.indexOf(tag.text) === -1) return;

  nextTick(() => {
    const maximumReached = propsObj.maxTags && propsObj.maxTags <= tagsCopy.value.length;
    if (maximumReached) return emit('max-tags-reached', tag);

    const dup = propsObj.avoidAddingDuplicates && !duplicateFilter(tag);
    if (dup) return emit('adding-duplicate', tag);

    if (hasForbiddingAddRule(tag.tiClasses)) return;

    newTag.value = '';
    tagsCopy.value = [...tagsCopy.value, tag];
    tagsEditStatus.value.push(false);

    emit('update:tags', tagsCopy.value);

    if (source === 'autocomplete') newTagInputRef.value?.focus();

    emit('tags-changed', tagsCopy.value);
  });
};

const performSaveTag = (index, event) => {
  const tag = tagsCopy.value[index];

  if (propsObj.disabled || (event && noTriggerKey(event, 'addOnKey'))) return;
  if (tag.text.trim().length === 0) return;

  if (!propsObj['onBeforeSavingTag']) {
    saveTag(index, tag);
  } else {
    emit('before-saving-tag', {
      index,
      tag,
      saveTag: () => saveTag(index, tag),
    });
  }
};

const saveTag = (index, tag) => {
  if (propsObj.avoidAddingDuplicates) {
    const tagsDiff = clone(tagsCopy.value);
    const inputTag = tagsDiff.splice(index, 1)[0];
    const dup = propsObj.isDuplicate ? 
      propsObj.isDuplicate(tagsDiff, inputTag) : 
      tagsDiff.map(t => t.text).indexOf(inputTag.text) !== -1;

    if (dup) return emit('saving-duplicate', tag);
  }

  if (hasForbiddingAddRule(tag.tiClasses)) return;

  const newTags = [...tagsCopy.value];
  newTags[index] = tag;
  tagsCopy.value = newTags;
  toggleEditMode(index);

  emit('update:tags', tagsCopy.value);
  emit('tags-changed', tagsCopy.value);
};

const tagsEqual = () => {
  return !tagsCopy.value.some((t, i) => !equal(t, propsObj.tags[i]));
};

const updateNewTag = (event) => {
  const value = event.target.value;
  newTag.value = value;
  emit('update:modelValue', value);
};

const initTags = () => {
  tagsCopy.value = createTags(propsObj.tags, propsObj.validation, propsObj.isDuplicate);
  tagsEditStatus.value = new Array(propsObj.tags.length).fill(false);

  if (!tagsEqual()) {
    emit('update:tags', tagsCopy.value);
  }
};

const blurredOnClick = (e) => {
  const el = e.currentTarget;
  if (el?.contains(e.target) || el?.contains(document.activeElement)) return;
  performBlur();
};

const performBlur = () => {
  if (propsObj.addOnBlur && focused.value) performAddTags(newTag.value);
  focused.value = false;
};

const handleKeyDown = (event) => {
  const item = filteredAutocompleteItems.value[selectedItem.value] || newTag.value;
  performAddTags(item, event);
};

// Watchers
watch(() => propsObj.modelValue, (newValue) => {
  if (!propsObj.addOnlyFromAutocomplete) selectedItem.value = null;
  newTag.value = newValue;
});

watch(() => propsObj.tags, () => {
  initTags();
}, { deep: true });

watch(autocompleteOpen, selectDefaultItem);

// Lifecycle
initTags();

onMounted(() => {
  selectDefaultItem();
  document.addEventListener('click', blurredOnClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', blurredOnClick);
  clearTimeout(deletionMarkTimer.value);
});

// Expose for template
defineExpose({
  createClasses
});
</script>

<style lang="scss" src="./vue-tags-input.scss"></style>