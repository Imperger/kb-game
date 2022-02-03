<template>
<button @click="onClick" :disabled="isDisabled" type="button" class="myButtonComponent">
    <slot></slot>
</button>
</template>

<style scoped>
.myButtonComponent {
    display: flex;
    border: none;
    background-color: #FF2406;
    position: relative;
    border-radius: 5px;
    padding: 11px 41px;
    font-size: 1.2em;
}

.myButtonComponent::after {
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

.myButtonComponent:active::after {
    left: 50%;
    top: 50%;
    width: 0;
    height: 0;
    opacity: 1;
    transition: 0s
}
</style>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

interface ConcreteListener {
    fns: (e: MouseEvent) => Promise<void>;
}

@Component
export default class MyButton extends Vue {
    @Prop({ type: Boolean, default: null })
    private disabled!: boolean | null;

    private disabledBtn = false;

    private async onClick (e: MouseEvent) {
      this.disabledBtn = true;

      await (this.$listeners.click as unknown as ConcreteListener)?.fns(e);

      this.disabledBtn = false;
    }

    private get isDisabled () {
      return this.disabled === null ? this.disabledBtn : this.disabled;
    }
}
</script>
