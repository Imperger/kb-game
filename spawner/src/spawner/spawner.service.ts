import { Injectable } from '@nestjs/common';
import Docker = require('dockerode');

@Injectable()
export class SpawnerService {
  private docker = new Docker({ socketPath: '/var/run/docker.sock' });

  async getContainers() {
    return (await this.docker.listContainers()).map((c) => c.Id).join('\n');
  }
}
