import { Module, Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';
import {
  CounterConfiguration,
  GaugeConfiguration,
  HistogramConfiguration,
  SummaryConfiguration
} from 'prom-client';

import {
  globalRequestCounterTotalToken,
  loginSuccessCountTotalToken,
  loginUnsuccessCountTotalToken
} from './inject-tokens';
import { RequestCounterInterceptor } from './request-counter-interceptor';

type MetricConfig<T extends string> =
  CounterConfiguration<T> |
  GaugeConfiguration<T> |
  HistogramConfiguration<T> |
  SummaryConfiguration<T>;

type MetricFactory<T extends string> = (options: MetricConfig<T>) => Provider<any>;

function makeProvider<T extends string>(name: string, help: string, factory: MetricFactory<T>) {
  return factory({ name, help });
}

const loginSuccessCountTotalProvider = makeProvider(
  loginSuccessCountTotalToken,
  'Number of successful authentication',
  makeCounterProvider);

const loginUnsuccessCountTotalProvider = makeProvider(
  loginUnsuccessCountTotalToken,
  'Number of unsuccessful authentication',
  makeCounterProvider);

const globalRequestCountTotalProvider = makeProvider(
  globalRequestCounterTotalToken,
  'Number of total request',
  makeCounterProvider);

@Module({
  imports: [PrometheusModule.register()],
  providers: [
    loginSuccessCountTotalProvider,
    loginUnsuccessCountTotalProvider,
    globalRequestCountTotalProvider,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestCounterInterceptor
    }],
  controllers: [],
  exports: [
    loginSuccessCountTotalProvider,
    loginUnsuccessCountTotalProvider,
    globalRequestCountTotalProvider]
})
export class MetricsModule { }
