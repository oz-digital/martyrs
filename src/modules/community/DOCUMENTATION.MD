# Дефолтное состояние
Дефолтное состояние определяется через query указанное в роуте, которое передается в стор модуля. Механизм считывания query находится в lifecycle onMounted компонента Blog.vue. Если query нет, то он берет дефолтное значение из стора. Period и tags назначаются на null и [] в lifecycle onMounted компонента Blog.vue.

Для блока с периодом (Topic for $period) используется route.query.period, если он не указан - то Period назначаются на null в lifecycle onMounted компонента Blog.vue