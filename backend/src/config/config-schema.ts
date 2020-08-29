import { IsString, ValidateNested, IsDefined, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class Api {
    @IsDefined({ message: 'missing property \'api.jwtSecret\'' })
    @IsString()
    readonly jwtSecret: string;
}
class Mongo {
    @IsDefined({ message: 'missing property \'mongo.connectionURI\'' })
    @IsString()
    readonly connectionURI: string;
}
class Google {
    @IsDefined({ message: 'missing property \'auth.google.clientId\'' })
    @IsString()
    readonly clientId: string;

    @IsDefined({ message: 'missing property \'auth.google.secret\'' })
    @IsString()
    readonly secret: string;
}
class Auth {
    @IsDefined({ message: 'missing \'auth.confirmCodeTtl\' property' })
    @IsString()
    readonly confirmCodeTtl: string;

    @IsDefined({ message: 'missing \'auth.google\' scope' })
    @ValidateNested()
    @Type(() => Google)
    readonly google: Google;
}
class ReCaptcha {
    @IsDefined({ message: 'missing property \'reCaptcha.secret\'' })
    @IsString()
    readonly secret: string;
}
export class ConfigSchema {
    @IsDefined({ message: 'missing \'domain\' property' })
    @IsString()
    readonly domain: string;

    @IsDefined({ message: 'missing \'port\' property' })
    @IsNumber()
    readonly port: number;

    @IsDefined({ message: 'missing \'ssl\' property' })
    @IsBoolean()
    readonly ssl: boolean;

    @IsDefined({ message: 'missing \'api\' scope' })
    @ValidateNested()
    @Type(() => Api)
    readonly api: Api;

    @IsDefined({ message: 'missing \'mongo\' scope' })
    @ValidateNested()
    @Type(() => Mongo)
    readonly mongo: Mongo;

    @IsDefined({ message: 'missing \'auth\' scope' })
    @ValidateNested()
    @Type(() => Auth)
    readonly auth: Auth;

    @IsDefined({ message: 'missing \'reCaptcha\' scope' })
    @ValidateNested()
    @Type(() => ReCaptcha)
    readonly reCaptcha: ReCaptcha;
}