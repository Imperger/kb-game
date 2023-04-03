import { Length, IsOptional } from 'class-validator';

import { AtLeastOne } from '@/common/class-validators/atleast-one.validator';

@AtLeastOne()
export class UpdateScenarioDto {
  @IsOptional()
  @Length(3, 50)
  readonly title?: string;

  @IsOptional()
  @Length(10, 100000)
  readonly text?: string;
}
