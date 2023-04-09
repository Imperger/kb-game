import { IsOptional, Length } from 'class-validator';

export class UpdatePasswordDto {
  @IsOptional()
  @Length(8, 100)
  readonly password?: string;

  @Length(8, 100)
  readonly updatedPassword: string;
}
