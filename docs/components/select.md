# Select

The Select component is a dropdown selection menu with a label, a placeholder, and validation status. It's a part of the Martyrs which is a collection of Vue 3 script setup components for frontend development.

[[toc]]

## Usage

<script setup>
import { reactive } from 'vue'
  import Select from '../../../src/components/Select/Select.vue'

let example = reactive({
  name: 'Example Name'
})
</script>

<Select 
  :options="[
    {name: 'John',        value: 'director'}, 
    {name: 'Sam',        value: 'manager'},
    {name: 'Piotr',       value: 'member'}, 
  ]"
  :prop="example"
  content="name" 
  placeholder="Роль" 
  size="small"
  class="w-80"
/>

::: info Store
{{ example }}
:::

## Props

| Name        | Type   | Default         | Description                                                                                                    |
| ----------- | ------ | --------------- | -------------------------------------------------------------------------------------------------------------- |
| options     | Array  | []              | The list of options for the select menu, each item can be an object with name and value properties or a string |
| prop        | Object | {}              | The reactive object containing the selected value of the menu                                                  |
| content     | String | ''              | The property of the prop object representing the selected value                                                |
| placeholder | String | 'Please select' | The placeholder text for the select menu when no option is selected                                            |
| size        | String | 'default'       | The size of the select menu; can be 'small' or 'default'                                                       |
| label       | String | ''              | The label displayed next to the select menu                                                                    |

## Events

None

## Example

```html
<select
  class="w-80"
  :options="[
    {name: 'John',        value: 'director'}, 
    {name: 'Sam',        value: 'manager'},
    {name: 'Piotr',       value: 'member'}, 
  ]"
  :prop="member"
  content="role"
  placeholder="Роль"
  size="small"
/>
```

```javascript
import { reactive } from 'vue';
import Select from 'path/to/components/Select';

export default {
  components: {
    Select,
  },
  setup() {
    const member = reactive({
      role: '',
    });

    return {
      member,
    };
  },
};
```
