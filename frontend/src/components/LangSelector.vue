<template>
<MySelect :selected="selected" @selected="emitSelected" :items="langs" v-on="$listeners" class="langSelector">
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
import { Component, Emit, Model, Vue, Prop } from 'vue-property-decorator';
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
  @Model('selected', { type: Number, default: 0 })
  private readonly selected!: number;

  @Prop({ required: true })
  private readonly languages!: string[];

  @Emit('select')
  private select () {}

  @Emit('selected')
  private emitSelected (index: number) { }

  private flagIcon (name: string): string {
    return require(`@/assets/flags/${name}`);
  }

  private get langs () {
    return this.languages.map(x => ({ key: x, lang: x, flag: `${x}.svg`, caption: x }));
  }
}
</script>
