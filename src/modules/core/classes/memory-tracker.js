// memory-tracker-simple.js
// Простой и эффективный инструмент для отслеживания памяти в Vue 3 приложениях

class VueMemoryTracker {
  constructor(options = {}) {
    this.options = {
      interval: 5000, // интервал проверки памяти в мс
      ...options
    };
    
    // Данные трекера
    this.components = {}; // отслеживаемые компоненты по имени
    this.memoryHistory = []; // история использования памяти
    this.isTracking = false;
    this.trackedInstances = new WeakSet(); // для избежания дублирования
    
    // Привязка методов
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.checkMemory = this.checkMemory.bind(this);
    this.scanVueComponents = this.scanVueComponents.bind(this);
    this.hookVueDevtools = this.hookVueDevtools.bind(this);
    
    // UI элементы
    this.ui = null;
  }
  
  // Запуск трекера
  start() {
    if (this.isTracking) return;
    
    this.isTracking = true;
    this.startTime = performance.now();
    
    console.log('[MemoryTracker] Starting memory tracking...');
    
    // Инициализация UI
    this.setupUI();
    
    // Подключаемся к Vue DevTools API для отслеживания компонентов
    this.hookVueDevtools();
    
    // Начинаем периодическое сканирование компонентов и памяти
    this.scanInterval = setInterval(() => {
      this.scanVueComponents();
      this.checkMemory();
    }, this.options.interval);
    
    // Также запускаем сканирование сразу
    this.scanVueComponents();
    this.checkMemory();
    
    // Добавляем обработчик для проверки при возврате вкладки
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    return this;
  }
  
  // Остановка трекера
  stop() {
    if (!this.isTracking) return;
    
    clearInterval(this.scanInterval);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    if (this.ui) {
      this.ui.removeButton();
    }
    
    this.isTracking = false;
    console.log('[MemoryTracker] Stopped memory tracking');
    
    return this;
  }
  
