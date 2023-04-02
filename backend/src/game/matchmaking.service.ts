import { Inject, Injectable } from '@nestjs/common';

import {
  MatchMakingStrategy,
  matchMakingStrategyToken,
  Participant
} from './match-making-strategies/match-makin-strategy';

@Injectable()
export class MatchMakingService {
  constructor(
    @Inject(matchMakingStrategyToken)
    private readonly strategy: MatchMakingStrategy
  ) {}

  enterQueue(player: Participant) {
    this.strategy.enterQueue(player);
  }

  leaveQueue(player: Participant) {
    this.strategy.leaveQueue(player);
  }

  get $gameFormed() {
    return this.strategy.$groupFormed;
  }
}
