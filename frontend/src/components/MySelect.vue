<template>
<div @blur="lostFocus" tabindex="0" class="mySelectComponent">
    <div v-if="hasItems" @click="expand" class="currentSelected">
        <slot :item="selectedItem">{{ selectedItem }}</slot>
    </div>
    <div v-if="expanded" class="selectList">
        <div :key="item.key" v-for="(item, i) in items" @click="select(i)" class="item">
            <slot :item="item">{{ item }}</slot>
        </div>
    </div>
</div>
</template>

<style scoped>
.mySelectComponent {
    cursor: pointer;
    min-width: 50px;
    min-height: 20px;
    padding: 2px 5px;
    border: 1px solid #FF2406;
    font-size: 1.2em;
}

.currentSelected {
    width: 100%;
}

.selectList {
    position: absolute;
}

.item {
    padding: 2px 0;
}
</style>

<script lang="ts">
import { Component, Emit, Model, Vue, Prop } from 'vue-property-decorator';

@Component
export default class MySelect extends Vue {
    @Model('selected', { type: Number, default: 0 })
    private readonly selected!: number;

    @Prop({ required: true, type: Array })
    private readonly items!: unknown[];

    @Emit('select')
    private emitSelect (item: unknown) { }

    @Emit('selected')
    private emitSelected (idx: number) {}

    private expanded = false;

    private expand () {
      this.expanded = true;
    }

    private select (index: number) {
      this.expanded = false;

      this.emitSelected(index);
      this.emitSelect(this.items[index]);
    }

    private lostFocus () {
      this.expanded = false;
    }

    private get hasItems () {
      return this.items.length > 0;
    }

    private get selectedItem () {
      return this.items[this.selected];
    }
}
</script>
