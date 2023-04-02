import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { isValidNickname } from '../validators/nickname-validator';

import { Player } from '@/player/schemas/player.schema';

@Injectable()
export class PlayerByNicknamePipe implements PipeTransform {
  constructor(
    @InjectModel(Player.name) private readonly player: Model<Player>
  ) {}

  async transform(data: string, _metadata: ArgumentMetadata): Promise<Player> {
    const [nickname, discriminatorStr] = data.split('_');
    const discriminator = Number.parseInt(discriminatorStr);

    if (
      Number.isNaN(discriminator) ||
      !isValidNickname(nickname, discriminator)
    ) {
      throw new BadRequestException('Invalid player discriminator');
    }

    const player = await this.player
      .findOne({ nickname, discriminator })
      .collation({ locale: 'en', strength: 1 });

    if (player == null) {
      throw new NotFoundException('Unknown player');
    }

    return player;
  }
}
