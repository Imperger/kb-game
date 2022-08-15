import { Nickname } from '@/game/interfaces/nickname';

export interface ServerDescription {
  owner: Nickname;
  capacity: number;
  occupancy: number;
  started: boolean;
}
