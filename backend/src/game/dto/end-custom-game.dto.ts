import { IsString } from 'class-validator';

export class EndCustomGameDto {
  @IsString()
  readonly instanceUrl: string;
}
