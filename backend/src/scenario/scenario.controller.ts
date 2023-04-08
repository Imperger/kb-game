import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';

import { CursorDecodePipe } from './decorators/cursor-decode.pipe';
import { NewScenarioDto } from './dto/new-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import {
  SearchQueryCursor,
  SearchQueryOrder,
  SearchQuerySort
} from './interfaces/search-query';
import { ScenarioService } from './scenario.service';

import { ScopeGuard } from '@/auth/guards/scope.guard';
import { Scope } from '@/auth/scopes';
import { EnumValidationPipe } from '@/common/pipes/enum-validation.pipe';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { JwtGuard } from '@/jwt/decorators/jwt.guard';
import { JwtKnownSpawnerGuard } from '@/spawner/decorators/jwt-known-spawner.guard';

@Controller('scenario')
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) {}

  @UseGuards(JwtGuard, ScopeGuard(Scope.EditScenario))
  @Post()
  async add(@Body() scenario: NewScenarioDto) {
    return {
      id: await this.scenarioService.add(scenario)
    };
  }

  @UseGuards(JwtGuard, ScopeGuard(Scope.EditScenario))
  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() content: UpdateScenarioDto
  ) {
    return this.scenarioService.update(id, content);
  }

  @UseGuards(JwtGuard, ScopeGuard(Scope.EditScenario))
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    await this.scenarioService.remove(id);
  }

  @UseGuards(JwtGuard)
  @Get()
  async paginate(
    @Query('query') query: string | undefined,
    @Query('sort', EnumValidationPipe(SearchQuerySort)) sortBy: SearchQuerySort,
    @Query('order', EnumValidationPipe(SearchQueryOrder))
    orderBy: SearchQueryOrder,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('cursorNext', CursorDecodePipe) cursorNext: SearchQueryCursor | null,
    @Query('cursorPrev', CursorDecodePipe) cursorPrev: SearchQueryCursor | null
  ) {
    const page = await this.scenarioService.list({
      ...(query && { query }),
      sortBy,
      orderBy,
      limit,
      ...(cursorNext && { cursorNext }),
      ...(cursorPrev && { cursorPrev })
    });
    return {
      total: page.total,
      scenarios: page.scenarios.map(({ _id, title, text }) => ({
        id: _id,
        title,
        text
      })),
      cursorNext: page.cursorNext,
      cursorPrev: page.cursorPrev
    };
  }

  @UseGuards(JwtGuard, ScopeGuard(Scope.EditScenario))
  @Get(':id')
  one(@Param('id', ParseObjectIdPipe) id: string) {
    return this.scenarioService.content(id);
  }

  @UseGuards(JwtKnownSpawnerGuard)
  @Get('text/:id')
  async selectScenario(@Param('id', ParseObjectIdPipe) id: string) {
    return this.scenarioService.content(id);
  }
}
