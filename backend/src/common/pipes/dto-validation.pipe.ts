import { PipeTransform, ArgumentMetadata, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import op from 'object-path';

import { DtoValidationFailedException } from '../common-exception';

import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class DtoValidationPipe implements PipeTransform<any> {
  constructor(private readonly logger: LoggerService) {}

  async transform(
    value: unknown,
    metadata: ArgumentMetadata
  ): Promise<unknown> {
    const { metatype } = metadata;

    if (metatype && metatype.name.endsWith('Dto')) {
      if (!value) {
        throw new DtoValidationFailedException('No data submitted');
      }
    } else {
      return value;
    }

    const object = plainToClass(metatype, value);

    // Request without ContentType: application/json
    if (typeof value !== 'object') {
      throw new DtoValidationFailedException('Dto validation failed: Expected object');
    }

    const errors = await validate(object);
    if (errors.length > 0) {
      const error = `Dto validation failed: ${JSON.stringify(
        this.buildError(errors)
      )}`;

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
