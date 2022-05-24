<template>
<default-keyboard :layout="layout" :pressed="pressed" class="keyboard-background" />
</template>

<style scoped>
.keyboard-background {
    position: absolute;
    pointer-events: none;
    left: calc(-1070px * 3);
    transform: scale(4, 4) rotate(15deg);
    animation: 60s linear 1s infinite running throughScreen;
}

@keyframes throughScreen {
from {
    left: calc(-1070px * 3);
    top: -800px;
    }

to {
    left: calc(100% + 1070px * 2);
    top: 200%;
    }
}
</style>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import DefaultKeyboard from '@/components/keyboard/DefaultKeyboard.vue';
import { layout as enLayout } from '@/components/keyboard/layouts/en';
import { ButtonLayout } from './keyboard/layouts/button-layout';

@Component({
  components: {
    DefaultKeyboard
  }
})
export default class KeyboardBackground extends Vue {
  @Prop({ type: Boolean, default: true })
  private readonly interactive!: boolean;

  private readonly pressed: string[] = [];

  @Watch('interactive')
  resetStateIfNoninteractive (x: boolean, old: boolean): void {
    if (!x) {
      this.pressed.splice(0);
    }
  }

  private readonly keypressHandler = (e: KeyboardEvent) => {
    if (!this.interactive) {
      return;
    }

    const idx = this.pressed.findIndex(x => x === e.code);

    if (idx === -1) {
      this.pressed.push(e.code);
    }
  };

  private readonly keyupHandler = (e: KeyboardEvent) => {
    if (!this.interactive) {
      return;
    }

    const idx = this.pressed.findIndex(x => x === e.code);

    if (idx >= 0) {
      this.pressed.splice(idx, 1);
    }
  };

  mounted (): void {
    document.addEventListener('keydown', this.keypressHandler);
    document.addEventListener('keyup', this.keyupHandler);
  }

  destroyed (): void {
    document.removeEventListener('keydown', this.keypressHandler);
    document.removeEventListener('keyup', this.keyupHandler);
  }

  get layout (): ButtonLayout[] {
    return enLayout;
  }
}
</script>
