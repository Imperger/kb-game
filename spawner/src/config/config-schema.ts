import { IsString, IsDefined, IsNumber } from 'class-validator';

export class ConfigSchema {
  @IsDefined({ message: "missing 'name' property" })
  @IsString()
  readonly name: string;

  @IsDefined({ message: "missing 'capacity' property" })
  @IsNumber()
  readonly capacity: number;

  @IsDefined({ message: "missing 'secret' property" })
  @IsString()
  readonly secret: string;
}
