import { Injectable } from "@nestjs/common";

import { PlayerService } from "@/player/player.service";

@Injectable()
export class PlayerServiceExtension {
  constructor(private readonly player: PlayerService) { }

  findByOrderedInQueueTime(limit: number) {
    return this.player.model
      .find({ quickGameQueue: { $ne: null } })
      .sort({ quickGameQueue: 1 })
      .limit(limit);
  }
}