  // Обработка видимости вкладки
  handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      // Вкладка стала видимой, проверяем компоненты и память
      this.scanVueComponents();
      this.checkMemory();
    }
  }
  
  // Измерение использования памяти
  checkMemory() {
    // Получаем текущее состояние памяти
    const memory = performance.memory || {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0, 
      jsHeapSizeLimit: 0
    };
    
    const sample = {
      timestamp: Date.now(),
      elapsed: performance.now() - this.startTime,
      memory: {
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize,
        heapLimit: memory.jsHeapSizeLimit
      },
      components: this.getComponentStats()
    };
    
    this.memoryHistory.push(sample);
    
    // Ограничиваем историю 100 записями
    if (this.memoryHistory.length > 100) {
      this.memoryHistory.shift();
    }
    
    // Обновляем UI, если он активен
    if (this.ui && this.ui.isVisible) {
      this.ui.updateMemoryDisplay(sample);
    }
    
    // Анализируем тренд памяти на предмет утечек
    this.checkForLeaks();
    
    // Выводим информацию в консоль
    console.log(`[MemoryTracker] Memory: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB, Components: ${Object.keys(this.components).length}`);
  }
  
  // Проверка на утечки памяти
  checkForLeaks() {
    if (this.memoryHistory.length < 5) return;
    
    // Анализируем последние 5 замеров
    const samples = this.memoryHistory.slice(-5);
    const growthRates = [];
    
    for (let i = 1; i < samples.length; i++) {
      growthRates.push(samples[i].memory.heapUsed - samples[i-1].memory.heapUsed);
    }
    
    // Считаем устойчивый рост памяти
    const consistentGrowth = growthRates.filter(rate => rate > 0).length >= 4;
    const totalGrowth = samples[samples.length-1].memory.heapUsed - samples[0].memory.heapUsed;
    
    // Если память растет более чем на 10MB за 5 замеров и рост постоянный
    if (consistentGrowth && totalGrowth > 10 * 1024 * 1024) {
      console.warn(`[MemoryTracker] Потенциальная утечка памяти! Рост: ${(totalGrowth / 1024 / 1024).toFixed(2)} MB`);
      
      // Выводим компоненты, отсортированные по размеру
      const suspectComponents = this.getComponentStats()
        .filter(c => c.count > 0)
        .sort((a, b) => b.size - a.size)
        .slice(0, 10);
      
      console.group('Компоненты с наибольшим потреблением памяти:');
      suspectComponents.forEach((c, i) => {
        console.log(`${i+1}. ${c.name}: ${c.count} экз., ~${(c.size / 1024 / 1024).toFixed(2)} MB, возраст: ${c.avgAge}с`);
      });
      console.groupEnd();
    }
  }
  
  // Получение списка компонентов и их статистики
  getComponentStats() {
    const stats = [];
    
    for (const [name, component] of Object.entries(this.components)) {
      // Фильтруем только активные инстансы
      const activeInstances = component.instances.filter(inst => !inst.isDestroyed);
      
      if (activeInstances.length > 0) {
        // Считаем общий и средний размер
        const totalSize = activeInstances.reduce((sum, inst) => sum + inst.size, 0);
        const avgAge = Math.round(
          activeInstances.reduce((sum, inst) => sum + (Date.now() - inst.createdAt) / 1000, 0) / 
          activeInstances.length
        );
        
        stats.push({
          name,
          count: activeInstances.length,
          size: totalSize,
          avgAge
        });
      }
    }
    
    return stats.sort((a, b) => b.size - a.size);
  }
  
  // Подключение к Vue DevTools для отслеживания компонентов
  hookVueDevtools() {
    const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
    
    if (!hook) {
      console.warn('[MemoryTracker] Vue DevTools hook not found. Component tracking will be limited.');
      return;
    }
    
    console.log('[MemoryTracker] Connected to Vue DevTools hook');
    
    // Отслеживаем существующие приложения
    if (hook.apps && hook.apps.length > 0) {
      hook.apps.forEach(app => {
        if (app._instance) {
          this.scanComponentTree(app._instance);
        }
      });
    }
    
    // Подписываемся на события компонентов
    if (!hook._memTrackerPatched) {
      const self = this;
      const originalEmit = hook.emit;
      
      hook.emit = function(event, ...args) {
        // Вызываем оригинальный метод
        const result = originalEmit.apply(this, arguments);
        
        // Отслеживаем создание и обновление компонентов
        if (event === 'component:init') {
          const component = args[0];
          self.trackComponent(component);
        }
        else if (event === 'component:updated') {
          const component = args[0];
          self.updateComponentInfo(component);
        }
        
        return result;
      };
      
      hook._memTrackerPatched = true;
    }
  }
  
  // Отслеживание компонента
  trackComponent(instance) {
    if (!instance || this.trackedInstances.has(instance)) return;
    
    try {
      // Получаем имя компонента
      const name = this.getComponentName(instance);
      
      // Оцениваем размер
      const size = this.estimateSize(instance);
      
      // Сохраняем информацию
      if (!this.components[name]) {
        this.components[name] = {
          name,
          instances: []
        };
      }
      
      // Добавляем инстанс
      this.components[name].instances.push({
        instance,
        createdAt: Date.now(),
        size,
        isDestroyed: false
      });
      
      // Отмечаем как отслеживаемый
      this.trackedInstances.add(instance);
      
      // Отслеживаем удаление компонента (для Vue 3)
      this.trackComponentDestruction(instance, name);
      
      // Рекурсивно отслеживаем дочерние компоненты
      if (instance.subTree) {
        this.scanVNode(instance.subTree);
      }
    } catch (e) {
      // Игнорируем ошибки
    }
  }
  
  // Обновление информации о компоненте
  updateComponentInfo(instance) {
    if (!instance) return;
    
    try {
      const name = this.getComponentName(instance);
      
      if (this.components[name]) {
        // Находим инстанс в списке
        const instanceInfo = this.components[name].instances.find(
          info => info.instance === instance
        );
        
        if (instanceInfo) {
          // Обновляем размер
          instanceInfo.size = this.estimateSize(instance);
          
          // Проверяем, не удален ли компонент
          instanceInfo.isDestroyed = 
            (instance.isUnmounted === true) || 
            (instance._isDestroyed === true);
        }
      }
      
      // Проверяем новые дочерние компоненты
      if (instance.subTree) {
        this.scanVNode(instance.subTree);
      }
    } catch (e) {
      // Игнорируем ошибки
    }
  }
  
  // Отслеживание уничтожения компонента (для Vue 3)
  trackComponentDestruction(instance, name) {
    try {
      // Перехватываем хук unmounted для Vue 3
      if (instance.bum) {
        const originalBum = instance.bum;
        const self = this;
        
        instance.bum = function() {
          // Вызываем оригинальные хуки
          const result = originalBum.apply(this, arguments);
          
          // Помечаем компонент как уничтоженный
          if (self.components[name]) {
            const instanceInfo = self.components[name].instances.find(
              info => info.instance === instance
            );
            
            if (instanceInfo) {
              instanceInfo.isDestroyed = true;
            }
          }
          
          return result;
        };
      }
    } catch (e) {
      // Игнорируем ошибки
    }
  }
  
  // Сканирование VNode на наличие компонентов
  scanVNode(vnode) {
    if (!vnode) return;
    
    try {
      // Обрабатываем компонент в VNode
      if (vnode.component) {
        this.trackComponent(vnode.component);
      }
      
      // Специальная обработка для Suspense
      if (vnode.type && vnode.type.__name === 'Suspense') {
        // Проверяем активную ветку
        if (vnode.suspense && vnode.suspense.activeBranch) {
          this.scanVNode(vnode.suspense.activeBranch);
        }
        
        // Проверяем ожидающую ветку
        if (vnode.suspense && vnode.suspense.pendingBranch) {
          this.scanVNode(vnode.suspense.pendingBranch);
        }
      }
      
      // Проверяем дочерние элементы
      if (vnode.children) {
        if (Array.isArray(vnode.children)) {
          vnode.children.forEach(child => this.scanVNode(child));
        } else if (typeof vnode.children === 'object') {
          // Обработка слотов
          Object.values(vnode.children).forEach(slot => {
            if (typeof slot === 'function') {
              try {
                // Попытка вызова функции слота
                const result = slot();
                if (Array.isArray(result)) {
                  result.forEach(child => this.scanVNode(child));
                } else {
                  this.scanVNode(result);
                }
              } catch (e) {
                // Игнорируем ошибки вызова функции слота
              }
            } else if (Array.isArray(slot)) {
              slot.forEach(child => this.scanVNode(child));
            } else {
              this.scanVNode(slot);
            }
          });
        }
      }
    } catch (e) {
      // Игнорируем ошибки
    }
  }
  
  // Рекурсивное сканирование дерева компонентов
  scanComponentTree(instance, depth = 0) {
    if (!instance || depth > 15) return;
    
    this.trackComponent(instance);
    
    try {
      // Vue 3: сканируем subTree
      if (instance.subTree) {
        this.scanVNode(instance.subTree);
      }
      
      // В компонентах Vue 3 также ищем компоненты в slots
      if (instance.slots) {
        Object.values(instance.slots).forEach(slot => {
          if (typeof slot === 'function') {
            try {
              const result = slot();
              if (Array.isArray(result)) {
                result.forEach(child => this.scanVNode(child));
              } else {
                this.scanVNode(result);
              }
            } catch (e) {
              // Игнорируем ошибки
            }
          }
        });
      }
    } catch (e) {
      // Игнорируем ошибки
    }
  }
  
  // Сканирование всех Vue компонентов в приложении
  scanVueComponents() {
    // Ищем через Vue DevTools Hook
    const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
    
    if (hook && hook.apps) {
      hook.apps.forEach(app => {
        if (app._instance) {
          this.scanComponentTree(app._instance);
        }
      });
    }
    
    // Также сканируем DOM для поиска компонентов
    this.scanDOMForComponents();
  }
  
  // Сканирование DOM для поиска компонентов Vue
  scanDOMForComponents() {
    // Ищем элементы с Vue-специфичными атрибутами
    const elements = document.querySelectorAll('[data-v-]');
    
    elements.forEach(el => {
      // Прямой доступ к компоненту (Vue 2)
      let instance = el.__vue__;
      
      // Vue 3 может хранить инстанс по-другому
      if (!instance && window.__VUE__) {
        instance = window.__VUE__.inspectElement?.(el);
      }
      
      if (instance) {
        this.trackComponent(instance);
      }
    });
    
    // Особые случаи: Suspense, RouterView
    this.scanSpecialComponents();
  }
  
  // Сканирование специальных компонентов (Suspense, RouterView)
  scanSpecialComponents() {
    try {
      // Suspense может иметь специальные классы или атрибуты
      const suspenseElements = document.querySelectorAll('.v-suspense, [suspense]');
      suspenseElements.forEach(el => {
        // Ищем Vue компоненты внутри
        el.querySelectorAll('[data-v-]').forEach(vueEl => {
          let instance = vueEl.__vue__;
          if (!instance && window.__VUE__) {
            instance = window.__VUE__.inspectElement?.(vueEl);
          }
          
          if (instance) {
            this.trackComponent(instance);
          }
        });
      });
      
      // RouterView обычно имеет специальный атрибут
      const routerElements = document.querySelectorAll('[data-router-view]');
      routerElements.forEach(el => {
        el.querySelectorAll('[data-v-]').forEach(vueEl => {
          let instance = vueEl.__vue__;
          if (!instance && window.__VUE__) {
            instance = window.__VUE__.inspectElement?.(vueEl);
          }
          
          if (instance) {
            this.trackComponent(instance);
          }
        });
      });
    } catch (e) {
      // Игнорируем ошибки
    }
  }
  
  // Получение имени компонента
  getComponentName(instance) {
    try {
      // Vue 3: проверяем различные способы получения имени
      if (instance.type && instance.type.name) {
        return instance.type.name;
      }
      
      if (instance.type && instance.type.__name) {
        return instance.type.__name;
      }
      
      if (instance.type && instance.type.__file) {
        return instance.type.__file.split('/').pop().replace('.vue', '');
      }
      
      // Для компонентов, определенных в setup
      if (instance.vnode && instance.vnode.type) {
        const type = instance.vnode.type;
        if (type.name) return type.name;
        if (type.__name) return type.__name;
        if (type.__file) return type.__file.split('/').pop().replace('.vue', '');
      }
      
      // Проверяем метаданные маршрута для RouterView
      if (instance.ctx && instance.ctx.$route) {
        // RouterView с активным маршрутом
        const route = instance.ctx.$route;
        const componentName = route.matched[0]?.components?.default?.name;
        if (componentName) return componentName;
        
        // Возвращаем имя пути
        return 'RouterView:' + route.name || route.path;
      }
      
      // Другие попытки определения имени
      if (instance.ctx && instance.ctx.$options && instance.ctx.$options.name) {
        return instance.ctx.$options.name;
      }
      
      if (instance.proxy && instance.proxy.$options && instance.proxy.$options.name) {
        return instance.proxy.$options.name;
      }
      
      // Проверяем элемент
      if (instance.el) {
        const componentAttr = instance.el.getAttribute('component');
        if (componentAttr) return componentAttr;
        
        // Проверяем атрибут name или id
        const nameAttr = instance.el.getAttribute('name');
        if (nameAttr) return nameAttr;
        
        const idAttr = instance.el.id;
        if (idAttr) return 'Element:' + idAttr;
        
        // Проверяем классы
        const componentClass = Array.from(instance.el.classList || [])
          .find(cls => cls.startsWith('component-'));
        if (componentClass) return componentClass.replace('component-', '');
      }
      
      // По теговому имени элемента (если это кастомный элемент)
      if (instance.el && instance.el.tagName && instance.el.tagName.includes('-')) {
        return instance.el.tagName.toLowerCase();
      }
      
      // Проверяем keyed элементы
      if (instance.key) {
        return 'Keyed:' + instance.key;
      }
    } catch (e) {
      // Игнорируем ошибки доступа к свойствам
    }
    
    return 'Unknown';
  }
  
  // Оценка размера компонента в байтах
  estimateSize(instance) {
    try {
      let size = 1000; // базовый размер
      
      // Подсчет размера по свойствам
      if (instance.ctx) {
        const props = Object.keys(instance.ctx).length;
        size += props * 200; // примерно 200 байт на свойство
      }
      
      // Подсчет по дочерним элементам
      if (instance.subTree) {
        const countNodes = (vnode) => {
          if (!vnode) return 0;
          
          let count = 1;
          
          if (vnode.children) {
            if (Array.isArray(vnode.children)) {
              count += vnode.children.reduce((sum, child) => sum + countNodes(child), 0);
            } else if (typeof vnode.children === 'object') {
              count += Object.values(vnode.children).reduce((sum, slot) => {
                if (Array.isArray(slot)) {
                  return sum + slot.reduce((s, child) => s + countNodes(child), 0);
                }
                return sum + countNodes(slot);
              }, 0);
            }
          }
          
          return count;
        };
        
        const nodeCount = countNodes(instance.subTree);
        size += nodeCount * 500; // примерно 500 байт на узел
      }
      
      // Подсчет по DOM элементам
      if (instance.el) {
        // Размер HTML
        const htmlSize = instance.el.outerHTML?.length || 0;
        size += htmlSize * 2; // UTF-16 ~ 2 байта на символ
        
        // Подсчет дочерних элементов
        const childCount = instance.el.querySelectorAll('*').length;
        size += childCount * 300; // примерно 300 байт на элемент
      }
      
      return size;
    } catch (e) {
      // При ошибке возвращаем базовый размер
      return 1000;
    }
  }
  
  // UI для отображения данных о памяти
  setupUI() {
    this.ui = new MemoryMonitorUI(this);
    return this.ui;
  }
}

