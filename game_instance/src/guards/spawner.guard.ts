import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { verify } from 'jsonwebtoken';

/**
 * Allows only signed by spawner request
 */

@Injectable()
export class SpawnerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authHeader: string | null = context.switchToHttp().getRequest()
      ?.headers?.authorization;

    if (!(authHeader && authHeader.startsWith('Bearer'))) {
      return false;
    }

    const tokenStr = authHeader.substring(6).trim();

    try {
      verify(tokenStr, process.env.SPAWNER_SECRET);
      return true;
    } catch (e) {
      return false;
    }
  }
}
