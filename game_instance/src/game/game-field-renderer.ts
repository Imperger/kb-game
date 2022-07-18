import { promisify } from 'util';
import { createCanvas } from 'canvas';

import { BuildOptions, PopulatedLine } from './game-field-builder';

interface ContentDescription {
  text: string;
  description: PopulatedLine[];
}
interface RenderOptions extends BuildOptions {
  lineHeight: number; // For tuning distance between lines
}

type Base64Image = string;

export class GameFieldRenderer {
  private options!: RenderOptions;

  render(
    content: ContentDescription,
    options: RenderOptions,
  ): Promise<Base64Image> {
    this.options = options;

    const height = this.options.lineHeight * content.description.length;
    const canvas = createCanvas(options.width, height);
    const ctx = canvas.getContext('2d');

    this.setupContext(ctx);

    let y = this.options.lineHeight >> 1;
    let begin = 0;
    for (const line of content.description) {
      const end = begin + line.widths.length;
      ctx.fillText(content.text.substring(begin, end), 0, y);
      begin = end;
      y += this.options.lineHeight;
    }

    return promisify<string, Base64Image>(canvas.toDataURL.bind(canvas))(
      'image/png',
    );
  }

  private setupContext(ctx: any) {
    ctx.font = this.options.font;
    ctx.fillStyle = this.options.color;
  }
}
