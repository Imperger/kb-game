import { Canvas, createCanvas, registerFont } from 'canvas';

export interface BuildOptions {
  font: string; // font size and family
  color: string; // text color
  width: number; // max field width
}

export interface PopulatedLine {
  height: number;
  widths: number[];
}

type NodeCanvasRenderingContext2D = ReturnType<Canvas['getContext']>;

export class GameFieldBuilder {
  private text!: string;
  private _options!: BuildOptions;

  constructor() {
    registerFont('assets/Roboto-Regular.ttf', { family: 'Roboto' });
  }

  build(
    text: string,
    options: BuildOptions = {
      font: '32px Roboto',
      color: 'black',
      width: 800,
    },
  ) {
    this.text = text;
    this._options = options;

    return this.calculateTextPlacing();
  }

  /**
   *
   * @param ctx canvas context
   * @param begin index in text point to start of a word
   * @returns Text line height and an array containing the width of the string, including the corresponding character
   */
  private calculateLineMetrics(
    ctx: NodeCanvasRenderingContext2D,
    begin: number,
  ): PopulatedLine {
    let height = 0;
    const widths: number[] = [];

    for (let n = begin + 1; n <= this.text.length; ++n) {
      const metrics = ctx.measureText(this.text.substring(begin, n));
      height = Math.max(
        height,
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
      );

      const paddingRight = 5;
      if (metrics.width > this._options.width - paddingRight) {
        break;
      }

      widths.push(metrics.width);
    }

    // Prevent word breaking
    let nonBreakingEnd = begin + widths.length - 1;
    if (begin + widths.length < this.text.length) {
      while (nonBreakingEnd > begin && this.text[nonBreakingEnd] !== ' ')
        --nonBreakingEnd;
    }

    return {
      height,
      widths:
        nonBreakingEnd === begin
          ? widths
          : widths.slice(0, nonBreakingEnd - begin + 1),
    };
  }

  get options(): BuildOptions {
    return this._options;
  }

  private calculateTextPlacing(): PopulatedLine[] {
    const canvas = createCanvas(this._options.width, 600);
    const ctx = canvas.getContext('2d');

    this.setupContext(ctx);

    const ret: PopulatedLine[] = [];
    for (
      let n = 0;
      n < this.text.length;
      n += ret[ret.length - 1].widths.length
    ) {
      ret.push(this.calculateLineMetrics(ctx, n));
    }

    return ret;
  }

  private setupContext(ctx: NodeCanvasRenderingContext2D) {
    ctx.font = this._options.font;
    ctx.fillStyle = this._options.color;
  }
}
