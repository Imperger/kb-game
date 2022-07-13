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

export class BackendApi {
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
}
