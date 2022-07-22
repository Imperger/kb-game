import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';

export interface Scenario {
  id: string;
  title: string;
}

export interface ScenarioText {
  text: string;
}

export interface LinkedGame {
  instanceUrl: string;
}

@Injectable()
export class BackendApiService {
  constructor(private readonly http: HttpService) {}

  async listAllTitles(): Promise<Scenario[]> {
    return (
      await firstValueFrom(
        this.http.get(
          `${process.env.BACKEND_API}/api/scenario/titles`,
          this.useAuthorization(),
        ),
      )
    ).data;
  }

  async fetchScenarioText(id: string): Promise<string> {
    return (
      await firstValueFrom(
        this.http.get<ScenarioText>(
          `${process.env.BACKEND_API}/api/scenario/text/${id}`,
          this.useAuthorization(),
        ),
      )
    ).data.text;
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

  private useAuthorization() {
    const token = sign(
      { spawner: process.env.SPAWNER_API.toLowerCase() },
      process.env.SPAWNER_SECRET,
      { expiresIn: '3m' },
    );

    return { headers: { Authorization: `Bearer ${token}` } };
  }
}
