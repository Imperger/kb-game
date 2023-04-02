import * as fs from 'fs';

import { ConfigSchema } from './config-schema';
import { ConfigValidator } from './config-validator';

export class ConfigLoader {
  private readonly validator = new ConfigValidator();
  load(filename: string): ConfigSchema {
    try {
      const config = JSON.parse(fs.readFileSync(filename, 'utf8'));
      this.validator.validate(config);
      return config;
    } catch (e) {
      if (e.code === 'ENOENT')
        throw new Error(`Missing config file '${filename}'`);
      else if (e.name === 'SyntaxError')
        throw new Error(`Config '${filename}' has malformed. Expected json.`);
      else throw e;
    }
  }
}
