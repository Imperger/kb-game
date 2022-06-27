import { Type } from 'class-transformer';
import { IsString, IsDefined, IsNumber, IsOptional, ValidateNested } from 'class-validator';

class Tls {
  @IsDefined({ message: "missing 'tls.certs' property" })
  @IsString()
  readonly certs: string;

  @IsDefined({ message: "missing 'tls.ca' property" })
  @IsString()
  readonly ca: string;
}

export class ConfigSchema {
  @IsDefined({ message: "missing 'name' property" })
  @IsString()
  readonly name: string;

  @IsDefined({ message: "missing 'hostname' property" })
  @IsString()
  readonly hostname: string;

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
