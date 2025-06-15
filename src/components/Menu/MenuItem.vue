<script>
  import { h, ref, inject, defineComponent } from 'vue';
  
  import IconChevronRight from '@martyrs/src/modules/icons/navigation/IconChevronRight.vue';  

  export default defineComponent({
    props: {
    },
    setup(props, { slots }) {
      return () => {
        const defaultSlotContent = slots.default ? slots.default() : [];

        const iconSlot = [];
        const textSlot = [];

        // Changing the logic to place slots based on whether the type starts with 'Icon' or not
        defaultSlotContent.forEach((vnode) => {
          let compType = vnode.toString()
          if (vnode.props && vnode.props.icon) {  // Check if the type starts with 'Icon'
            iconSlot.push(vnode);
          } else {
            textSlot.push(vnode);
          }
        });

        return h(
          'div',
          {
            class: [
              'w-100',
              't-left',
              'flex-nowrap',
              'flex-v-center',
              'flex',
              // here we need add logic
              { 'br-b br-black-transp-10 br-solid': true  }
            ]
          },
          [
            // Conditionally include the div for iconSlot
            ...iconSlot.length ? [
              h(
                'div',
                {
                  class: ['mn-b-thin', 'mn-t-thin', 'flex-center', 'flex', 'mn-r-small','flex-child','flex-child-shrink-0', 'i-big', 'bg-main', 'radius-thin']
                },
                iconSlot
              )
            ] : [],
            h(
              'div',
              {
                class: ['w-100', 'mn-b-thin', 'mn-t-thin', 'mn-r-small', 'i-big', 'flex-v-center', 'flex']
              },
              [
                h(
                  'span',
                  {
                    class: ['p-big', 't-medium', 'mn-r-auto']
                  },
                  textSlot
                )
              ]
            ),
            h(IconChevronRight, { class: "i-medium mn-r-medium", type: "chevron"})
          ]
        );
      };
    }
  });
</script>
