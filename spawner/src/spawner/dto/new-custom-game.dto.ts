import { IsDefined, IsNumber, IsString } from 'class-validator';

export class NewCustomGameDto {
    @IsDefined({ message: 'missing property \'ownerId\'' })
    @IsString()
    readonly ownerId: string;

    @IsDefined({ message: 'missing property \'backendApi\'' })
    @IsString()
    readonly backendApi: string;
}