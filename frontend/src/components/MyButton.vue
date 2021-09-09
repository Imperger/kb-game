<template>
<button @click="onClick" :disabled="isDisabled" class="button">
    <slot></slot>
</button>
</template>

<style scoped>
.button {
    display: flex;
    border: none;
    background-color: #FF2406;
    position: relative;
    border-radius: 5px;
    padding: 11px 41px;
    font-size: 1.2em;
}

.button::after {
    content: "";
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: #ff7575;
    opacity: 0;
    transition: all 0.6s;
}

.button:active::after {
    left: 50%;
    top: 50%;
    width: 0;
    height: 0;
    opacity: 1;
    transition: 0s
}
</style>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import UniqueIdMixin from '@/mixins/unique-id-mixin';

interface ConcreteListener {
    fns: () => Promise<void>;
}

@Component
export default class MyButton extends Mixins(UniqueIdMixin) {
    @Prop({ type: Boolean, default: null })
    private disabled!: boolean | null;

    private disabledBtn = false;

    private async onClick () {
      this.disabledBtn = true;

      await (this.$listeners.click as unknown as ConcreteListener)?.fns();

      this.disabledBtn = false;
    }

    private get isDisabled () {
      return this.disabled === null ? this.disabledBtn : this.disabled;
    }
}
</script>
