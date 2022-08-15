import { Scenario } from '@/game/backend-api.service';
import { LobbyPlayer } from './lobby-player';

export interface LobbyState {
  ownerId: string;
  players: LobbyPlayer[];
  scenarios: Scenario[];
}
