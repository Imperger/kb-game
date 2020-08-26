import * as fs from 'fs';

import ConfigValidator from './config-validator';
import { ConfigSchema } from './config-schema';

export default (filename: string): ConfigSchema => {
    try {
        const config = JSON.parse(fs.readFileSync(filename, 'utf8'));
        ConfigValidator(config);
        return config;
    } catch (e) {
        if (e.code === 'ENOENT')
            throw new Error(`Missing config file '${filename}'`);
        else if (e.name === 'SyntaxError')
            throw new Error(`Config '${filename}' has malformed. Expected json.`);
        else
            throw e;
    }
};