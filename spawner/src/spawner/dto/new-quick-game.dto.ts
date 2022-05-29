import { IsDefined, IsString } from 'class-validator';

import { NewCustomGameDto } from './new-custom-game.dto';

export class NewQuickGameDto extends NewCustomGameDto  {
    @IsDefined({ message: 'missing property \'backendApi\'' })
    @IsString()
    readonly backendApi: string;
    
    @IsDefined({ message: 'missing property \'type\'' })
    @IsString()
    readonly type: string; // 'FFA' or 'Teams'

    @IsDefined({ message: 'missing property \'text\'' })
    @IsString()
    readonly text: string; // text content ??
    
}