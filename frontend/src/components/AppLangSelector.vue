<template>
<LangSelector  @select="select" />
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import LangSelector, { LangItem } from './LangSelector.vue';

@Component({
  components: { LangSelector }
})
export default class AppLangSelector extends Vue {
  private select (item: LangItem) {
    console.log(`Switching app lang to ${item.lang}`);
  }
}
</script>
