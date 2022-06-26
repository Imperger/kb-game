import { Module } from '@nestjs/common';
import { DockerService } from './docker.service';

import { SpawnerService } from './spawner.service';

@Module({
    providers: [SpawnerService, DockerService],
    exports: [SpawnerService]
})
export class SpawnerModule {
}
