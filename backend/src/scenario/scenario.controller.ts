import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';

import { HasScopes } from '@/auth/decorators/has-scopes.decorator';
import { ScopeGuard } from '@/auth/guards/scope.guard';
import { JwtGuard } from '@/jwt/decorators/jwt.guard';
import { JwtKnownSpawnerGuard } from '@/spawner/decorators/jwt-known-spawner.guard';
import { Scope } from '@/auth/scopes';
import { NewScenarioDto } from './dto/new-scenario.dto';
import { ScenarioService } from './scenario.service';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { Catch } from '@/common/decorators/catch.decorator';

@Controller('scenario')
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) { }

  @HasScopes(Scope.EditScenario)
  @UseGuards(JwtGuard, ScopeGuard)
  @Post()
  async add(@Body() scenario: NewScenarioDto) {
    return this.scenarioService.add(scenario.title, scenario.text);
  }

  @HasScopes(Scope.EditScenario)
  @UseGuards(JwtGuard, ScopeGuard)
  @Put(':id')
  async update(@Param('id', ParseObjectIdPipe) id: string, @Body() content: NewScenarioDto) {
    return this.scenarioService.update(id, content);
  }

  @HasScopes(Scope.EditScenario)
  @UseGuards(JwtGuard, ScopeGuard)
  @Delete(':id')
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.scenarioService.remove(id);
  }

  @UseGuards(JwtGuard)
  @Get()
  async paginate(@Query('offset', ParseIntPipe) offset: number, @Query('limit', ParseIntPipe) limit: number) {
    const page = await this.scenarioService.list(offset, limit);
    return {
      total: page.total,
      scenarios: page.scenarios.map(({ _id, title, text }) => ({ id: _id, title, text }))
    };
  }

  @HasScopes(Scope.EditScenario)
  @UseGuards(JwtGuard, ScopeGuard)
  @Catch(NotFoundException)
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
  @Catch(NotFoundException)
  @Get('text/:id')
  async text(@Param('id') id: string) {
    return { text: await this.scenarioService.text(id) };
  }
}
