export enum LobbyEventType {
  PlayerJoined = 200,
  PlayerLeaves,
  GameWillStart,
  FetchGameField }

export interface PlayerJoinedEvent {
  id: string;
  nickname: string;
  slot: number;
}

export interface PlayerLeavesEvent {
  id: string;
}

export type Base64Image = string;

export interface FetchGameFieldEvent {
  field: Base64Image;
}

export interface LobbyEvent {
  type: LobbyEventType;
  data?: PlayerJoinedEvent | PlayerLeavesEvent | FetchGameFieldEvent;
}
