import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InstanceRequestResult, ServerDescription, SpawnerService } from './spawner/spawner.service';

import { JwtGuard } from './jwt/decorators/jwt.guard';

import { JwtPassthrough } from './jwt/decorators/jwt-passthrough';
import { NewCustomGameDto, NewQuickGameDto } from './spawner/dto';

@Controller()
export class AppController {
  constructor(
    private readonly spawnerService: SpawnerService,
  ) { }

  @UseGuards(JwtGuard)
  @Get('info')
  info() {
    return this.spawnerService.info();
  }

  @UseGuards(JwtGuard)
  @Post('game/new_custom')
  async newCustomGame(@Body() options: NewCustomGameDto): Promise<InstanceRequestResult> {
    return this.spawnerService.createCustomGame(options)
  }

  @UseGuards(JwtGuard)
  @Post('game/new_quick')
  async newQuickGame(@JwtPassthrough() options: NewQuickGameDto): Promise<InstanceRequestResult> {
    return this.spawnerService.createQuickGame(options);
  }

  @UseGuards(JwtGuard)
  @Get('game/list')
  game_list(): Promise<ServerDescription[]> {
    return this.spawnerService.listInstances();
  }
}
