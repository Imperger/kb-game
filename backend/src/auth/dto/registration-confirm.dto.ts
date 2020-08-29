import { IsString } from 'class-validator';

export class RegistrationConfirm {
    @IsString()
    readonly code: string;
}
