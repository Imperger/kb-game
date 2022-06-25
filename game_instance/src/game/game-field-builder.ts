import { Canvas, createCanvas, registerFont } from 'canvas';

export interface BuildOptions {
  font: string; // font size and family
  color: string; // text color
  width: number; // max field width
}

export interface PopulatedLine {
  begin: number;
  end: number;
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
   * @returns A substring that does not exceed the given width and
   * an array of widths from the beginning to each character
   */
  private calculateLineMetrics(
    ctx: NodeCanvasRenderingContext2D,
    begin: number,
  ): PopulatedLine {
    let height = 0;
    const widths: number[] = [];

    // Trim space at begin
    if (this.text[begin] === ' ') {
      ++begin;
    }

    let n = begin + 1;

    for (; n <= this.text.length; ++n) {
      const metrics = ctx.measureText(this.text.substring(begin, n));
      height = Math.max(
        height,
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
      );

      const paddingRight = 5;
      if (metrics.width <= this._options.width - paddingRight) {
        widths.push(metrics.width);
      } else {
        break;
      }
    }

    // Prevent word breaking
    if (--n < this.text.length) {
      for (; n >= 0 && !' '.includes(this.text[n]); --n);
    }

    return { begin, end: n, height, widths: widths.slice(0, n - begin) };
  }

  get options(): BuildOptions {
    return this._options;
  }

  private calculateTextPlacing(): PopulatedLine[] {
    const canvas = createCanvas(this._options.width, 600);
    const ctx = canvas.getContext('2d');

    this.setupContext(ctx);

    let n = 0;
    const ret: PopulatedLine[] = [];
    while (n < this.text.length) {
      ret.push(this.calculateLineMetrics(ctx, n));

      n = ret[ret.length - 1].end;
    }

    return ret;
  }

  private setupContext(ctx: NodeCanvasRenderingContext2D) {
    ctx.font = this._options.font;
    ctx.fillStyle = this._options.color;
  }
}
