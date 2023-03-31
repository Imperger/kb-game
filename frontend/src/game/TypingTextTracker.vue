<template>
<v-row justify="center" class="type-text">
  <v-img ref="img" :src="textImage" :style="{ top: `${-innerScroll}px` }" content-class="lalka" class="text-img" contain />
  <div class="carriage" :style="{ left: `${absoluteCarriage}px` }"></div>
</v-row>
</template>

<style>
.v-image__image--contain {
  background-position-y: top !important;
}
</style>

<style scoped>
.type-text {
  position: relative;
  height: 200px;
  overflow: hidden;
  border: 1px solid gray;
}

.carriage {
  position: absolute;
  top: 0;
  width: 3px;
  height: 40px;
  background-color: #32cb00;
}
</style>

<script lang="ts">
import { interval, fromEvent, Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { Component, Vue, Prop, Watch, Ref } from 'vue-property-decorator';

interface VImg {
  $el: { clientWidth: number }
}

@Component
export default class TypingTextTracker extends Vue {
  @Ref('img')
  public readonly img!: VImg;

  @Prop({ required: true, type: String })
  public readonly textImage!: string;

  // Scroll measured in text rows
  @Prop({ type: Number, default: 0 })
  public readonly scroll!: number;

  @Prop({ type: Number, default: 0 })
  public readonly carriage!: number;

  public innerScroll = 0;

  private readonly imgNativeWidth = 800;

  private readonly imgNativeLineHeight = 50;

  private $resizeListener!: Subscription;

  private clientWidth = 0;

  public mounted (): void {
    this.clientWidth = this.img?.$el.clientWidth;

    this.$resizeListener = fromEvent(window, 'resize')
      .subscribe(() => {
        this.clientWidth = this.img?.$el.clientWidth;
      });
  }

  public destroyed (): void {
    this.$resizeListener.unsubscribe();
  }

  @Watch('scroll')
  scrollChanged (x: number, old: number): void {
    const steps = 10;
    const step = this.imgScale() * this.imgNativeLineHeight * (x - old) / steps;

    interval(50)
      .pipe(take(steps))
      .subscribe(x => (this.innerScroll = (this.imgScale() * this.imgNativeLineHeight) * old + (x + 1) * step));
  }

  get absoluteCarriage (): number {
    return Math.round(this.imgScale() * this.carriage);
  }

  imgScale (): number {
    return (this.clientWidth ?? this.imgNativeWidth) / this.imgNativeWidth;
  }
}
</script>
