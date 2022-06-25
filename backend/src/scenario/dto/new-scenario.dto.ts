import { Length } from 'class-validator';

export class NewScenarioDto {
  @Length(3, 20)
  readonly title: string;

  @Length(10, 100000)
  readonly text: string;
}
