import * as fs from 'fs';

import { ConfigValidator } from './config-validator';
import { ConfigSchema } from './config-schema';
import { LogException } from '../common/logger-exception';

export class ConfigLoader {
  private readonly ex = new LogException('ConfigLoader');
  private readonly validator = new ConfigValidator();
  load(filename: string): ConfigSchema {
    try {
      const config = JSON.parse(fs.readFileSync(filename, 'utf8'));
      this.validator.validate(config);
      return config;
    } catch (e) {
      if (e.code === 'ENOENT')
        this.ex.throw(`Missing config file '${filename}'`);
      else if (e.name === 'SyntaxError')
        this.ex.throw(`Config '${filename}' has malformed. Expected json.`);
      else
        throw e;
    }
  }
}