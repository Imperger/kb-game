import { plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

import { ConfigSchema } from './config-schema';
import MapTree from '../common/util/map-tree';
import { LogException } from '../common/logger-exception';

export class ConfigValidator {
    private readonly ex = new LogException('ConfigLoader');
    validate<T>(config: T) {
        const object = plainToClass(ConfigSchema, config);
        const errors = validateSync(object);
        if (errors.length) {
            const allErrors = errors.map(x => MapTree(x, 'children', this.validationErrorMapFn));
            this.ex.throw(`Config validation error: ${JSON.stringify(allErrors, null, '\t')}`);
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
