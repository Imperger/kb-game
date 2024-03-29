import { Type } from 'class-transformer';
import { IsString, IsDefined, IsNumber, IsOptional, ValidateNested } from 'class-validator';

class GameInstance {
  @IsDefined({ message: "missing 'game_instance.ca_mount' property" })
  @IsString()
  readonly ca_mount: string;
}

class Tls {
  @IsDefined({ message: "missing 'tls.certs' property" })
  @IsString()
  readonly certs: string;
}

export class ConfigSchema {
  @IsDefined({ message: "missing 'name' property" })
  @IsString()
  readonly name: string;

  @IsDefined({ message: "missing 'hostname' property" })
  @IsString()
  readonly hostname: string;

  @IsDefined({ message: "missing 'network' property" })
  @IsString()
  readonly network: string;

  @IsDefined({ message: "missing 'port' property" })
  @IsNumber()
  readonly port: number;

  @IsOptional()
  @IsString()
  readonly entry: string;

  @IsDefined({ message: "missing 'capacity' property" })
  @IsNumber()
  readonly capacity: number;

  @IsDefined({ message: "missing 'secret' property" })
  @IsString()
  readonly secret: string;

  @IsDefined({ message: "missing 'tls' scope" })
  @ValidateNested()
  @Type(() => Tls)
  readonly tls: Tls;
}
