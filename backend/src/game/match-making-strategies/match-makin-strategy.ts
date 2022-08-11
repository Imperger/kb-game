import type { Observable } from "rxjs";

import type { Player } from "@/player/schemas/player.schema";

export const matchMakingStrategyToken = Symbol('match-making-strategy-token');

export type PlayerId = string;

export type PlayerGroup = PlayerId[];

export interface MatchMakingStrategy {
  readonly $groupFormed: Observable<PlayerGroup>;
  enterQueue(player: Player);
  leaveQueue(player: Player);
}
