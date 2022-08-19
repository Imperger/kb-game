import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DockerService } from './docker.service';
import { InstanceNameResolverService } from './instance-name-resolver.service';
import { QuickToDevRedirector } from './interceptors/quick-to-dev-redirector';

import { SpawnerService } from './spawner.service';

function spawnerServiceInjector() {
    switch (process.env.NODE_ENV) {
        case 'quick-redirect':
            return QuickToDevRedirector;
        default:
            return SpawnerService;
    }
}

@Module({
    imports: [HttpModule],
    providers: [
        InstanceNameResolverService,
        {
            provide: SpawnerService,
            useClass: spawnerServiceInjector()
        },
        DockerService],
    exports: [SpawnerService]
})
export class SpawnerModule {
}
