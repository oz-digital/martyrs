Core сессия

  - В Core добавляем класс Session (например core/classes/session.js). Создаем экземпляр вместе с приложением, держим в нем текущее состояние пользователя (token, роли, доступы) и умеет: прочитать cookie/SSR state,
  выдать геттеры (isAuthenticated, getAccesses), эмитить события (onChange). Сам Core создаёт Session при старте, а модуль Auth остаётся “поставщиком” — после логина/логаута Auth вызывает Session.set(...)
  и Session.clear(). Таким образом, Core не зависит от Auth, но предоставляет единый источник истины.

  Core client

  - Новый модуль martyrs/src/modules/core/client.js переносит код из globals/views/classes/globals.app.js: createUniversalApp, создание приложения, router guards, moduleRegistry, SSR-hydration. Этот
  модуль единственный помечается критическим в global.config.js.
  - src/client.js импортирует createUniversalApp из @martyrs/src/modules/core/client.js. Никаких “bootstrap” в именах.

  Globals/UI

  - martyrs/src/modules/globals/globals.client.js оставляем чисто для UI: локали, плагины, layout, стор globals. Если нужно, Core может сразу вызвать store.addStore('globals', storeGlobals), но
  инициализация UI остаётся в модуле.
  - Плагины (alert, popup, date-picker) и mixins остаются в globals — Core их не трогает.

  Auth

  - Из auth/views/store/auth.js выделяем функции для работы с Session: hydrateFromCookie, resetState, logoutWithSession. Core при старте вызывает Session.hydrate(...), а когда модуль Auth грузится, он
  проверяет if (!store.auth) и, после добавления стора, подписывается на события Session, чтобы синхронизировать UI.
  - Auth по-прежнему поставляет маршруты, UI и собственные сторы.

  Organizations/Backoffice

  - Их initialize остаются без изменений: регистрируют роуты и сторы при ленивой загрузке. В Core только меняется список критических модулей (теперь ['core']), а зависимости dependencies: ['auth']
  продолжают работать через moduleRegistry.

  Локализация

  - Core при старте вызывает getLocales() и сразу выставляет язык из SSR/браузера, чтобы первый рендер был на правильном языке. Регистрация словарей (i18nManager.register('globals', ...), auth/locales)
  остаётся в соответствующих модулях; Core лишь гарантирует, что i18n уже создан и настроен.

  Store

  - Core создаёт основной store (useStore()), устанавливает SSR state, синхронизирует Session. Остальные модули по-прежнему делают store.addStore(...) при инициализации. Никакой ломки текущей архитектуры.

  Если ок – могу расписать конкретные изменения по файлам.

▌ да все отлично - напиши это в виде плана и задачи

> Задача Core / Session

  - Ввести модуль @martyrs/src/modules/core/client.js (критический) и перенести туда текущее приложение из globals/views/classes/globals.app.js: создание Vue/SSR app, moduleRegistry, router guards, SSR
  render/hydrate.
  - Создать сервис core/session.js, который хранит состояние сессии (token, roles, accesses), умеет гидратить данные из cookie/SSR и рассылает события. Core инициализирует Session при старте, модуль Auth
  после логина/логаута обновляет Session.
  - В Core сразу инициализировать store (useStore), применить SSR‑state и подключить Session; остальные модульные сторы продолжают регистрироваться через store.addStore.
  - Локализацию подключить в Core: получить i18n через getLocales() и выставить язык (из SSR или браузера) до первого рендера. Регистрация словарей остаётся в модулях.
  - globals преобразовать в чистый UI‑модуль: оставить плагины, миксины, layout, стор globals, роуты 401/404; убрать оттуда системную инициализацию (store/router/env) — этим занимается Core.
  - В auth выделить helpers, работающие с Session (hydrate/logout), добавить защиту от повторной регистрации стора в initialize, остальное оставить без изменений.
  - Удалить жёсткий список критических модулей (['globals','auth','organizations','backoffice']) и пометить критическим только core в global.config.js; зависимости (dependencies: ['auth'] и т.д.)
  продолжают работать через конфиг.

  План внедрения

  1. Создать core/client.js, перенести туда код из globals.app.js, обновить src/client.js и global.config.js (critical → core).
  2. Реализовать core/session.js, подключить к гидратации/SSR и токенам, обновить auth для привязки к Session.
  3. Привести globals.client.js к UI‑роли, оставить только плагины/локали/404/401; убедиться, что остальные модули продолжают работать.
  4. Протестировать SSR и клиент: язык, авторизация (cookie), ленивые модули auth, backoffice, organizations.

