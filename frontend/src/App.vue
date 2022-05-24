<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>
#app {
  display: flex;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100vh;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>

<script lang="ts">
import { Component, Emit, Mixins, Model, Prop } from 'vue-property-decorator';

import { ApiServiceMixin, StoreMixin } from '@/mixins';
import { AvailableLocales } from '@/locales/available-locales';
import { cachedLocale } from '@/locales/cached-locale';
import { isRejectedResponse } from './services/api-service/rejected-response';

@Component
export default class App extends Mixins(ApiServiceMixin, StoreMixin) {
  public created (): void {
    this.api.auth.accessToken = this.App.accessToken;
    this.loginPageIfNotAuth();

    this.setupLocale();
    this.tryLogin();
  }

  async setupLocale (): Promise<void> {
    const cached = cachedLocale();
    if (cached) {
      await this.Settings.switchLocale(cached as AvailableLocales);
    } else {
      const browserLocale = navigator.language as AvailableLocales;
      if (Object.values(AvailableLocales).includes(browserLocale)) {
        await this.Settings.switchLocale(browserLocale);
      } else {
        await this.Settings.switchLocale(Object.values(AvailableLocales)[0]);
      }
    }
  }

  /**
  * Trying auto login when open app
  */
  async tryLogin (): Promise<void> {
    if (this.App.hasToken) {
      const me = await this.api.user.currentUserInfo();

      if (isRejectedResponse(me)) {
        this.App.resetToken();
      } else {
        this.App.setUser(me);
      }
    }

    this.App.Initialize();
  }

  /**
   * Watched for unauthorized response from any api request
   * and redirect to login page if any was happened
   */
  loginPageIfNotAuth (): void {
    this.api.auth.unauthorizeHandler(_ => {
      this.App.resetToken();
      if (this.$route.name !== 'Login') {
        this.$router.push({ name: 'Login' });
      }
    });
  }
}

</script>
