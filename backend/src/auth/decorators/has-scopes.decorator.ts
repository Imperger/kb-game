import { SetMetadata } from "@nestjs/common";
import { Scope, scopeMetaId } from "../scopes";

export const HasScopes = (...scopes: Scope[]) => SetMetadata(scopeMetaId, scopes);