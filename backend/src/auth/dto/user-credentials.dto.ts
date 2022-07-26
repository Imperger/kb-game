import { Length, IsEmail, IsOptional } from 'class-validator';

export class UserCredentialsDto {
  @IsOptional()
  @Length(3, 16)
  readonly username?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @Length(8, 100)
  readonly password: string;
}
