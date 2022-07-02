import { ConfigSchema } from './config-schema';

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

export const ConfigPopulateOptionals = (config: DeepWriteable<ConfigSchema>) => {
  if (!config.entry)
    config.entry = `https://${config.hostname}`;

  return config;
};