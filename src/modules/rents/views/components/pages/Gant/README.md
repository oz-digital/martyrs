# Документация компонента GanttChart

## Обзор

GanttChart - это Vue 3 компонент для отображения диаграммы Ганта с поддержкой различных временных масштабов (часы, дни, недели) и динамической подгрузкой данных при прокрутке.

## Архитектура компонента

### Основные компоненты:
- **GanttChart.vue** - главный компонент
- **GanttToolbar.vue** - панель управления с переключателями вида и навигацией
- **GanttHeaderCell.vue** - ячейки заголовка временной шкалы
- **GanttBar.vue** - визуализация задач/элементов

## Способ создания сетки

### 1. Генерация ячеек временной шкалы

Сетка создается динамически в computed свойстве `visibleCells` на основе текущего вида (`view`) и диапазона дат (`dateRange`):

```javascript
const visibleCells = computed(() => {
  const cells = []
  
  switch (props.view) {
    case 'hours':
      // Генерация 24 ячеек на каждый день
      for (let d = new Date(start); d <= end;) {
        for (let h = 0; h < 24; h++) {
          cells.push({
            type: 'hour',
            date: new Date(d),
            hour: h,
            key: `${d.getTime()}-${h}`
          })
        }
        d.setDate(d.getDate() + 1)
      }
      break
      
    case 'days':
      // Генерация ячейки на каждый день
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        cells.push({
          type: 'day',
          date: new Date(d),
          key: d.getTime()
        })
      }
      break
      
    case 'weeks':
      // Генерация ячеек по неделям
      const ws = new Date(start)
      ws.setDate(start.getDate() - start.getDay()) // Начало недели
      
      for (let w = new Date(ws); w <= end;) {
        const we = new Date(w)
        we.setDate(w.getDate() + 6)
        
        cells.push({
          type: 'week',
          start: new Date(w),
          end: we,
          key: w.getTime()
        })
        
        w.setDate(w.getDate() + 7)
      }
      break
  }
  
  return cells
})
```

### 2. Отрисовка сетки

Сетка состоит из двух слоев:
- **Заголовок** - фиксированная строка с временными метками
- **Тело** - строки с фоновыми ячейками и барами задач

```vue
<!-- Заголовок -->
<div class="gantt-timeline flex">
  <div
    v-for="(cell, i) in visibleCells"
    :key="cell.key"
    class="gantt-cell"
    :style="{ width: cellWidth + 'px' }"
  >
    <GanttHeaderCell :cell="cell" :view="view" :index="i" />
  </div>
</div>

<!-- Фоновые ячейки в теле -->
<div class="gantt-cells flex pos-absolute h-100">
  <div
    v-for="cell in visibleCells"
    :key="cell.key + '-bg'"
    class="gantt-cell h-100"
    :style="{ width: cellWidth + 'px' }"
  />
</div>
```

## Механизм переключения видов

### 1. Доступные виды
```javascript
views: [
  { name: 'Hours', value: 'hours', width: 40 },
  { name: 'Days', value: 'days', width: 60 },
  { name: 'Weeks', value: 'weeks', width: 120 }
]
```

### 2. Переключение вида
При изменении вида:
1. Обновляется ширина ячеек через `cellWidth`
2. Пересчитываются видимые ячейки в `visibleCells`
3. Происходит центрирование на текущей дате
4. Пересчитываются позиции всех баров

### 3. Навигация по времени
В `GanttToolbar` реализована навигация:
- **Часовой вид**: переход по дням
- **Дневной/недельный вид**: переход по месяцам
- Кнопка "Today" центрирует вид на текущей дате

## Выявленные проблемы и ошибки

### 1. Проблемы с мутацией дат
**Ошибка**: В старой версии (`GanttChart.vue` строки 157-163, 242-244) происходит мутация объектов Date в циклах:
```javascript
// Проблемный код
for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
  cells.push({
    date: new Date(d), // Правильно - создается копия
    key: d.getTime()
  })
}
```

### 2. Проблемы с позиционированием баров в недельном виде
**Ошибка**: В новой версии (`Gant/GanttChart.vue` строки 319-348) сложная логика определения индексов недель может давать неверные результаты для граничных случаев.

### 3. Отсутствие обработки ошибок
**Проблема**: Нет проверок на корректность дат и обработки исключений при парсинге дат из строк.

### 4. Проблемы производительности
**Проблема**: При большом количестве элементов пересчет позиций баров происходит синхронно, что может вызывать задержки.

### 5. Некорректная работа с часовыми поясами
**Проблема**: Использование локального времени без учета часовых поясов может привести к смещению при работе с данными с сервера.

### 6. Дублирование стилей
**Проблема**: В обеих версиях есть дублирование CSS классов для позиционирования и стилизации.

## Рекомендации по улучшению

1. **Использовать библиотеку для работы с датами** (dayjs уже используется в новой версии)
2. **Добавить виртуализацию** для больших наборов данных
3. **Вынести расчеты позиций** в отдельные функции с мемоизацией
4. **Добавить обработку ошибок** для некорректных дат
5. **Использовать CSS переменные** для динамических стилей вместо inline styles
6. **Добавить поддержку часовых поясов**
7. **Оптимизировать перерисовки** через shallowRef для больших массивов

## Пример использования

```vue
<template>
  <GanttChart
    :items="rentals"
    :view="currentView"
    :date="currentDate"
    :date-range="dateRange"
    :views="availableViews"
    start-key="startDate"
    end-key="endDate"
    title-key="productDetails.name"
    status-key="status"
    group-by="productDetails.name"
    @update:view="currentView = $event"
    @update:date="currentDate = $event"
    @load-more="handleLoadMore"
    @item-click="handleItemClick"
  />
</template>

<script setup>
import { ref } from 'vue'
import GanttChart from './Gant/GanttChart.vue'

const currentView = ref('days')
const currentDate = ref(new Date())
const dateRange = ref({
  start: new Date(2024, 0, 1),
  end: new Date(2024, 11, 31)
})

const rentals = ref([
  {
    id: 1,
    productDetails: { name: 'Product A' },
    startDate: new Date(2024, 0, 15),
    endDate: new Date(2024, 0, 25),
    status: 'active'
  }
])

const handleLoadMore = async (direction) => {
  // Загрузка дополнительных данных
}

const handleItemClick = (item) => {
  // Обработка клика по элементу
}
</script>
```