import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { Observable } from 'rxjs';

import { globalRequestCounterTotalToken } from './inject-tokens';

@Injectable()
export class RequestCounterInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric(globalRequestCounterTotalToken)
    private globalRequestCounter: Counter<string>
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.globalRequestCounter.inc(1);

    return next.handle();
  }
}
