import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { sign } from 'jsonwebtoken';

export interface RequestedSpawnerInfo {
    name: string;
    capacity: number;
}

type Nickname = string;
export interface ServerDescription {
    url: string;
    owner: Nickname;
    capacity: number;
    occupancy: number;
    started: boolean;
}

export interface NewCustomGameOptions {
    ownerId: string;
    backendApi: string;
}

export interface InstanceDescriptor {
    instanceUrl: string;
}

export class SpawnerApi {
    private http!: AxiosInstance;
    constructor(
        public entry: string,
        private _secret: string = ''
    ) {
        this.http = axios.create({ baseURL: entry });
        this.updateAuthorizationHeader();
    }

    set secret(value: string) {
        this._secret = value;
        this.updateAuthorizationHeader();
    }

    get secret() {
        return this._secret;
    }

    async info(): Promise<AxiosResponse<RequestedSpawnerInfo>> {
        return this.http.get<RequestedSpawnerInfo>('/info');
    }

    async gameList(): Promise<AxiosResponse<ServerDescription>> {
        return this.http.get<ServerDescription>('/game/list');
    }

    async requestCustomInstance(options: NewCustomGameOptions): Promise<AxiosResponse<InstanceDescriptor>> {
        return this.http.post<InstanceDescriptor>('/game/new_custom', options);
    }

    useAuthorization(use: boolean): void {
        use ?
            this.updateAuthorizationHeader() :
            delete this.http.defaults.headers.common.Authorization;
    }

    private updateAuthorizationHeader() {
        this.http.defaults.headers.common.Authorization = `Bearer ${sign({}, this._secret, { expiresIn: '24h' })}`;
    }
}