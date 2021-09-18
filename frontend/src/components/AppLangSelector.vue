<template>
<LangSelector v-model="selectedLanguage" :languages="languages"  @select="select" />
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator';

import LangSelector, { LangItem } from './LangSelector.vue';
import { AvailableLocales, locales } from '@/locales/available-locales';
import StoreMixin from '@/mixins/store-mixin';
import { cachedLocale } from '@/locales/cached-locale';

@Component({
  components: { LangSelector }
})
export default class AppLangSelector extends Mixins(StoreMixin) {
  private selectedLanguage = 0;

  public async beforeMount (): Promise<void> {
    const cached = cachedLocale();
    const selectedLocaleIdx = this.languages.findIndex(x => x === cached);

    if (selectedLocaleIdx >= 0) {
      this.selectedLanguage = selectedLocaleIdx;

      this.$root.$validator.locale = cached as string;
    }
  }

  private async select (item: LangItem) {
    if (item.lang !== this.Settings.locale) {
      await this.Settings.switchLocale(item.lang as AvailableLocales);
      this.$root.$validator.locale = item.lang;
    }
  }

  private get languages () {
    return locales;
  }
}
</script>
