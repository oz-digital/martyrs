## ВАЖНО: Инструкция для AI по классам Martyrs

**НИКОГДА НЕ СОЗДАВАЙ СЛУЧАЙНЫЕ КЛАССЫ!** Используй только классы из системы Martyrs, перечисленные ниже.

### Правила использования фонов:
- На белом фоне страницы → элементы используют `bg-light`
- На фоне `bg-light` → элементы используют `bg-white`
- Кнопки и акцентные элементы → `bg-main` или `bg-second`
- Всегда соблюдай контраст между элементами

## Примеры комбинаций классов из модуля music

### Карточки
```
# Карточка пример 1
d-block radius-medium o-hidden
pos-relative
w-100 aspect-1x1 object-fit-cover
pos-absolute pos-t-0 pos-l-0 w-100 h-100 flex-center flex transition-cubic-in-out
i-big bg-main radius-round flex-center flex aspect-1x1
pd-medium bg-light
mn-b-thin t-medium t-truncate
t-transp t-small t-truncate

# Карточка пример 2
flex flex-column radius-medium o-hidden bg-white
cursor-pointer hover-scale-1
w-100 pos-relative aspect-1x1
w-100 h-100 object-fit-cover
w-100 h-100 bg-light flex-center flex
pos-absolute pos-t-small pos-r-small pd-micro radius-medium
t-medium mn-b-small t-truncate
азвTrackListCard)
pd-small hover-bg-white-transp-25 flex-v-center flex cursor-pointer
bg-main-transp-10
w-3r t-center pos-relative
flex-child-1 flex flex-v-center
w-3r h-3r object-fit-cover o-hidden radius-small
hover-t-main hover-t-underline
```

### Формы
```
# Форма поиска (SearchForm)
flex-v-center flex bg-white-transp-50 pd-thin radius-extra
i-small mn-r-small
bg-transparent border-none flex-1
bg-transparent border-none pd-zero
```

### Страницы и секции
```
# Главная страница музыки (MusicHome)
pd-medium mobile:pd-thin
mn-b-semi
flex-between flex mn-b-small
```

### Скроллируемые контейнеры
```
# Горизонтальный скролл
flex flex-nowrap gap-small o-x-scroll scroll-behavior-smooth scroll-snap-type-x-mandatory scroll-hide
flex-none scroll-snap-align-start
w-min-15r transition-cubic-in-out

# Контейнер списка
bg-light radius-medium o-hidden
```

### Гриды и раскладки
```
# Грид плейлистов
cols-5 mobile:cols-2 gap-small

# Грид артистов
cols-6 mobile:cols-3 gap-small

# Элемент грида
flex-child-default w-100
hover-scale-1 transition-cubic-in-out
```

### Отступы и размеры
```
<!-- Отступы снизу -->
mn-b-micro, mn-b-thin, mn-b-small, mn-b-medium, mn-b-big

<!-- Паддинги -->
pd-micro, pd-thin, pd-small, pd-medium, pd-big

<!-- Специальные паддинги -->
pd-r-medium, pd-l-medium, pd-b-zero

<!-- Размеры -->
w-100, h-100, w-50, aspect-1x1

<!-- Максимальные высоты -->
h-max-40r, h-4r
```

---

Вот полный список классов Martyrs:

## **Позиционирование и Display**
```
pos-fixed, pos-absolute, pos-relative, pos-sticky
pos-t-0, pos-r-0, pos-b-0, pos-l-0
pos-t-regular, pos-r-regular, pos-b-regular, pos-l-regular
pos-t-1, pos-r-1, pos-b-1, pos-l-1
z-index-1, z-index-2, z-index-3, z-index-4, z-index-5
d-block, d-inline, d-inline-block, d-flex, d-grid, d-none
```

## **Размеры**
```
w-100, w-95, w-80, w-75, w-70, w-66, w-50, w-45, w-40, w-33, w-25, w-20, w-15, w-10, w-5, w-0
h-100, h-80, h-75, h-70, h-66, h-50, h-45, h-40, h-33, h-25, h-20, h-15, h-10, h-5, h-0
w-auto, w-min, w-fit, w-max
h-auto, h-min, h-fit, h-max
w-100vh, h-100vh
w-max-66r, w-max-50r, w-max-40r, w-max-33r, w-max-32r, w-max-25r, w-max-20r, w-max-15r, w-max-10r, w-max-5r
h-max-60vh, h-max-50vh, h-max-40vh
w-m-66r, w-m-60r, w-m-50r, w-m-40r, w-m-33r, w-m-25r, w-m-20r, w-m-15r, w-m-10r, w-m-5r, w-m-3r, w-m-2r
h-4r, h-5r, h-6r, h-8r, h-10r, h-12r, h-15r, h-16r, h-20r
min-h-100vh
aspect-16x9, aspect-4x3, aspect-1x1
```

