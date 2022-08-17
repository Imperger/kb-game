import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import type { FailType } from "../api-tester";
import { RejectedResponse } from "./types";

export interface NewUser {
    username: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export interface CurrentUser {
    username: string;
    email: string;
    avatar: string;
    registeredAt: Date;
    scopes: {
        assignScope: boolean;
        serverMaintainer: boolean;
        blockedUntil: Date;
        editScenario: boolean;
        moderateChat: boolean;
        mutedUntil: Date;
    }
}

export interface CustomGameDescriptor {
    instanceUrl: string;
    playerToken: string;
}

export interface ConnectionDescriptor {
    playerToken: string;
}

export interface ConnectGameOptions {
    instanceUrl: string;
}

type Nickname = string;
export interface ServerDescription {
    url: string;
    owner: Nickname;
    capacity: number;
    occupancy: number;
    started: boolean;
}

export interface ScenarioContent {
    title: string;
    text: string;
}

export interface Scenario {
    id: string;
    title: string;
    text: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ScenarioPage {
    total: number;
    scenarios: Scenario[];
}

export interface RequestedSpawnerInfo {
    name: string;
    capacity: number;
}

export interface SpawnerInfo {
    url: string;
    name: string;
    capacity: number;
}

export interface ScenarioTitle {
    id: string;
    title: string;
}

export interface ScenarioText {
    text: string;
}

export interface CurrentGame {
    instanceUrl: string;
    updatedAt?: Date;
}

export interface PlayerStats {
    nickname: string;
    discriminator: number;
    game: CurrentGame | null;
    hoursInGame: number;
    elo: number;
    totalPlayed: number;
    totalWins: number;
    averageCpm: number;
    maxCpm: number;
    quickGameQueue: Date | null;
}

export interface QuickGameDescriptor {
    instanceUrl: string;
    playerToken: string;
  }  

export class BackendApi {
    private token!: string;
    private http!: AxiosInstance;
    constructor(
        public entry: string
    ) {
        this.http = axios.create({ baseURL: entry });
    }

    raw<TSuccess, TError>(config: AxiosRequestConfig<any>): Promise<AxiosResponse<TSuccess>> | FailType<TError> {
        return this.http.request(config);
    }

    register(user: NewUser): Promise<AxiosResponse<void>> | FailType<RejectedResponse> {
        return this.http.post<void>('/auth/register', user);
    }

    confirmRegistration(token: string): Promise<AxiosResponse<void>> | FailType<RejectedResponse> {
        return this.http.patch<void>('/auth/registration/confirm', { code: token });
    }

    loginUsername(username: string, password: string): Promise<AxiosResponse<LoginResponse>> | FailType<RejectedResponse> {
        return this.handleAuthToken(() => this.http.post<LoginResponse>('/auth/login/username', { username, password }));
    }

    loginEmail(email: string, password: string): Promise<AxiosResponse<LoginResponse>> | FailType<RejectedResponse> {
        return this.handleAuthToken(() => this.http.post<LoginResponse>('/auth/login/email', { email, password }));
    }

    me(): Promise<AxiosResponse<CurrentUser>> | FailType<RejectedResponse> {
        return this.http.get<CurrentUser>('/user/me')
    }

    newCustomGame(): Promise<AxiosResponse<CustomGameDescriptor>> | FailType<RejectedResponse> {
        return this.http.post<CustomGameDescriptor>('game/new_custom');
    }

    connectToGame(options: ConnectGameOptions): Promise<AxiosResponse<ConnectionDescriptor>> | FailType<RejectedResponse> {
        return this.http.post<ConnectionDescriptor>('game/connect', options);
    }

    listGames(): Promise<AxiosResponse<ServerDescription[]>> | FailType<RejectedResponse> {
        return this.http.get<ServerDescription[]>('/game/list');
    }

    enterQuickQueue() {
        return this.http.put<QuickGameDescriptor | null>('/game/enter_quick');
    }

