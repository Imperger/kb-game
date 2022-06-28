import { IsString } from 'class-validator';

export class ConnectToGameDto {
  @IsString()
  readonly instanceUrl: string;
}
