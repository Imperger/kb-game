import { JwtService } from "@nestjs/jwt";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { SpawnerService } from "@/spawner/spawner.service";

interface GameInstanceToken {
  spawner: string;
}

@Injectable()
export class JwtKnownSpawnerGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly spawnerService: SpawnerService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authHeader: string | null = context.switchToHttp().getRequest()?.headers?.authorization;

    if (!(authHeader && authHeader.startsWith('Bearer'))) {
      return false;
    }

    const tokenStr = authHeader.substring(6).trim();
    const token = this.jwtService.decode(tokenStr) as GameInstanceToken;

    const spawner = (await this.spawnerService.listAll())
      .find(x => x.url === token.spawner);

    if (!spawner) {
      return false;
    }

    try {
      await this.jwtService.verifyAsync(tokenStr, { secret: spawner.secret });
      return true;
    } catch(e) {
      return false;
    }
  }
    
}