    leaveQuickQueue() {
        return this.http.put<boolean>('/game/leave_quick');
    }

    addScenario(title: string, text: string): Promise<AxiosResponse<string>> | FailType<RejectedResponse> {
        return this.http.post<string>('/scenario', { title, text });
    }

    updateScenario(id: string, content: ScenarioContent): Promise<AxiosResponse<boolean>> | FailType<RejectedResponse> {
        return this.http.put<boolean>(`/scenario/${id}`, content);
    }

    removeScenario(id: string): Promise<AxiosResponse<void>> | FailType<RejectedResponse> {
        return this.http.delete<void>(`/scenario/${id}`);
    }

    listScenario(offset: number, limit: number): Promise<AxiosResponse<ScenarioPage>> | FailType<RejectedResponse> {
        return this.http.get<ScenarioPage>(`/scenario?offset=${offset}&limit=${limit}`);
    }

    getScenarioContent(id: string): Promise<AxiosResponse<ScenarioContent>> | FailType<RejectedResponse> {
        return this.http.get<ScenarioContent>(`/scenario/${id}`);
    }

    getAllScenarioTitles(accessToken: string): Promise<AxiosResponse<ScenarioTitle[]>> | FailType<RejectedResponse> {
        return this.http.get<ScenarioTitle[]>('/scenario/titles', { headers: { Authorization: `Bearer ${accessToken}` } });
    }

    getScenarioText(id: string, accessToken: string): Promise<AxiosResponse<ScenarioText>> | FailType<RejectedResponse> {
        return this.http.get<ScenarioText>(`/scenario/text/${id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    }

    addSpawner(url: string, secret: string): Promise<AxiosResponse<RequestedSpawnerInfo>> | FailType<RejectedResponse> {
        return this.http.post<RequestedSpawnerInfo>('/spawner', { url, secret });
    }

    removeSpawner(url: string): Promise<AxiosResponse<boolean>> | FailType<RejectedResponse> {
        return this.http.delete<boolean>(`/spawner/${Buffer.from(url).toString('base64')}`);
    }

    listSpawners(): Promise<AxiosResponse<SpawnerInfo>> | FailType<RejectedResponse> {
        return this.http.get<SpawnerInfo>('/spawner');
    }

    linkGamePlayer(playerId: string, instanceUrl: string, accessToken: string): Promise<AxiosResponse<boolean>> | FailType<RejectedResponse> {
        return this.http.patch<boolean>(
            `/player/${playerId}/link_game`,
            { instanceUrl },
            { headers: { Authorization: `Bearer ${accessToken}` } });
    }

    unlinkGamePlayer(playerId: string, accessToken: string): Promise<AxiosResponse<boolean>> | FailType<RejectedResponse> {
        return this.http.patch<boolean>(
            `/player/${playerId}/unlink_game`,
            {},
            { headers: { Authorization: `Bearer ${accessToken}` } });
    }

    unlinkGamePlayers(instanceUrl: string, accessToken: string): Promise<AxiosResponse<boolean>> | FailType<RejectedResponse> {
        return this.http.patch<boolean>(
            '/player/unlink_game',
            { instanceUrl },
            { headers: { Authorization: `Bearer ${accessToken}` } });
    }

    getPlayerStats(nickname: string): Promise<AxiosResponse<PlayerStats>> | FailType<RejectedResponse> {
        return this.http.get<PlayerStats>(`/player/${nickname}`);
    }

    currentPlayerStats(): Promise<AxiosResponse<PlayerStats>> | FailType<RejectedResponse> {
        return this.http.get<PlayerStats>('/player/me');
    }

    private async handleAuthToken(signin: () => Promise<AxiosResponse<LoginResponse>>): Promise<AxiosResponse<LoginResponse>> {
        const ret = await signin();

        this.token = ret.data.token;

        this.http.defaults.headers.common.Authorization = `Bearer ${this.token}`;

        return ret;
    }
}
