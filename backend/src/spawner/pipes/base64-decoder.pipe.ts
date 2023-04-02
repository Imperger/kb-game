import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class Base64DecoderPipe implements PipeTransform {
  transform(str: string, _metadata: ArgumentMetadata): string {
    return Buffer.from(str, 'base64').toString();
  }
}
