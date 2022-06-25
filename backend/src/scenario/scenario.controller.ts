import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { HasScopes } from 'src/auth/decorators/has-scopes.decorator';
import { ScopeGuard } from 'src/auth/guards/scope.guard';
import { JwtGuard } from 'src/jwt/decorators/jwt.guard';
import { JwtKnownSpawnerGuard } from 'src/spawner/decorators/jwt-known-spawner.guard';
import { Scope } from '../auth/scopes';
import { NewScenarioDto } from './dto/new-scenario.dto';
import { ScenarioService } from './scenario.service';

@Controller('scenario')
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) { }

  @HasScopes(Scope.EditScenario)
  @UseGuards(JwtGuard, ScopeGuard)
  @Post('add')
  async add(@Body() scenario: NewScenarioDto) {
    this.scenarioService.add(scenario.title, scenario.text);
  }

  @HasScopes(Scope.EditScenario)
  @UseGuards(JwtGuard, ScopeGuard)
  @Delete('remove/:id')
  async remove(@Param('id') id: string) {
    this.scenarioService.remove(id);
  }

  @UseGuards(JwtGuard)
  @Get('list')
  async list(@Query('offset', ParseIntPipe) offset: number, @Query('limit', ParseIntPipe) limit: number) {
    const page = await this.scenarioService.list(offset, limit);
    return { 
      total: page.total, 
      scenarios: page.scenarios.map(({ id, title, text }) => ({ id, title, text }))};
  }

  @UseGuards(JwtKnownSpawnerGuard)
  @Get('list_all_titles')
  async listAllTitles() {
    return this.scenarioService.all_titles();
  }

  @UseGuards(JwtKnownSpawnerGuard)
  @Get('text/:id')
  async text(@Param('id') id: string) {
    return { text: await this.scenarioService.text(id) };
  }
}
