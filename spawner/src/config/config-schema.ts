import { IsString, IsDefined } from 'class-validator';

export class ConfigSchema {
  @IsDefined({ message: "missing 'secret' property" })
  @IsString()
  readonly secret: string;
}
