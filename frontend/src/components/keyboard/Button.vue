<template>
<g>
    <rect :x="x" :y="y" rx="5" ry="5" :width="width" :height="height" class="button" :class="{ pressed }" />
    <text v-if="isSingleline" :x="captionHOffset(x)" :y="captionVOffset(y)" class="caption" :class="{ captionText: isLongWord }">{{ caption }}</text>
    <template v-else>
        <text :x="captionHOffset(x)" :y="captionTopVOffset(y)" class="captionTop">{{ caption[1] }}</text>
        <text :x="captionHOffset(x)" :y="captionBottomVOffset(y)" class="captionBottom">{{ caption[0] }}</text>
    </template>
</g>
</template>

<style scoped>
.button {
  fill: #ecdcc6;
}

.pressed {
  fill: #e9b367;
}

.caption {
  fill: #2c2c2c;
}

.captionTop {
  font-size: 0.8em;;
}

.captionBottom {
  font-size: 0.8em;;
}

.captionText {
  font-size: 0.8em;;
}
</style>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class Button extends Vue {
    @Prop({ required: true, type: [String, Array] })
    private readonly caption!: string | string[];

    @Prop({ type: Boolean })
    private readonly pressed!: boolean;

    @Prop({ type: Number, default: 0 })
    private readonly x!: number;

    @Prop({ type: Number, default: 0 })
    private readonly y!: number;

    @Prop({ type: Number, default: 40 })
    private readonly width!: number;

    @Prop({ type: Number, default: 40 })
    private readonly height!: number;

    private get isSingleline () {
      return typeof this.caption === 'string';
    }

    private captionHOffset (x: number) {
      return x + (this.isLongWord ? 4 : 12);
    }

    private captionVOffset (y: number) {
      return y + this.height / 2 + 6;
    }

    private captionTopVOffset (y: number) {
      return y + this.height / 3;
    }

    private captionBottomVOffset (y: number) {
      return y + 2 * (this.height / 3) + 6;
    }

    private get isLongWord () {
      return typeof this.caption === 'string'
        ? this.caption.length > 3
        : this.caption[0].length > 1;
    }
}
</script>
