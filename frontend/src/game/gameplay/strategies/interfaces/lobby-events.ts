export enum LobbyEventType {
  PlayerJoined = 200,
  PlayerLeaves,
  GameWillStart,
  SelectScenario
}

export interface PlayerJoinedEvent {
  id: string;
  nickname: string;
  slot: number;
}

export interface PlayerLeavesEvent {
  id: string;
}

export interface SelectScenarioEvent {
  id: string;
  title: string;
  text: string;
}

export type Base64Image = string;

export interface LobbyEvent {
  type: LobbyEventType;
  data?: PlayerJoinedEvent | PlayerLeavesEvent | SelectScenarioEvent;
}
