import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';

export interface Scenario {
  id: string;
  title: string;
  text: string;
}

type ScenarioContent = Omit<Scenario, 'id'>;

export interface LinkedGame {
  instanceUrl: string;
}

export interface InputEvent {
  char: string;
  correct: boolean;
  timestamp: number;
}

export interface Track {
  playerId: string;
  finished: boolean;
  data: InputEvent[];
}

export interface Replay {
  duration: number;
  tracks: Track[];
}

@Injectable()
export class BackendApiService {
  constructor(private readonly http: HttpService) {}

  async fetchScenarioContent(id: string): Promise<ScenarioContent> {
    return (
      await firstValueFrom(
        this.http.get<ScenarioContent>(
          `${process.env.BACKEND_API}/api/scenario/text/${id}`,
          this.useAuthorization(),
        ),
      )
    ).data;
  }

  async linkGame(playerId: string, linked: LinkedGame): Promise<boolean> {
    return (
      await firstValueFrom(
        this.http.patch<boolean>(
          `${process.env.BACKEND_API}/api/player/${playerId}/link_game`,
          linked,
          this.useAuthorization(),
        ),
      )
    ).data;
  }

  async unlinkGame(playerId: string): Promise<boolean> {
    return (
      await firstValueFrom(
        this.http.patch<boolean>(
          `${process.env.BACKEND_API}/api/player/${playerId}/unlink_game`,
          {},
          this.useAuthorization(),
        ),
      )
    ).data;
  }

  async unlinkGameAll(instanceUrl: string): Promise<boolean> {
    return (
      await firstValueFrom(
        this.http.patch<boolean>(
          `${process.env.BACKEND_API}/api/player/unlink_game`,
          { instanceUrl },
          this.useAuthorization(),
        ),
      )
    ).data;
  }

  async uploadReplay(replay: Replay): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(
        `${process.env.BACKEND_API}/api/replay`,
        replay,
        this.useAuthorization(),
      ),
    );
  }

  private useAuthorization() {
    const token = sign(
      { spawner: process.env.SPAWNER_API.toLowerCase() },
      process.env.SPAWNER_SECRET,
      { expiresIn: '3m' },
    );

    return { headers: { Authorization: `Bearer ${token}` } };
  }
}
