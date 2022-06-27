import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DockerService } from './docker.service';

import { SpawnerService } from './spawner.service';

@Module({
    imports: [HttpModule],
    providers: [SpawnerService, DockerService],
    exports: [SpawnerService]
})
export class SpawnerModule {
}
