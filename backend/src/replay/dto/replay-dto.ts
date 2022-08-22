import { IsArray, IsBoolean, IsMongoId, IsNumber, IsString } from 'class-validator';

export class InputEvent {
  @IsString()
  readonly char: string;

  @IsBoolean()
  readonly correct: boolean;

  @IsNumber()
  readonly timestamp: number;
}

export class Track {
  @IsMongoId()
  readonly playerId: string;

  @IsArray()
  readonly data: InputEvent[];
}

export class ReplayDto {
  @IsArray()
  readonly tracks: Track[];
}
