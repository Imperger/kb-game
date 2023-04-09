import { Length } from 'class-validator';

export class ValidatePasswordDto {
  @Length(8, 100)
  readonly password: string;
}
