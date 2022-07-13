import { BackendApi } from "./api/backend-api";
import { SpawnerApi } from "./api/spawner-api";

export interface Api {
    backend: BackendApi;
    spawner: SpawnerApi;
}