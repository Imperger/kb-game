import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SpawnerService } from './spawner/spawner.service';

@Controller()
export class AppController {
  constructor(
    private readonly spawnerService: SpawnerService,
  ) {}

  @Get()
  getHello() {
    return this.spawnerService.getContainers();
  }
}
