import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { DockerService } from './docker.service';
import { InstanceNameResolverService } from './instance-name-resolver.service';
import { CustomToDevRedirector } from './interceptors/custom-to-dev-redirector';
import { QuickToDevRedirector } from './interceptors/quick-to-dev-redirector';
import { SpawnerService } from './spawner.service';


function spawnerServiceInjector() {
    switch (process.env.NODE_ENV) {
        case 'custom-redirect':
            return CustomToDevRedirector;
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
