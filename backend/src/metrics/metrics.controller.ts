import { Controller, Get, Header, OnModuleInit } from '@nestjs/common';
import { collectDefaultMetrics, register } from 'prom-client';

@Controller('metrics')
export class MetricsController implements OnModuleInit {
  onModuleInit() {
    collectDefaultMetrics();
  }

  @Get()
  @Header('content-type', register.contentType)
  async metrics(): Promise<string> {
    return register.metrics();
  }
}
