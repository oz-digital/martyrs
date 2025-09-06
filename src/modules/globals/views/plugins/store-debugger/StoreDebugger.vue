<template>
  <div :class="[`store-debugger`, theme]">
    <button class="debug-btn" @click="toggleOpen" :aria-expanded="open" :title="open ? 'Close debugger' : 'Open debugger'">
      🐞
    </button>

    <transition name="fade">
      <aside v-if="open" class="debug-panel">
        <header class="panel-header">
          <div class="header-left">
            <strong>Store Debugger</strong>
            <span class="timestamp">{{ lastUpdated }}</span>
          </div>
          <div class="header-controls">
            <input v-model="filterText" class="search-input" placeholder="Filter modules..." />
            <button @click="toggleTheme" :title="theme === 'light' ? 'Switch to dark' : 'Switch to light'">
              {{ theme === 'light' ? '🌙' : '☀️' }}
            </button>
            <button @click="refreshState" title="Refresh state">🔄</button>
            <button @click="toggleOpen" class="close-btn" title="Close">✕</button>
          </div>
        </header>

        <div class="panel-body">
          <div class="module-controls">
            <button @click="expandAll" :disabled="allExpanded" title="Expand all">➕ All</button>
            <button @click="collapseAll" :disabled="allCollapsed" title="Collapse all">➖ All</button>
          </div>

          <section
            v-for="mod in filteredModules"
            :key="mod.name"
            class="module">
            <header class="module-header" @click="mod.expanded = !mod.expanded">
              <span>{{ mod.name }}</span>
              <span>{{ mod.expanded ? '▼' : '▶' }}</span>
            </header>

            <div v-show="mod.expanded" class="module-content">
              <div class="module-actions">
                <button @click.stop="copyJSON(mod.name)" title="Copy JSON">📋</button>
                <button @click.stop="downloadJSON(mod.name)" title="Download JSON">⬇️</button>
              </div>
              <pre class="json-view">{{ prettyJSON(mod.state) }}</pre>
            </div>
          </section>

          <div v-if="!filteredModules.length" class="no-results">No modules match filter.</div>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  store: { type: Object, required: true }
})

// panel open/close
const open = ref(false)
const toggleOpen = () => { open.value = !open.value }

// theme
const theme = ref('light')
const toggleTheme = () => { theme.value = theme.value === 'light' ? 'dark' : 'light' }

// capture timestamp
const lastUpdated = ref('')
function updateTimestamp() {
  const now = new Date()
  lastUpdated.value = now.toLocaleString('en-US', { 
    dateStyle: 'medium', 
    timeStyle: 'medium' 
  })
}

// modules state for UI
const modules = reactive([])

// обновляем список модулей: добавляем новые, удаляем ушедшие, обновляем state, сохраняя expanded
function updateModules() {
  const prevMap = new Map(modules.map(m => [m.name, m]))
  const next = []

  // для каждого модуля в сторе
  props.store.modules.forEach(name => {
    const rawState = props.store[name]?.state ?? props.store[name]
    const snapshot = JSON.parse(JSON.stringify(rawState))
    const prev = prevMap.get(name)

    next.push({
      name,
      state: snapshot,
      expanded: prev ? prev.expanded : false
    })
  })

  // заменить содержимое reactive-массива modules
  modules.splice(0, modules.length, ...next)
}

function refreshState() {
  updateTimestamp()
  updateModules()
}

// initial load
refreshState()

// filtered modules
const filterText = ref('')
const filteredModules = computed(() => {
  const term = filterText.value.toLowerCase()
  return modules.filter(m => m.name.toLowerCase().includes(term))
})

// expand/collapse
const allExpanded = computed(() => filteredModules.value.every(m => m.expanded))
const allCollapsed = computed(() => filteredModules.value.every(m => !m.expanded))
const expandAll   = () => filteredModules.value.forEach(m => m.expanded = true)
const collapseAll = () => filteredModules.value.forEach(m => m.expanded = false)

// JSON helpers
const prettyJSON = obj => JSON.stringify(obj, null, 2)
function copyJSON(name) {
  const mod = modules.find(m => m.name === name)
  navigator.clipboard.writeText(prettyJSON(mod.state))
}
function downloadJSON(name) {
  const mod = modules.find(m => m.name === name)
  const blob = new Blob([prettyJSON(mod.state)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}-state.json`
  a.click()
  URL.revokeObjectURL(url)
}

// watch for store/state changes, обновляем лишь если панель открыта
watch(
  () => props.store.modules.map(name => props.store[name]?.state),
  () => { if (open.value) refreshState() },
  { deep: true }
)
</script>


<style scoped>
.store-debugger.light { }
.store-debugger.dark {
  --bg: #2e2e2e;
  --fg: #eee;
  --panel-bg: #1e1e1e;
  --border: #444;
  --input-bg: #333;
}

.store-debugger {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 10000;
  font-family: sans-serif;
  z-index: 200;
}

.debug-btn {
  width: 3rem;
  height: 3rem;
  border: none;
  border-radius: 50%;
  background: var(--bg, #333);
  color: var(--fg, #fff);
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

.debug-panel {
  position: fixed;
  bottom: 4rem;
  right: 1rem;
  width: calc(100% - 2rem);
  max-width: 30rem;
  min-height: 80vh;
  max-height: 80vh;
  background: var(--panel-bg, #fff);
  color: var(--fg, #111);
  border: 1px solid var(--border, #ccc);
  border-radius: .5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--panel-bg, #f5f5f5);
  border-bottom: 1px solid var(--border, #ddd);
}
.header-left {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}
.timestamp {
  font-size: 0.75rem;
  color: var(--fg, #666);
}
.header-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.search-input {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border, #ccc);
  background: var(--input-bg, #fff);
  color: var(--fg, #111);
  border-radius: .25rem;
}
.close-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}
.module-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.module {
  border: 1px solid var(--border, #ddd);
  border-radius: .25rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
}
.module-header {
  background: var(--panel-bg, #eaeaea);
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
}
.module-content {
  padding: 0.5rem;
  background: var(--bg, #fafafa);
}
.module-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}
.json-view {
  font-size: 0.85rem;
  line-height: 1.2;
  max-height: 60rem;
  overflow: auto;
  background: var(--panel-bg, #f6f8fa);
  padding: 0.5rem;
  border-radius: .25rem;
}
.no-results {
  text-align: center;
  color: var(--fg, #666);
  margin-top: 1rem;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
