<template>
<MySelect :items="languages" v-on="$listeners" class="langSelector">
    <template v-slot="{ item }">
        <div class="item">
            <img :src="flagIcon(item.flag)" class="flagImg" />
            <div>{{ item.caption }}</div>
        </div>
    </template>
</MySelect>
</template>

<style scoped>
.item {
    display: flex;
    align-items: center;
}

.flagImg {
    margin-right: 5px;
    width: 50px;
}
</style>

<script lang="ts">
import { Component, Emit, Vue, Prop } from 'vue-property-decorator';
import MySelect from './MySelect.vue';

export interface LangItem {
    key: string;
    flag: string;
    lang: string;
    caption: string;
}

@Component({
  components: { MySelect }
})
export default class LangSelector extends Vue {
  @Emit('select')
  private select () {}

  private flagIcon (name: string): string {
    return require(`@/assets/flags/${name}`);
  }

  private get languages () {
    return [
      { key: 'ru', flag: 'ru.svg', lang: 'ru', caption: 'ru' },
      { key: 'en', flag: 'us.svg', lang: 'en', caption: 'en' }];
  }
}
</script>
