import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { AvailableLocales } from '@/locales/available-locales';
import { switchLocale } from '@/i18n';

@Module({ name: 'settings' })
export default class Settings extends VuexModule {
    public locale: AvailableLocales | null = null;

    @Mutation
    public setLocale (locale: AvailableLocales): void {
      this.locale = locale;
    }

    @Action
    public async switchLocale (locale: AvailableLocales): Promise<boolean> {
      if (await switchLocale(locale)) {
        this.setLocale(locale);
        return true;
      }

      return false;
    }
}