## **Flexbox**
```
flex, flex-column, flex-row
flex-nowrap, flex-wrap
flex-center, flex-v-center, flex-justify-center, flex-justify-between, flex-justify-start, flex-justify-end
flex-align-start, flex-align-end, flex-align-center
flex-child-default, flex-child-1, flex-child-auto, flex-child-none
flex-grow-0, flex-grow-1, flex-grow-2, flex-grow-3
flex-shrink-0, flex-shrink-1
order-0, order-1, order-2, order-3, order-4, order-5, order-6, order-7, order-8, order-9, order-last
```

## **Grid**
```
cols-1, cols-2, cols-3, cols-4, cols-5, cols-6
cols-2-1_3, cols-2-2_1, cols-2-1_2
cols-2-fit-content, cols-auto-1fr
grid-template-columns
```

## **Spacing (padding/margin)**
```
pd-zero, pd-nano, pd-micro, pd-thin, pd-small, pd-regular, pd-medium, pd-semi, pd-big, pd-extra
pd-t-*, pd-r-*, pd-b-*, pd-l-*
mn-zero, mn-nano, mn-micro, mn-thin, mn-small, mn-regular, mn-medium, mn-semi, mn-big, mn-extra
mn-t-*, mn-r-*, mn-b-*, mn-l-*
mn-auto, mn-l-auto, mn-r-auto
gap-nano, gap-micro, gap-thin, gap-small, gap-regular, gap-medium, gap-semi, gap-big, gap-extra
```

## **Цвета фона**
```
bg-main, bg-second, bg-third, bg-fourth, bg-fifth
bg-black, bg-dark, bg-grey, bg-light, bg-white
bg-main-nano, bg-main-micro, bg-main-thin, bg-main-small, bg-main-medium, bg-main-semi, bg-main-big, bg-main-extra
bg-transp, bg-t-white, bg-t-grey, bg-t-darkgrey
bg-black-transp-5, bg-black-transp-10, bg-black-transp-15, bg-black-transp-20, bg-black-transp-25
bg-black-transp-30, bg-black-transp-35, bg-black-transp-40, bg-black-transp-45, bg-black-transp-50
bg-black-transp-55, bg-black-transp-60, bg-black-transp-65, bg-black-transp-70, bg-black-transp-75
bg-black-transp-80, bg-black-transp-85, bg-black-transp-90, bg-black-transp-95, bg-black-transp-100
bg-white-transp-5, bg-white-transp-10, bg-white-transp-15, bg-white-transp-20, bg-white-transp-25
bg-dark-transp-50
bg-red, bg-red-nice, bg-green, bg-green-nice, bg-orange, bg-orange-nice, bg-yellow, bg-yellow-nice
bg-youtube, bg-telegram, bg-twitter, bg-reddit, bg-instagram
bg-blur-extra, bg-blur-big, bg-blur-semi, bg-blur-medium, bg-blur-regular, bg-blur-small, bg-blur-thin
```

## **Цвета текста**
```
t-main, t-second, t-third, t-fourth, t-fifth
t-black, t-dark, t-grey, t-light, t-white
t-transp
t-white-transp-90, t-grey-transp-25
fill-main, fill-black, fill-dark, fill-grey, fill-light, fill-white
fill-t-white, fill-t-grey, fill-t-darkgrey, fill-transp
```

## **Границы (borders)**
```
br-zero, br-1px, br-2px, br-3px
br-solid, br-dash
br-t, br-r, br-b, br-l
br-b-2px, br-b-3px
br-black, br-dark, br-main, br-second, br-grey, br-light, br-white, br-red
br-grey-transp-50, br-grey-transp-25, br-grey-transp-10
br-black-transp, br-black-transp-5, br-black-transp-10, br-black-transp-15, br-black-transp-20, br-black-transp-25
br-white-transp, br-white-transp-5, br-white-transp-10, br-white-transp-15, br-white-transp-20
br-glow, br-glow-animation, br-pulse, br-spin
```

