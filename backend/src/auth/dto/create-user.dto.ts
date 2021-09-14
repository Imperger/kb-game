import { IsEmail, Length, Matches } from 'class-validator';

export class CreateUserDto {
    @Matches(/^[\w]{3,16}$/)
    readonly username: string;

    @IsEmail()
    readonly email: string;

    @Length(8, 100)
    readonly password: string;
}