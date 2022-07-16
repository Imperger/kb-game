import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { applyDecorators, HttpException, SetMetadata, UseInterceptors } from "@nestjs/common";
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const catchMetaId = Symbol('catch.decorator');

type Error<T extends HttpException> = { new(): T };

export const Catch = <T extends HttpException>(type: Error<T>) => {
  return applyDecorators(
    UseInterceptors(CatchInterceptor),
    SetMetadata(catchMetaId, type));
};


@Injectable()
export class CatchInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError<unknown, any>(() => this.throwError(context))
      );
  }

  private throwError(context: ExecutionContext): void {
    throw new (this.reflector.get<Error<any>>(catchMetaId, context.getHandler()))()
  }
}
