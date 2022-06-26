import { Inject, Injectable, Optional } from "@nestjs/common";
import Docker = require('dockerode');

@Injectable()
export class DockerService {
    private docker = new Docker({ socketPath: '/var/run/docker.sock' })

    get client(): Docker {
        return this.docker;
    }
}