export enum GameEventType {
  PlayerProgress = 100,
  EndGame,
  SetTypingProgress,
}

// Describes the player's typing progress
export interface PlayerProgress {
  id: string;
  progress: number; // [0-1]
}

export interface PlayersProgressEvent {
  type: GameEventType.PlayerProgress;
  data: PlayerProgress[];
}

export type PlayerId = string;

export interface PlayerStats {
  id: PlayerId;
  accuracy: number;
  cpm: number[]; // Each number describe cpm on 5 seconds interval
}

export interface GameSummary {
  winner: PlayerId;
  scores: PlayerStats[];
}

export interface EndGameEvent {
  type: GameEventType.EndGame;
  data: GameSummary;
}

export interface SetTypingProgress {
  width: number;
  line: number;
}

export interface SetTypingProgressEvent {
  type: GameEventType.SetTypingProgress;
  data: SetTypingProgress;
}

export type GameEvent =
  | PlayersProgressEvent
  | EndGameEvent
  | SetTypingProgressEvent;
