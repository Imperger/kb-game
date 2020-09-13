import { Logger as NestLogger } from '@nestjs/common';

export interface Exception {
    new(msg?: string): Error;
}

export class LogException {
    private logger: NestLogger;
    constructor(scope: string, private Type: Exception = Error) { this.logger = new NestLogger(scope); }
    throw(msg: string) {
        this.logger.error(msg);
        throw new this.Type(msg);
    }
}