<template>
<v-select :value="locale" :items="locales" @change="changeLanguage">
</v-select>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator';

import { AvailableLocales, locales } from '@/locales/available-locales';
import { StoreMixin } from '@/mixins';

@Component
export default class AppLanguageSelector extends Mixins(StoreMixin) {
  async changeLanguage (language: string): Promise<void> {
    await this.Settings.switchLocale(language as AvailableLocales);
    this.$root.$validator.locale = language;
  }

  get locales (): string[] {
    return locales;
  }

  get locale (): string {
    return this.$root.$validator.locale;
  }
}
</script>
