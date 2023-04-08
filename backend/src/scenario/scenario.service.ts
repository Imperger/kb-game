import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage } from 'mongoose';

import { NewScenarioDto } from './dto/new-scenario.dto';
import { UpdateScenarioDto } from './dto/update-scenario.dto';
import { SearchQuery, SearchQueryOrder } from './interfaces/search-query';
import {
  RemovingLastScenarioException,
  ScenarioNotFoundException
} from './scenario-exception';
import { Scenario } from './schemas/scenario.schema';

import { Base64 } from '@/common/util/base64';
import { LoggerService } from '@/logger/logger.service';

export interface ScenarioPage {
  total: number;
  scenarios: Scenario[];
  cursorNext?: string;
  cursorPrev?: string;
}

export interface ScenarioContent {
  title: string;
  text: string;
}

@Injectable()
export class ScenarioService implements OnModuleInit {
  constructor(
    @InjectModel(Scenario.name) private readonly scenarioModel: Model<Scenario>,
    private readonly logger: LoggerService
  ) {}

  async onModuleInit() {
    if (await this.populateIfEmpty()) {
      this.logger.log(
        'Populate the empty scenario list with a sample',
        'ScenarioService'
      );
    }
  }

  async add({ title, text }: NewScenarioDto): Promise<string> {
    text = text
      .split('')
      .filter(x => !'\r\n'.includes(x))
      .join('');

    return (
      await new this.scenarioModel({ title, text, length: text.length }).save()
    ).id;
  }

  async update(id: string, content: UpdateScenarioDto): Promise<boolean> {
    const scenario = await this.scenarioModel.findById(id);

    if (!scenario) return false;

    if (content.title) {
      scenario.title = content.title;
    }

    if (content.text) {
      scenario.text = content.text;
      scenario.length = content.text.length;
    }

    await scenario.save();

    return true;
  }

  async remove(id: string): Promise<void> {
    if ((await this.scenarioModel.count()) > 1) {
      if ((await this.scenarioModel.deleteOne({ _id: id })).deletedCount > 0) {
        return;
      }

      throw new ScenarioNotFoundException();
    }

    throw new RemovingLastScenarioException();
  }

  async list(searchQuery: SearchQuery): Promise<ScenarioPage> {
    const parts = new ScenarioListStageBuilder(searchQuery);

    const pipeline = [];

    if (searchQuery.query) {
      pipeline.push(parts.matchText());
    }

    const resultPipeline: PipelineStage[] = [
      parts.sort(),
      parts.limit(),
      parts.truncContent()
    ];

    if (searchQuery.cursorNext || searchQuery.cursorPrev) {
      resultPipeline.unshift(parts.paginationClause());
    }

    pipeline.push({
      $facet: {
        ...parts.total(),
        result: resultPipeline
      }
    });

    const scenariosResult = (
      await this.scenarioModel.aggregate<{
        result: Scenario[];
        total: [{ count: number }];
      }>(pipeline)
    )[0];
    const { result: scenarios, total } = scenariosResult;

    if (searchQuery.cursorPrev) {
      scenarios.reverse();
    }

    if (scenarios.length === 0) {
      return { total: 0, scenarios: [] };
    }

    const last = scenarios[scenarios.length - 1];
    const cursorNext = Base64.encodeString(
      `${last._id}|${last[searchQuery.sortBy]}`
    );

    const first = scenarios[0];
    const cursorPrev = Base64.encodeString(
      `${first._id}|${first[searchQuery.sortBy]}`
    );

    return {
      ...(scenarios.length && { total: total[0].count }),
      scenarios,
      cursorNext,
      cursorPrev
    };
  }

  async all_titles() {
    return (await this.scenarioModel.find({}, { title: 1 })).map(
      ({ id, title }) => ({ id, title })
    );
  }

  async content(id: string): Promise<ScenarioContent> {
    const content = await this.scenarioModel.findById(id);

    if (content === null) {
      throw new ScenarioNotFoundException();
    }

    return (({ title, text }) => ({ title, text }))(content);
  }

  async randomScenarioId(): Promise<string> {
    return (
      await this.scenarioModel.aggregate([{ $sample: { size: 1 } }])
    )[0]._id.toString();
  }

  private async populateIfEmpty(): Promise<boolean> {
    if ((await this.scenarioModel.count()) === 0) {
      await this.add({
        title: 'Lorem ipsum',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ut felis mauris. Donec nec placerat justo. Proin at tempor orci. Morbi dignissim tortor nec massa commodo, at feugiat purus vestibulum. Nunc scelerisque mollis nisi mattis eleifend. Fusce dictum non orci vitae cursus. Phasellus a elementum felis. Nullam urna est, venenatis non elit eget, rutrum efficitur velit. Proin lacus erat, sodales sed urna in, condimentum convallis nulla. Quisque iaculis nunc augue, et imperdiet risus tempor non.'
      });

      return true;
    }

    return false;
  }
}

class ScenarioListStageBuilder {
  constructor(private readonly query: SearchQuery) {}
  public matchText() {
    return { $match: { $text: { $search: this.query.query } } };
  }

  public paginationClause(): PipelineStage.Match {
    // eslint-disable-next-line prefer-const
    let { unique, sorted } =
      this.query.cursorNext ?? this.query.cursorPrev ?? {};

    if (['length'].includes(this.query.sortBy)) {
      sorted = Number.parseInt(sorted as string);
    }

    const order =
      (this.query.cursorNext && this.query.orderBy === SearchQueryOrder.Desc) ||
      (this.query.cursorPrev && this.query.orderBy === SearchQueryOrder.Asc)
        ? '$lt'
        : '$gt';

    const clause = {
      $or: [
        {
          _id: { [order]: new mongoose.Types.ObjectId(unique) },
          [this.query.sortBy]: sorted
        },
        {
          [this.query.sortBy]: { [order]: sorted }
        }
      ]
    };

    return { $match: clause };
  }

  public total() {
    return { total: [{ $count: 'count' }] };
  }

  public sort(): PipelineStage.Sort {
    const order =
      (this.query.cursorNext && this.query.orderBy === SearchQueryOrder.Desc) ||
      (this.query.cursorPrev && this.query.orderBy === SearchQueryOrder.Asc) ||
      (!(this.query.cursorNext || this.query.cursorPrev) &&
        this.query.orderBy === SearchQueryOrder.Desc)
        ? -1
        : 1;

    return {
      $sort: {
        [this.query.sortBy]: order,
        _id: order
      }
    };
  }

  public limit(): PipelineStage.Limit {
    return {
      $limit: Math.min(25, this.query.limit)
    };
  }

  public truncContent(): PipelineStage.Project {
    return {
      $project: {
        title: 1,
        text: {
          $function: {
            body: function (text) {
              return text.substring(0, 100);
            },
            args: ['$text'],
            lang: 'js'
          }
        },
        length: 1
      }
    };
  }
}
