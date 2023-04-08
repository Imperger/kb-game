import { ConfigService } from '@/game/config.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomGameConfigService extends ConfigService {
  private _ownerId: string;

  constructor() {
    super();

    this._ownerId = process.env.OWNER_ID;
  }

  get ownerId() {
    return this._ownerId;
  }
}
