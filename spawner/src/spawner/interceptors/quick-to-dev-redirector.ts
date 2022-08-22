import { ConflictException, Injectable } from "@nestjs/common";

import { InstanceRequestResult, QuickGameOptions, SpawnerService } from "../spawner.service";

@Injectable()
export class QuickToDevRedirector extends SpawnerService {
    async createQuickGame(options: QuickGameOptions): Promise<InstanceRequestResult | null> {
        return { instanceUrl: 'wss://spawner.dev.wsl:3001/random_generated_instance_id' }
    }
}
