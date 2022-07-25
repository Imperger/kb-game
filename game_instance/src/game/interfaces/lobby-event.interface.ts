export interface PlayerJoinedEvent {
  id: string;
  nickname: string;
  slot: number;
}

export interface PlayerLeavesEvent {
  id: string;
}

export enum LobbyEventType {
  PlayerJoined,
  PlayerLeaves,
  GameWillStart,
}

export interface LobbyEvent {
  type: LobbyEventType;
  data?: PlayerJoinedEvent | PlayerLeavesEvent;
}
