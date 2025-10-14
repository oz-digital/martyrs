export default {
  beforeMount(el, binding, vNode) {
    if (typeof binding.value !== 'function') {
      let warn = `[Vue-click-outside:] provided expression ${binding.expression} is not a function, but has to be`;
      const compName = vNode.component?.name;
      if (compName) {
        warn += ` Found in component ${compName}`;
      }
      console.warn(warn);
    }

    el.clickOutsideEvent = function (event) {
      // Проверка, что клик был сделан за пределами элемента и не на самом элементе
      if (!(el === event.target || el.contains(event.target))) {
        // Вызов переданной функции, если условие выполняется
        if (typeof binding.value === 'function') {
          binding.value(event);
        }
      }
    };

    // Использование document вместо document.body может помочь в некоторых случаях,
    // особенно если событие stopPropagation используется в дочерних элементах
    document.addEventListener('click', el.clickOutsideEvent, true); // true для использования в фазе перехвата
  },
  unmounted(el) {
    // Убедитесь, что используете тот же флаг при удалении обработчика
    document.removeEventListener('click', el.clickOutsideEvent, true);
  },
};
