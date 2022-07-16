import axios, { AxiosInstance, AxiosResponse } from "axios";

export enum StatusCode { Ok = 0 }

export interface AuthResponse {
    code: StatusCode;
}

export interface NewUser {
    username: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    code: StatusCode;
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

export class BackendApi {
    private token!: string;
    private http!: AxiosInstance;
    constructor(
        public entry: string
    ) {
        this.http = axios.create({ baseURL: entry });
    }

    register(user: NewUser): Promise<AxiosResponse<AuthResponse>> {
        return this.http.post<AuthResponse>('/auth/register', user);
    }

    confirmRegistration(token: string): Promise<AxiosResponse<AuthResponse>> {
        return this.http.patch<AuthResponse>('/auth/registration/confirm', { code: token });
    }

    loginUsername(username: string, password: string): Promise<AxiosResponse<LoginResponse>> {
        return this.handleAuthToken(() => this.http.post<LoginResponse>('/auth/login/username', { username, password }));
    }

    loginEmail(email: string, password: string): Promise<AxiosResponse<LoginResponse>> {
        return this.handleAuthToken(() => this.http.post<LoginResponse>('/auth/login/email', { email, password }));
    }

    me(): Promise<AxiosResponse<CurrentUser>> {
        return this.http.get<CurrentUser>('/user/me')
    }

    listGames(): Promise<AxiosResponse<ServerDescription[]>> {
        return this.http.get<ServerDescription[]>('/game/list');
    }

    addScenario(title: string, text: string): Promise<AxiosResponse<string>> {
        return this.http.post<string>('/scenario/add', { title, text });
    }

    updateScenario(id: string, content: ScenarioContent): Promise<AxiosResponse<boolean>> {
        return this.http.put<boolean>(`/scenario/update/${id}`, content);
    }

    removeScenario(id: string): Promise<AxiosResponse<boolean>> {
        return this.http.delete<boolean>(`/scenario/remove/${id}`);
    }

    listScenario(offset: number, limit: number): Promise<AxiosResponse<ScenarioPage>> {
        return this.http.get<ScenarioPage>(`/scenario/list?offset=${offset}&limit=${limit}`);
    }

    getScenarioContent(id: string): Promise<AxiosResponse<ScenarioContent>> {
        return this.http.get<ScenarioContent>(`/scenario/content/${id}`);
    }

    private async handleAuthToken(signin: () => Promise<AxiosResponse<LoginResponse>>): Promise<AxiosResponse<LoginResponse>> {
        const ret = await signin();

        this.token = ret.data.token;

        this.http.defaults.headers.common.Authorization = `Bearer ${this.token}`;

        return ret;
    }
}
