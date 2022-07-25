import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { ParticipantService } from 'src/game/participant.service';

/**
 * Allow to only the player that start the instance
 */

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly participant: ParticipantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const player = this.participant.findBySocket(
      context.switchToWs().getClient(),
    );

    return player && player.id === process.env.OWNER_ID;
  }
}
