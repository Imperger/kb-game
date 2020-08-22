import { IsEmail, Length, IsString } from 'class-validator';

export class CreateUserDto {
    @Length(3, 16)
    readonly username: string;

    @IsEmail()
    readonly email: string;

    @Length(8, 100)
    readonly password: string;

    @IsString()
    readonly reCaptchaResponse: string;
}