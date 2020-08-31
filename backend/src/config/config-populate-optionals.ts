import { ConfigSchema } from './config-schema';

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

export const ConfigPopulateOptionals = (config: DeepWriteable<ConfigSchema>) => {
    config.auth.jwtSecret = config.api.jwtSecret + '_';
    return config;
};