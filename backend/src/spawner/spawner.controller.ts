import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards
} from '@nestjs/common';

import { Scope } from '@/auth/scopes';
import { JwtGuard } from '@/jwt/decorators/jwt.guard';
import { ScopeGuard } from '@/auth/guards/scope.guard';
import { AddSpawnerDto } from './dto/add-spawner.dto';
import { SpawnerInfo, KnownSpawnerInfo, SpawnerService } from './spawner.service';
import { Base64DecoderPipe } from './pipes/base64-decoder.pipe';

@Controller('spawner')
export class SpawnerController {
  constructor(private readonly spawnerService: SpawnerService) {}

  @UseGuards(JwtGuard, ScopeGuard(Scope.ServerMaintainer))
  @Post()
  async add(@Body() spawner: AddSpawnerDto): Promise<KnownSpawnerInfo> {
    return this.spawnerService.add(spawner.url, spawner.secret);
  }

  @UseGuards(JwtGuard, ScopeGuard(Scope.ServerMaintainer))
  @HttpCode(204)
  @Delete(':url_base64')
  async remove(@Param('url_base64', Base64DecoderPipe) url: string): Promise<void> {
    await this.spawnerService.remove(url);
  }

  @UseGuards(JwtGuard, ScopeGuard(Scope.ServerMaintainer))
  @Get()
  async listAll(): Promise<SpawnerInfo[]> {
    return (
      await this.spawnerService.listAll()
    ).map(({ url, name, capacity }) => ({ url, name, capacity }));
  }
}
