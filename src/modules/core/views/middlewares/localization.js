function setLocale(to, from, next) {
  const locale = to.params.locale;

  if (locale && this.$i18n.availableLocales.includes(locale)) {
    console.log('true');
    app.config.globalProperties.$i18n.locale = locale;
    return next();
  }

  next();
}

export { setLocale };
