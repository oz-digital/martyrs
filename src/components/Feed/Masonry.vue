<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

// Assuming the default props are handled similarly in JS
const props = defineProps({
  columnWidth: { type: [Number, Array], default: 400 },
  items: { type: Array, required: true },
  gap: { type: Number, default: 0 },
  rtl: { type: Boolean, default: false },
  ssrColumns: { type: Number, default: 0 },
  minColumns: { type: Number, default: 1 },
  maxColumns: { type: Number, default: 3 },
  keyMapper: { default: undefined },
})

const emit = defineEmits(['redraw', 'redrawSkip'])


const columns = ref([])
const wall = ref(null)
const scrollContainer = ref(null);

function useMasonryWall({
  columns,
  columnWidth,
  emit,
  gap,
  items,
  maxColumns,
  minColumns,
  rtl,
  scrollContainer,
  ssrColumns,
  wall
}) {
  // Helper function to recursively count the number of columns that can fit
  function countIteratively(containerWidth, gap, count, consumed) {
    const nextWidth = getColumnWidthTarget(count);
    if (consumed + gap + nextWidth <= containerWidth) {
      return countIteratively(containerWidth, gap, count + 1, consumed + gap + nextWidth);
    }
    return count;
  }

  // Calculate target width for a column at given index
  function getColumnWidthTarget(columnIndex) {
    const widths = Array.isArray(columnWidth.value) ? columnWidth.value : [columnWidth.value];
    return widths[columnIndex % widths.length];
  }

  // Determine the number of columns based on the container's width
  function columnCount() {
    const count = countIteratively(
      wall.value.getBoundingClientRect().width,
      gap.value,
      0,
      -gap.value // Account for initial gap
    );
    const boundedCount = Math.max(minColumns.value || 0, Math.min(count, maxColumns.value || count));
    return boundedCount > 0 ? boundedCount : 1;
  }

  // Create columns arrays based on count
  function createColumns(count) {
    return Array.from({ length: count }, () => []);
  }

  // Initial columns setup for SSR
  if (ssrColumns.value > 0) {
    const newColumns = createColumns(ssrColumns.value);
    props.items.forEach((_, i) => newColumns[i % ssrColumns.value].push(i));
    columns.value = newColumns;
  }

  // Asynchronously fill columns with items
  async function fillColumns(itemIndex) {
    if (itemIndex >= props.items.length) return;
    await nextTick();
    const columnDivs = [...wall.value.children];
    if (rtl.value) columnDivs.reverse();
    const target = columnDivs.reduce((prev, curr) =>
      curr.getBoundingClientRect().height < prev.getBoundingClientRect().height ? curr : prev
    );
    columns.value[+target.dataset.index].push(itemIndex);
    await fillColumns(itemIndex + 1);
  }

  // Redraw columns, optionally forcing a refresh
  async function redraw(force = false) {
    if (columns.value.length === columnCount() && !force) {
      emit('redrawSkip');
      return;
    }
    columns.value = createColumns(columnCount());
    // const scrollY = scrollContainer.value ? scrollContainer.value.scrollTop : window.scrollY;
    await fillColumns(0);
    // if (scrollContainer.value) {
      // scrollContainer.value.scrollTop = scrollY;
    // } else {
      // window.scrollTo({ top: scrollY });
    // }
    emit('redraw');
  }

  // Observe wall size changes to trigger redraw
  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => redraw()) : undefined;

  onMounted(() => {
    redraw();
    if (resizeObserver) resizeObserver.observe(wall.value);
  });

  onBeforeUnmount(() => {
    if (resizeObserver) resizeObserver.unobserve(wall.value);
  });

  // Watchers for reactive properties
  watch([items, rtl, columnWidth, gap, minColumns, maxColumns, ssrColumns], () => redraw(true));

  return { getColumnWidthTarget };
}

const { getColumnWidthTarget } = useMasonryWall({
  columns,
  columnWidth: props.columnWidth,
  emit,
  gap: props.gap,
  items: props.items,
  maxColumns: props.maxColumns,
  minColumns: props.minColumns,
  rtl: props.rtl,
  scrollContainer: props.scrollContainer,
  ssrColumns: props.ssrColumns,
  wall
});


</script>

<template>
  <div
    ref="wall"
    class="masonry-wall"
    :style="{ display: 'flex', gap: `${props.gap}px` }"
  >
    <div
      v-for="(column, columnIndex) in columns"
      :key="columnIndex"
      class="masonry-column"
      :data-index="columnIndex"
      :style="{
        'display': 'flex',
        'flex-basis': `${getColumnWidthTarget(columnIndex)}px`,
        'flex-direction': 'column',
        'flex-grow': 1,
        'gap': `${props.gap}px`,
        'height': '-webkit-max-content, -moz-max-content, max-content',
        'min-width': 0,
      }"
    >
      <div
        v-for="(itemIndex, row) in column"
        :key="props.keyMapper ? props.keyMapper(props.items[itemIndex], columnIndex, row, itemIndex) : itemIndex"
        class="masonry-item"
      >
        <slot
          :item="props.items[itemIndex]"
          :column="columnIndex"
          :row="row"
          :index="itemIndex"
        >
          {{ props.items[itemIndex] }}
        </slot>
      </div>
    </div>
  </div>
</template>
