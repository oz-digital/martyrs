# Field

The Field component is an input field with a label, a placeholder, and validation status. It's a part of the Martyrs which is a collection of Vue 3 script setup components for frontend development.

[[toc]]

## Usage

<script setup>
	import { reactive } from 'vue'
	import Field from '../../../src/components/Field/Field.vue'

	let example = reactive({
		name: 'Example Name'
	})
</script>

<Field
  :label="yourLabel"
  :placeholder="yourPlaceholder"
  v-model:field="example.name"
  :validation="yourValidationStatus"
/>

::: info Store
{{ example }}
:::

```html
<Field :label="yourLabel" :placeholder="yourPlaceholder" :field="yourModelValue" v-model:field="yourModelValue" :validation="yourValidationStatus" />
```

## Props

| Name        | Type    | Default                | Description                                 |
| ----------- | ------- | ---------------------- | ------------------------------------------- |
| label       | String  | 'Label'                | The label displayed next to the input field |
| placeholder | String  | 'Enter something here' | The placeholder text for the input field    |
| field       | Any     | null                   | The value of the input field                |
| validation  | Boolean | false                  | The validation status of the input field    |

## Events

| Name              | Description                                |
| ----------------- | ------------------------------------------ |
| update:modelValue | Emits the updated value of the input field |
