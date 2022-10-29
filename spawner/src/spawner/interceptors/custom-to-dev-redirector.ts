import { ConflictException, Injectable } from "@nestjs/common";

import { CustomGameOptions, InstanceRequestResult, SpawnerService } from "../spawner.service";

@Injectable()
export class CustomToDevRedirector extends SpawnerService {
    async createCustomGame(options: CustomGameOptions): Promise<InstanceRequestResult | null> {
        return { instanceUrl: 'wss://spawner.dev.wsl:3001/random_generated_instance_id' }
    }
}
