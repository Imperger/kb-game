<template>
<DefaultKeyboard :layout="layout" :pressed="pressed" class="backgroundComponent" />
</template>

<style scoped>
.backgroundComponent {
    position: absolute;
    transform: scale(2, 2) translate(-150%, -150%) rotate(35deg);
    animation: 60s linear 1s infinite running slidein;
}

@keyframes slidein {
from {
    transform: scale(4, 4) translate(-55%, -50%) rotate(15deg);
    }

to {
    transform: scale(4, 4) translate(45%, 115%) rotate(15deg);
    }
}
</style>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import DefaultKeyboard from '@/components/keyboard/DefaultKeyboard.vue';
import { layout as enLayout } from '@/components/keyboard/layouts/en';

@Component({
  components: {
    DefaultKeyboard
  }
})
export default class KeyboardBackground extends Vue {
    @Prop({ type: Boolean, default: true })
    private readonly interactive!: boolean;

    private readonly pressed: string[] = [];

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

    public mounted (): void {
      document.addEventListener('keydown', this.keypressHandler);
      document.addEventListener('keyup', this.keyupHandler);
    }

    public destroyed (): void {
      document.removeEventListener('keydown', this.keypressHandler);
      document.removeEventListener('keyup', this.keyupHandler);
    }

    private get layout () {
      return enLayout;
    }
}
</script>
