import type { Observable } from 'rxjs';

import { PlayerDescriptor } from '../interfaces/player-descriptor';

export const matchMakingStrategyToken = Symbol('match-making-strategy-token');

export type PlayerGroup = PlayerDescriptor[];

export interface Participant {
  id: string;
  nickname: string;
}

export interface MatchMakingStrategy {
  readonly $groupFormed: Observable<PlayerGroup>;
  enterQueue(player: Participant);
  leaveQueue(player: Participant);
}
