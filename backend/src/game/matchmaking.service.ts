import { Inject, Injectable } from "@nestjs/common";

import { Player } from "@/player/schemas/player.schema";
import { MatchMakingStrategy, matchMakingStrategyToken } from "./match-making-strategies/match-makin-strategy";

@Injectable()
export class MatchMakingService {
  constructor(@Inject(matchMakingStrategyToken) private readonly strategy: MatchMakingStrategy) { }

  enterQueue(player: Player) {
    this.strategy.enterQueue(player);
  }

  leaveQueue(player: Player) {
    this.strategy.leaveQueue(player);
  }

  get $gameFormed() {
    return this.strategy.$groupFormed;
  }
}
