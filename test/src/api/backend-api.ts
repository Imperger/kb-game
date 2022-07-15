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

    private async handleAuthToken(signin: () => Promise<AxiosResponse<LoginResponse>>): Promise<AxiosResponse<LoginResponse>> {
        const ret = await signin();

        this.token = ret.data.token;

        this.http.defaults.headers.common.Authorization = `Bearer ${this.token}`;

        return ret;
    }
}
