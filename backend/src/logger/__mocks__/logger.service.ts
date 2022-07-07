/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Logger } from "@nestjs/common";

export class LoggerService extends Logger {
  error(message: any, stack?: string, context?: string): void { }
  log(message: any, context?: string): void { }
  warn(message: any, context?: string): void { }

}