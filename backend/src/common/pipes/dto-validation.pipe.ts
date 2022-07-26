import * as op from 'object-path';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { PipeTransform, ArgumentMetadata, Injectable } from '@nestjs/common';

import { DtoValidationFailedException } from '../common-exception';
import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class DtoValidationPipe implements PipeTransform<any> {
  constructor(private readonly logger: LoggerService) {}

  async transform(
    value: unknown,
    metadata: ArgumentMetadata
  ): Promise<unknown> {
    if (!value) {
      throw new DtoValidationFailedException('No data submitted');
    }

    const { metatype } = metadata;
    if (!(metatype && metatype.name.endsWith('Dto'))) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      const error = `Dto validation failed: ${this.buildError(errors)}`;

      this.logger.warn(error);

      throw new DtoValidationFailedException(error);
    }
    return value;
  }

  private buildError(errors) {
    const result = {};
    errors.forEach(el => {
      const prop = el.property;
      Object.entries(el.constraints).forEach(([constraint, msg]) => {
        op.set(result, `${prop}.${constraint}`, msg);
      });
    });
    return result;
  }
}
