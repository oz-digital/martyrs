import merge from 'lodash.merge';

class I18nManager {
  constructor() {
    this.moduleLocales = new Map();
    this.overrides = new Map();
    this.extensions = new Map();
  }

  register(moduleName, locales) {
    if (typeof moduleName !== 'string' || !this.isValidLocales(locales)) {
      throw new TypeError('Invalid arguments for register()');
    }
    this.moduleLocales.set(moduleName, locales);
    return this;
  }

  extend(moduleName, locales) {
    if (!this.isValidLocales(locales)) throw new TypeError('Invalid locales for extend()');
    const existing = this.extensions.get(moduleName) || {};
    merge(existing, locales);
    this.extensions.set(moduleName, existing);
    return this;
  }

  override(moduleName, locales) {
    if (!this.isValidLocales(locales)) throw new TypeError('Invalid locales for override()');
    const existing = this.overrides.get(moduleName) || {};
    merge(existing, locales);
    this.overrides.set(moduleName, existing);
    return this;
  }

  getMessages(locale) {
    const result = {};

    for (const [, moduleLocales] of this.moduleLocales) {
      if (moduleLocales[locale]) {
        merge(result, moduleLocales[locale]);
      }
    }

    for (const [, ext] of this.extensions) {
      if (ext[locale]) {
        merge(result, ext[locale]);
      }
    }

    for (const [, override] of this.overrides) {
      if (override[locale]) {
        merge(result, override[locale]);
      }
    }

    return result;
  }

  getAllMessages() {
    const allLocales = new Set();

    for (const moduleLocales of this.moduleLocales.values()) {
      Object.keys(moduleLocales).forEach(locale => allLocales.add(locale));
    }

    const messages = {};

    for (const locale of allLocales) {
      messages[locale] = this.getMessages(locale);
    }

    return messages;
  }

  isValidLocales(obj) {
    return this.isObject(obj) && Object.values(obj).every(this.isObject);
  }

  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}

export const i18nManager = new I18nManager();
export default I18nManager;