## **Border Radius**
```
radius-nano, radius-micro, radius-thin, radius-small, radius-regular, radius-medium, radius-semi, radius-big, radius-extra
radius-tl-*, radius-tr-*, radius-br-*, radius-bl-*
```

## **Типография**
```
h1, h2, h3, h4, h5, .h1, .h2, .h3, .h4, .h5
p-nano, p-micro, p-small, p-regular, p-medium, p-medium, p-semi, p-extra
font-main, font-second
t-bold, t-demi, t-semi, t-medium, t-regular, t-light
t-left, t-center, t-right
t-lh-05, t-lh-075, t-lh-1, t-lh-15, t-lh-2
uppercase, capitalize, underline, line-through
t-zero, t-noselect
t-truncate, t-trimmed, t-trim, t-trim-1, t-trim-2, t-trim-3
text-box-trim, text-box-trim-end, text-box-none, text-box-auto
```

## **Transitions и анимации**
```
transition-linear, transition-ease-in, transition-ease-out, transition-ease-in-out
transition-elastic, transition-spring, transition-boomerang, transition-slow-motion
transition-zoom, transition-fly-away, transition-squeeze, transition-staggered, transition-bounce
transition-sine-in, transition-sine-out, transition-sine-in-out
transition-quad-in, transition-quad-out, transition-quad-in-out
transition-cubic-in, transition-cubic-out, transition-cubic-in-out
transition-quart-in, transition-quart-out, transition-quart-in-out
transition-quint-in, transition-quint-out, transition-quint-in-out
transition-expo-in, transition-expo-out, transition-expo-in-out
transition-circ-in, transition-circ-out, transition-circ-in-out
transition-back-in, transition-back-out, transition-back-in-out
transition-elastic-in, transition-elastic-out, transition-elastic-in-out
transition-bounce-in, transition-bounce-out, transition-bounce-in-out
transition-timing-1, transition-timing-2, transition-timing-3, transition-timing-4
transition-timing-5, transition-timing-6, transition-timing-7, transition-timing-8
transition-delay-1, transition-delay-2, transition-delay-3, transition-delay-4
transition-delay-5, transition-delay-6, transition-delay-7, transition-delay-8
```

## **Hover эффекты**
```
hover-scale-0, hover-scale-1, hover-scale-2, hover-scale-3
hover-bg-main, hover-bg-second, hover-bg-third, hover-bg-fourth, hover-bg-fifth
hover-bg-white, hover-bg-black, hover-bg-light, hover-bg-dark
hover-bg-grey-transp-10, hover-bg-grey-transp-25, hover-bg-white-transp-30
hover-bg-main-semi, hover-bg-dark-transp-50
hover-fill-main, hover-fill-white, hover-fill-black
hover-t-white, hover-t-black, hover-t-underline
hover-br-transp, hover-br-l-dark, hover-br-grey
hover-translate-1, hover-rotate-1, hover-translateX-1, hover-combined-1, hover-easeInOut-1
```

## **Scrolling и overflow**
```
o-hidden, o-visible, o-auto, o-scroll
o-x-hidden, o-x-visible, o-x-auto, o-x-scroll
o-y-hidden, o-y-visible, o-y-auto, o-y-scroll
scroll-snap-type-x-mandatory, scroll-snap-type-y-mandatory
scroll-snap-align-start, scroll-snap-align-end, scroll-snap-align-center
scroll-snap-stop-normal, scroll-snap-stop-always
scroll-behavior-auto, scroll-behavior-smooth
scroll-hide
scroll-pd-extra, scroll-pd-big, scroll-pd-semi, scroll-pd-medium, scroll-pd-regular, scroll-pd-small, scroll-pd-thin, scroll-pd-micro
```

## **Тени**
```
bs-black-small
```

## **Утилиты**
```
cursor-pointer, cursor-move, cursor-text, cursor-help, cursor-wait
disabled, unactive, hide
no-events
rotate-90, rotate-180
object-fit-cover, object-fit-contain, object-fit-fill
```

## **Адаптивность**
```
mobile-only, desktop-only
mobile-w-100
@media breakpoints:
- mobile: max-width: 640px
- tablet: min-width: 641px and max-width: 1024px
- desktop: min-width: 1025px and max-width: 1440px
- widescreen: min-width: 1441px
```

## **Переменные CSS**
```
--main, --second, --third, --fourth, --fifth
--black, --dark, --grey, --light, --white
--extra, --big, --semi, --medium, --regular, --small, --thin, --micro, --nano
--font, --font-main, --font-second
```