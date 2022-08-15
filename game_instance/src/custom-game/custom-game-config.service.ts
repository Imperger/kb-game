import { ConfigService } from '@/game/config.service';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class CustomGameConfigService
  extends ConfigService
  implements OnModuleInit
{
  private _ownerId: string;

  onModuleInit() {
    super.onModuleInit();

    this._ownerId = process.env.OWNER_ID;
  }

  get ownerId() {
    return this._ownerId;
  }
}
