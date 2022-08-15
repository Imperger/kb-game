import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NewScenarioDto } from './dto/new-scenario.dto';

import { Scenario } from './schemas/scenario.schema';

export interface ScenarioPage {
  total: number;
  scenarios: Scenario[];
}

export interface ScenarioContent {
  title: string;
  text: string;
}

@Injectable()
export class ScenarioService {
  constructor(
    @InjectModel(Scenario.name) private readonly scenarioModel: Model<Scenario>
  ) { }

  async add(title: string, text: string): Promise<string> {
    text = text
      .split('')
      .filter(x => !'\r\n'.includes(x))
      .join('');

    return (await new this.scenarioModel({ title, text }).save()).id;
  }

  async update(id: string, content: NewScenarioDto): Promise<boolean> {
    const scenario = await this.scenarioModel.findById(id);

    if (!scenario) return false;

    scenario.title = content.title;
    scenario.text = content.text;
    await scenario.save();

    return true;
  }

  async remove(id: string): Promise<boolean> {
    return (await this.scenarioModel.deleteOne({ _id: id })).deletedCount > 0;
  }

  async list(offset: number, limit: number): Promise<ScenarioPage> {
    return {
      total: await this.scenarioModel.count(),
      scenarios: await this.scenarioModel.aggregate([
        {
          $sort: { title: 1 }
        },
        {
          $skip: offset
        },
        {
          $limit: Math.min(25, limit)
        },
        {
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
            }
          }
        }
      ])
    };
  }

  async all_titles() {
    return (
      await this.scenarioModel.find({}, { title: 1 })
    ).map(({ id, title }) => ({ id, title }));
  }

  async content(id: string): Promise<ScenarioContent> {
    return (({ title, text }) => ({ title, text }))(
      await this.scenarioModel.findById(id)
    );
  }

  async text(id: string): Promise<string> {
    return (await this.scenarioModel.findById(id)).text;
  }

  async randomScenarioId(): Promise<string> {
    return (await this.scenarioModel.aggregate([{ $sample: { size: 1 } }]))[0]
      ._id
      .toString();
  }
}
