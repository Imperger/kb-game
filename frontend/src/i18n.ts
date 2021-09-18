import Vue from 'vue';
import VueI18n from 'vue-i18n';

import { AvailableLocales } from '@/locales/available-locales';

Vue.use(VueI18n);

const i18n = new VueI18n({
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: {}
});

export const switchLocale = async (locale: AvailableLocales): Promise<boolean> => {
  if (i18n.locale === locale) {
    return true;
  }

  if (Object.keys(i18n.getLocaleMessage(locale)).length > 0) {
    i18n.locale = locale;
    return true;
  }

  try {
    const message = await import(/* webpackChunkName: "lang-[request]" */ `@/locales/${locale}.json`);
    i18n.setLocaleMessage(locale, message.default);
    i18n.locale = locale;

    return true;
  } catch (e: unknown) {
    return false;
  }
};

export default i18n;
