<template>
<div class="myTextInputComponent">
    <label
    class="label"
    :class="{'label-active': labelActive}"
    :for="id">{{ label }}</label>
    <input :id="id"
    class="input"
    :type="type"
    :value="value"
    @input="changed"
    @focus="focusChanged(true)"
    @blur="focusChanged(false)"/>
</div>
</template>

<style scoped>
.myTextInputComponent {
    position: relative;
    display: flex;
    margin: 13px 0;
}

.input {
    border: 1px solid #FF2406;
    font-size: 1.2em;
    padding: 5px 8px;
}

.input:focus {
    outline: none;
    border: 1px solid red;
}

.label {
    position: absolute;
    top: 8px;
    margin-left: 13px;
    pointer-events: none;
    transition: transform 0.15s;
}

.label-active {
    transform: translateY(-16px) scale(0.75);
    pointer-events: auto;
    background: linear-gradient(rgba(0,0,0,0) 7px 7px, rgba(255,255,255,1) 7px 10px, rgba(0,0,0,0) 10px )
}
</style>

<script lang="ts">
import { Component, Emit, Mixins, Model, Prop } from 'vue-property-decorator';

import UniqueIdMixin from '@/mixins/unique-id-mixin';

interface InputValue {
    target: { value: string };
}

@Component
export default class MyTextInput extends Mixins(UniqueIdMixin) {
  @Model('input')
  private value!: string;

  private changed (e: InputEvent & InputValue) { this.$emit('input', e.target?.value); }

  @Prop(Boolean)
  private password!: boolean;

  @Prop()
  private label!: string;

  @Emit('focus')
  private focus (): void {}

  private focused = false;

  private id!: string;

  public created (): void {
    this.id = `textInput_${this.generateId()}`;
  }

  private get type () {
    return this.password ? 'password' : 'text';
  }

  private get labelActive () {
    return this.value?.length > 0 || this.focused;
  }

  private focusChanged (focus: boolean) {
    if (focus) {
      this.focus();
    }

    this.focused = focus;
  }
}
</script>