// UI класс для отображения статистики памяти
class MemoryMonitorUI {
  constructor(tracker) {
    this.tracker = tracker;
    this.isVisible = false;
    this.container = null;
    this.toggleButton = null;
    
    // Создаем UI элементы
    this.createToggleButton();
  }
  
  // Создание кнопки переключения
  createToggleButton() {
    const button = document.createElement('button');
    button.textContent = '🔍 Memory';
    button.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      z-index: 99999;
      background: #333;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    
    button.addEventListener('click', () => this.toggle());
    document.body.appendChild(button);
    this.toggleButton = button;
  }
  
  // Удаление кнопки
  removeButton() {
    if (this.toggleButton && this.toggleButton.parentNode) {
      this.toggleButton.parentNode.removeChild(this.toggleButton);
    }
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
  
  // Переключение видимости панели
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  // Показать панель
  show() {
    if (!this.container) {
      this.createUI();
    }
    
    this.container.style.display = 'flex';
    this.isVisible = true;
    
    // Обновляем данные сразу при открытии
    const latestSample = this.tracker.memoryHistory[this.tracker.memoryHistory.length - 1];
    if (latestSample) {
      this.updateMemoryDisplay(latestSample);
    }
  }
  
  // Скрыть панель
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
    this.isVisible = false;
  }
  
