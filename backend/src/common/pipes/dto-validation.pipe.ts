import { PipeTransform, ArgumentMetadata, BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import * as op from 'object-path';

@Injectable()
export class DtoValidationPipe implements PipeTransform<any> {
  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    if (!value) {
      throw new BadRequestException('No data submitted');
    }

    const { metatype } = metadata;
    if (!(metatype && metatype.name.endsWith('Dto'))) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new HttpException({ message: 'Input data validation failed', errors: this.buildError(errors) }, HttpStatus.BAD_REQUEST);
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