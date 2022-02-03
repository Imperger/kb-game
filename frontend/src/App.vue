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

@Component
export default class App extends Mixins(ApiServiceMixin, StoreMixin) {
  public created (): void {
    this.api.setAccessToken(this.App.authToken);
    this.setupLocale();
    this.loginPageIfNotAuth();
  }

  private async setupLocale (): Promise<void> {
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

  private loginPageIfNotAuth () {
    this.api.unauthorizeHandler(error => {
      if (this.$route.name !== 'Login') {
        this.$router.push({ name: 'Login' });
      }

      return Promise.reject(error);
    });
  }
}

</script>
