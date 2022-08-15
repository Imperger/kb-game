import type { Observable } from "rxjs";

import type { Player } from "@/player/schemas/player.schema";
import { PlayerDescriptor } from "../interfaces/player-descriptor";

export const matchMakingStrategyToken = Symbol('match-making-strategy-token');

export type PlayerGroup = PlayerDescriptor[];

export interface MatchMakingStrategy {
  readonly $groupFormed: Observable<PlayerGroup>;
  enterQueue(player: Player);
  leaveQueue(player: Player);
}
