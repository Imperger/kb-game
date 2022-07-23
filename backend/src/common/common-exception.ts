import { HttpStatus } from "@nestjs/common";
import { AppException, exceptionGuardFactory } from "./app-exception";

export enum CommonError {
  DtoValidationFailed = 1,
  CaptchaFailed
}

export class CommonException extends AppException {}

export class DtoValidationFailedException extends CommonException {
  constructor(public message: string) { super() }
  code = CommonError.DtoValidationFailed;
  status = HttpStatus.BAD_REQUEST;
}

export const isCommonException = exceptionGuardFactory(CommonException, { min: 1, max: 100 });
