import { plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

import { ConfigSchema } from './config-schema';
import MapTree from '../common/util/map-tree';

export class ConfigValidator {
  validate<T>(config: T) {
    const object = plainToClass(ConfigSchema, config);
    const errors = validateSync(object);
    if (errors.length) {
      const allErrors = errors.map((x) =>
        MapTree(x, 'children', this.validationErrorMapFn),
      );
      throw new Error(
        `Config validation error: ${JSON.stringify(allErrors, null, '\t')}`,
      );
    }
  }
  private validationErrorMapFn(error: ValidationError) {
    const ret = { property: error.property };
    if (error.constraints) {
      ret['constraints'] = error.constraints;
    }
    return ret;
  }
}
