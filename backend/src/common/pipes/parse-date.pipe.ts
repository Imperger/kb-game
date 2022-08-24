import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

import { isValidDate } from '../is-valid-date';

@Injectable()
export class ParseDatePipe implements PipeTransform<any, Date> {
  transform(value: any): Date {
    const date = new Date(value);

    if (!isValidDate(date)) {
      throw new BadRequestException('Invalid date');
    }

    return date;
  }
}
