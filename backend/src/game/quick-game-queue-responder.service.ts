import { Injectable } from "@nestjs/common";

import { QuickGameDescriptor } from "./interfaces/quick-game-descriptor";
import { QuickGameRequestResolver } from "./interfaces/request-resolver";

type PlayerId = string;

@Injectable()
export class QuickGameQueueResponderService {
  private readonly pendingRequests = new Map<PlayerId, QuickGameRequestResolver>();

  register(id: PlayerId, resolver: QuickGameRequestResolver) {
    this.pendingRequests.set(id, resolver);
  }

  resolve(id: PlayerId, response: QuickGameDescriptor | null): boolean {
    const resolver = this.pendingRequests.get(id);

    if (!resolver) {
      return false;
    }

    this.pendingRequests.delete(id);

    resolver(response);

    return true;
  }
}
