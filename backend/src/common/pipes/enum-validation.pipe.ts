import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';

export function EnumValidationPipe<TEnum>(e: TEnum): any {
  @Injectable()
  class EnumValidationPipe implements PipeTransform<any, Date> {
    transform(value: any, metadata: ArgumentMetadata): Date {
      for(const key in e) {
        if (e[key] === value) {
          return value;
        }
      }

      throw new BadRequestException(`${metadata.type} property '${metadata.data}' has an invalid value`);
    }
  }

  return EnumValidationPipe;
}
