import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';

import { ScopeGuard } from '@/auth/guards/scope.guard';
import { JwtGuard } from '@/jwt/decorators/jwt.guard';
import { JwtKnownSpawnerGuard } from '@/spawner/decorators/jwt-known-spawner.guard';
import { Scope } from '@/auth/scopes';
import { NewScenarioDto } from './dto/new-scenario.dto';
import { ScenarioService } from './scenario.service';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';

@Controller('scenario')
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) {}

  @UseGuards(JwtGuard, ScopeGuard(Scope.EditScenario))
  @Post()
  async add(@Body() scenario: NewScenarioDto) {
    return this.scenarioService.add(scenario.title, scenario.text);
  }

  @UseGuards(JwtGuard, ScopeGuard(Scope.EditScenario))
  @Put(':id')
  async update(
  @Param('id', ParseObjectIdPipe) id: string,
    @Body() content: NewScenarioDto
  ) {
    return this.scenarioService.update(id, content);
  }

  @UseGuards(JwtGuard, ScopeGuard(Scope.EditScenario))
  @Delete(':id')
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.scenarioService.remove(id);
  }

  @UseGuards(JwtGuard)
  @Get()
  async paginate(
  @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number
  ) {
    const page = await this.scenarioService.list(offset, limit);
    return {
      total: page.total,
      scenarios: page.scenarios.map(({ _id, title, text }) => ({
        id: _id,
        title,
        text
      }))
    };
  }

  @UseGuards(JwtGuard, ScopeGuard(Scope.EditScenario))
  @Get(':id')
  one(@Param('id') id: string) {
    return this.scenarioService.content(id);
  }

  @UseGuards(JwtKnownSpawnerGuard)
  @Get('titles')
  async listAllTitles() {
    return this.scenarioService.all_titles();
  }

  @UseGuards(JwtKnownSpawnerGuard)
  @Get('text/:id')
  async text(@Param('id') id: string) {
    return { text: await this.scenarioService.text(id) };
  }
}
