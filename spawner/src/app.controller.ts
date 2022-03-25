import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SpawnerService } from './spawner/spawner.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly spawnerService: SpawnerService,
  ) {}

  @Get()
  getHello() {
    return this.spawnerService.getContainers();
  }
}
