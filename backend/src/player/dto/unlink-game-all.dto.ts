import { IsString } from 'class-validator';

export class UnlinkGameAllDto {
  @IsString()
  readonly instanceUrl: string;
}
