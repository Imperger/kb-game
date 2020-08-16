import { IsEmail, Length } from 'class-validator';

export class CreateUserDto {
    @Length(3, 16)
    readonly username: string;

    @IsEmail()
    readonly email: string;

    @Length(8, 100)
    readonly password: string;
}