  // Создание UI панели
  createUI() {
    // Создаем основной контейнер
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      bottom: 40px;
      right: 10px;
      width: 600px;
      height: 400px;
      background: rgba(0,0,0,0.85);
      border-radius: 8px;
      z-index: 99998;
      padding: 10px;
      color: white;
      font-family: sans-serif;
      font-size: 12px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `;
    
    // Заголовок и кнопка закрытия
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';
    
    const title = document.createElement('div');
    title.textContent = 'Vue Memory Monitor';
    title.style.cssText = 'font-weight: bold; font-size: 14px;';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = 'background: none; border: none; color: white; font-size: 18px; cursor: pointer;';
    closeButton.addEventListener('click', () => this.hide());
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Основной контент в двух колонках
    const content = document.createElement('div');
    content.style.cssText = 'display: flex; flex: 1; overflow: hidden;';
    
    // Левая колонка - график памяти
    const leftColumn = document.createElement('div');
    leftColumn.style.cssText = 'flex: 1; margin-right: 10px; display: flex; flex-direction: column;';
    
    // Заголовок графика
    const chartTitle = document.createElement('div');
    chartTitle.textContent = 'Memory Usage';
    chartTitle.style.cssText = 'margin-bottom: 5px;';
    
    // Canvas для графика
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 150;
    canvas.style.cssText = 'width: 100%; height: 150px; background: rgba(255,255,255,0.05); border-radius: 4px;';
    
    // Информация о памяти
    const memoryInfo = document.createElement('div');
    memoryInfo.style.cssText = 'margin-top: 10px; display: flex; justify-content: space-between;';
    
    // Кнопки действий
    const actionsContainer = document.createElement('div');
    actionsContainer.style.cssText = 'margin-top: 10px; display: flex; gap: 5px;';
    
    const snapshotButton = document.createElement('button');
    snapshotButton.textContent = 'Take Snapshot';
    snapshotButton.style.cssText = 'background: #4CAF50; border: none; color: white; padding: 3px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;';
    snapshotButton.addEventListener('click', () => {
      this.tracker.scanVueComponents();
      this.tracker.checkMemory();
    });
    
    actionsContainer.appendChild(snapshotButton);
    
    // Добавляем элементы в левую колонку
    leftColumn.appendChild(chartTitle);
    leftColumn.appendChild(canvas);
    leftColumn.appendChild(memoryInfo);
    leftColumn.appendChild(actionsContainer);
    
    // Правая колонка - таблица компонентов
    const rightColumn = document.createElement('div');
    rightColumn.style.cssText = 'flex: 1; display: flex; flex-direction: column;';
    
    // Заголовок таблицы
    const tableTitle = document.createElement('div');
    tableTitle.textContent = 'Components by Memory Usage';
    tableTitle.style.cssText = 'margin-bottom: 5px;';
    
    // Контейнер для таблицы компонентов
    const componentTable = document.createElement('div');
    componentTable.style.cssText = 'flex: 1; overflow-y: auto; background: rgba(255,255,255,0.05); border-radius: 4px;';
    
    // Добавляем элементы в правую колонку
    rightColumn.appendChild(tableTitle);
    rightColumn.appendChild(componentTable);
    
    // Добавляем колонки в контент
    content.appendChild(leftColumn);
    content.appendChild(rightColumn);
    
    // Собираем всё вместе
    container.appendChild(header);
    container.appendChild(content);
    
    // Добавляем в DOM
    document.body.appendChild(container);
    
    // Сохраняем ссылки на элементы
    this.container = container;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.memoryInfo = memoryInfo;
    this.componentTable = componentTable;
    
    // Инициализируем пустой график
    this.drawMemoryChart([]);
  }
  
  // Обновление отображения данных о памяти
  updateMemoryDisplay(sample) {
    if (!this.isVisible) return;
    
    // Обновляем график памяти
    this.updateMemoryChart(sample);
    
    // Обновляем информацию о памяти
    this.updateMemoryInfo(sample);
    
    // Обновляем таблицу компонентов
    this.updateComponentTable(sample.components);
  }
  
  // Обновление графика памяти
  updateMemoryChart(sample) {
    // Получаем историю использования памяти
    const memoryData = this.tracker.memoryHistory.map(s => s.memory);
    
    // Рисуем график
    this.drawMemoryChart(memoryData);
  }
  
  // Рисование графика памяти
  drawMemoryChart(data) {
    if (!this.ctx || !this.canvas) return;
    
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Очищаем холст
    ctx.clearRect(0, 0, width, height);
    
    if (data.length === 0) {
      // Нет данных
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for memory data...', width / 2, height / 2);
      return;
    }
    
    // Рисуем сетку
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const y = i * (height / 4);
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
    
    // Находим максимальное значение для масштабирования
    const maxMem = Math.max(...data.map(d => d.heapUsed)) * 1.1; // +10% для запаса
    
    // Рисуем линию использования памяти
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((point, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (point.heapUsed / maxMem) * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Заливка под графиком
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(76, 175, 80, 0.3)');
    gradient.addColorStop(1, 'rgba(76, 175, 80, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, height - (data[0].heapUsed / maxMem) * height);
    data.forEach((point, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (point.heapUsed / maxMem) * height;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    
    // Подписи
    ctx.fillStyle = 'white';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${(maxMem / 1024 / 1024).toFixed(1)} MB`, 5, 12);
    
