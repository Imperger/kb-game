import { plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

import { ConfigSchema } from './config-schema';
import MapTree from '../common/util/map-tree';

export default <T>(config: T) => {
    const object = plainToClass(ConfigSchema, config);
    const errors = validateSync(object);
    if (errors.length) {
        const allErrors = errors.map(x => MapTree(x, 'children', ValidationErrorMapFn));
        throw new Error(`Config validation error: ${JSON.stringify(allErrors, null, '\t')}`);
    }
}

const ValidationErrorMapFn = (error: ValidationError) => {
    const ret = { property: error.property };
    if (error.constraints) {
        ret['constraints'] = error.constraints;
    }
    return ret;
};
