import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDefined, IsString } from 'class-validator';

export class NewQuickGameDto  {
    @IsDefined({ message: 'missing property \'backendApi\'' })
    @IsString()
    readonly backendApi: string;
    
    @IsDefined({ message: 'missing property \'players\'' })
    @IsArray()
    @ArrayMinSize(2)
    @Type(() => String)
    readonly players: string[];

    @IsDefined({ message: 'missing property \'scenarioId\'' })
    @IsString()
    readonly scenarioId: string;
    
}