import { SetMetadata } from '@nestjs/common';
import { Scope, scopeMetaId } from '@/auth/scopes';

export const HasScopes = (...scopes: Scope[]) =>
  SetMetadata(scopeMetaId, scopes);