    // Текущее значение
    const current = data[data.length - 1];
    ctx.fillStyle = '#4CAF50';
    ctx.textAlign = 'right';
    ctx.fillText(`${(current.heapUsed / 1024 / 1024).toFixed(1)} MB`, width - 5, height - 5);
  }
  
  // Обновление информации о памяти
  updateMemoryInfo(sample) {
    if (!this.memoryInfo) return;
    
    const memory = sample.memory;
    this.memoryInfo.innerHTML = `
      <div>Used: ${(memory.heapUsed / 1024 / 1024).toFixed(1)} MB</div>
      <div>Total: ${(memory.heapTotal / 1024 / 1024).toFixed(1)} MB</div>
      <div>Components: ${sample.components.length}</div>
    `;
  }
  
  // Обновление таблицы компонентов
  updateComponentTable(components) {
    if (!this.componentTable) return;
    
    // Очищаем таблицу
    this.componentTable.innerHTML = '';
    
    if (!components || components.length === 0) {
      this.componentTable.innerHTML = '<div style="padding: 10px; text-align: center;">No components tracked yet</div>';
      return;
    }
    
    // Создаем заголовок таблицы
    const tableHeader = document.createElement('div');
    tableHeader.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 60px 80px 60px;
      padding: 5px;
      background: rgba(255,255,255,0.1);
      font-weight: bold;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    `;
    
    tableHeader.innerHTML = `
      <div>Component</div>
      <div style="text-align: right">Count</div>
      <div style="text-align: right">Size (MB)</div>
      <div style="text-align: right">Age (s)</div>
    `;
    
    this.componentTable.appendChild(tableHeader);
    
    // Добавляем строки для каждого компонента
    components.forEach((component, index) => {
      const row = document.createElement('div');
      row.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 60px 80px 60px;
        padding: 5px;
        ${index % 2 === 1 ? 'background: rgba(255,255,255,0.05);' : ''}
        border-bottom: 1px solid rgba(255,255,255,0.1);
      `;
      
      // Определяем цвет в зависимости от использования памяти
      let memoryColor = '#4CAF50'; // Зеленый для небольших
      if (component.size > 5 * 1024 * 1024) { // Больше 5MB
        memoryColor = '#F44336'; // Красный
      } else if (component.size > 1 * 1024 * 1024) { // Больше 1MB
        memoryColor = '#FF9800'; // Оранжевый
      }
      
      // Определяем цвет для возраста
      let ageColor = '#4CAF50'; // Зеленый для новых
      if (component.avgAge > 120) { // Больше 2 минут
        ageColor = '#F44336'; // Красный
      } else if (component.avgAge > 60) { // Больше 1 минуты
        ageColor = '#FF9800'; // Оранжевый
      }
      
      row.innerHTML = `
        <div title="${component.name}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${component.name}
        </div>
        <div style="text-align: right">${component.count}</div>
        <div style="text-align: right; color: ${memoryColor}">
          ${(component.size / 1024 / 1024).toFixed(2)}
        </div>
        <div style="text-align: right; color: ${ageColor}">
          ${component.avgAge}
        </div>
      `;
      
      // Добавляем обработчик клика для подробностей
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        console.group(`Component: ${component.name}`);
        console.log(`Instances: ${component.count}`);
        console.log(`Memory: ${(component.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Average age: ${component.avgAge} seconds`);
        console.groupEnd();
      });
      
      this.componentTable.appendChild(row);
    });
  }
}

// Функция для создания и запуска трекера
function setupMemoryTracker(options = {}) {
  const tracker = new VueMemoryTracker(options);
  tracker.start();
  
  // Также регистрируем глобально для отладки из консоли
  window.__memoryTracker = tracker;
  
  return tracker;
}

// Экспорт для использования
export { setupMemoryTracker, VueMemoryTracker };