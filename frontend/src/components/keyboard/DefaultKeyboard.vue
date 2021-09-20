<template>
<svg xmlns="http://www.w3.org/2000/svg"
    width="1070"
    height="240"
    role="presentation">

  <template v-for="(b, i) in numsLine">
    <Button :key="buttonKey(b)" :caption="b.caption" :pressed="isPressed(b.code)" :x="10 + 45 * i" :y="10" />
  </template>

  <Button :caption="'Backspace'" :pressed="isPressed('Backspace')" :x="595" :y="10" :width="120" :height="40" />

  <Button caption="Insert" :pressed="isPressed('Insert')" :x="735" :y="10" class="longCaption" />
  <Button caption="Home" :pressed="isPressed('Home')" :x="780" :y="10" class="longCaption" />
  <Button :caption="['Up', 'Page']" :pressed="isPressed('PageUp')" :x="825" :y="10" class="longCaption" />

  <Button :caption="['Lock', 'Num']" :pressed="isPressed('NumLock')" :x="885" :y="10" class="longCaption" />
  <Button caption="/" :pressed="isPressed('NumpadDivide')" :x="930" :y="10"/>
  <Button caption="*" :pressed="isPressed('NumpadMultiply')" :x="975" :y="10"/>
  <Button caption="-" :pressed="isPressed('NumpadSubtract')" :x="1020" :y="10"/>

  <Button caption="Tab" :pressed="isPressed('Tab')" :x="10" :y="55" :width="70"/>
  <template v-for="(b, i) in firstSymbolsLine">
    <Button :key="buttonKey(b)" :caption="b.caption" :pressed="isPressed(b.code)" :x="85 + 45 * i" :y="55" />
  </template>
  <Button :caption="layout[25].caption" :pressed="isPressed(layout[25].code)" :x="625" :y="55" :width="90"/>

  <Button caption="Delete" :pressed="isPressed('Delete')" :x="735" :y="55" class="longCaption" />
  <Button caption="End " :pressed="isPressed('End')" :x="780" :y="55" class="longCaption" />
  <Button :caption="['Down', 'Page']" :pressed="isPressed('PageDown')" :x="825" :y="55" class="longCaption" />

  <Button :caption="['Home', '7']" :pressed="isPressed('Numpad7')" :x="885" :y="55" class="longCaption" />
  <Button :caption="['↑', '8']" :pressed="isPressed('Numpad8')" :x="930" :y="55" class="longCaption" />
  <Button :caption="['Pg Up', '9']" :pressed="isPressed('Numpad9')" :x="975" :y="55" class="longCaption" />
  <Button caption="+" :pressed="isPressed('NumpadAdd')" :x="1020" :y="55" :height="85" />

  <Button caption="Caps lock" :pressed="isPressed('CapsLock')" :x="10" :y="100" :width="85" />
  <template v-for="(b, i) in secondSymbolsLine">
    <Button :key="buttonKey(b)" :caption="b.caption" :pressed="isPressed(b.code)" :x="100 + 45 * i" :y="100" />
  </template>
  <Button caption="Enter" :pressed="isPressed('Enter')" :x="595" :y="100" :width="120" />

  <Button :caption="['←', '4']" :pressed="isPressed('Numpad4')" :x="885" :y="100" />
  <Button caption="5" :x="930" :pressed="isPressed('Numpad5')" :y="100" />
  <Button :caption="['→', '6']" :pressed="isPressed('Numpad6')" :x="975" :y="100" />

  <Button caption="Shift" :pressed="isPressed('ShiftLeft')" :x="10" :y="145" :width="110" />
  <template v-for="(b, i) in thirdSymbolsLine">
    <Button :key="buttonKey(b)" :caption="b.caption" :pressed="isPressed(b.code)" :x="125 + 45 * i" :y="145" />
  </template>
  <Button caption="Shift" :pressed="isPressed('ShiftRight')" :x="575" :y="145" :width="140" />

  <Button caption="↑" :pressed="isPressed('ArrowUp')" :x="780" :y="145" />

  <Button :caption="['End', '1']" :pressed="isPressed('Numpad1')" :x="885" :y="145" />
  <Button :caption="['↓', '2']" :pressed="isPressed('Numpad2')" :x="930" :y="145" />
  <Button :caption="['Pg Dn', '3']" :pressed="isPressed('Numpad3')" :x="975" :y="145" class="longCaption" />
  <Button caption="Enter" :pressed="isPressed('NumpadEnter')" :x="1020" :y="145" class="longCaption" :height="85" />

  <Button caption="Ctrl" :pressed="isPressed('ControlLeft')" :x="10" :y="190" :width="80" />
  <Button caption="Alt" :pressed="isPressed('AltLeft')" :x="95" :y="190" :width="65" />
  <Button caption=" " :pressed="isPressed('Space')" :x="165" :y="190" :width="395" />
  <Button caption="Alt" :pressed="isPressed('AltRight')" :x="565" :y="190" :width="65" />
  <Button caption="Ctrl" :pressed="isPressed('ControlRight')" :x="635" :y="190" :width="80" />

  <Button caption="←" :pressed="isPressed('ArrowLeft')" :x="735" :y="190" />
  <Button caption="↓" :pressed="isPressed('ArrowDown')" :x="780" :y="190" />
  <Button caption="→" :pressed="isPressed('ArrowRight')" :x="825" :y="190" />

  <Button :caption="['Ins', '0']" :pressed="isPressed('Numpad0')" :x="885" :y="190" :width="85" />
  <Button :caption="['Del', '.']" :pressed="isPressed('NumpadDecimal')" :x="975" :y="190" />
</svg>
</template>

<style scoped>
.button {
  fill: #ecdcc6;
}

.caption {
  fill: #2c2c2c;
}

.captionTop {
  font-size: 0.8em;
}

.captionBottom {
  font-size: 0.8em;
}

.captionText {
  font-size: 0.8em;
}

.longCaption {
  font-size: 0.85em;
}
</style>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Button from './Button.vue';
import { ButtonLayout } from './layouts/button-layout';

@Component({
  components: {
    Button
  }
})
export default class DefaultKeyboard extends Vue {
  @Prop({ required: true, type: Array })
  private readonly layout!: ButtonLayout[];

  @Prop({ type: Array, default: () => [] })
  private readonly pressed!: string[];

  private buttonKey (button: ButtonLayout) {
    const key = typeof button.caption === 'string'
      ? button.caption
      : `${button.caption[0]}_${button.caption[1]}`;

    return `btn_${key}`;
  }

  private isPressed (code: string) {
    return this.pressed.includes(code);
  }

  // '`' - '='
  private get numsLine () {
    return this.layout.slice(0, 13);
  }

  // 'Q' - '}'
  private get firstSymbolsLine () {
    return this.layout.slice(13, 25);
  }

  // 'A' - '"'
  private get secondSymbolsLine () {
    return this.layout.slice(26, 37);
  }

  // 'Z' - '?'
  private get thirdSymbolsLine () {
    return this.layout.slice(37, 49);
  }
}
</script>
