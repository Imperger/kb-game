import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { AvailableLocales } from '@/locales/available-locales';
import { switchLocale } from '@/i18n';

@Module({ name: 'app' })
export default class App extends VuexModule {
    public authToken = '';

    @Mutation
    public setToken (token: string): void {
      this.authToken = token;
    }

    @Mutation
    public resetToken (): void {
      this.authToken = '';
    }

    public get hasToken (): boolean {
      return this.authToken.length > 0;
    }
}
