import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsString
} from 'class-validator';

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

  @IsBoolean()
  readonly finished: boolean;

  @IsArray()
  readonly data: InputEvent[];
}

export class ReplayDto {
  @IsNumber()
  readonly duration: number;

  @IsArray()
  readonly tracks: Track[];
}
