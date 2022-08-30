import { Subject } from "rxjs";
import { ModuleRef } from "@nestjs/core";
import { Injectable, OnModuleInit, Type } from "@nestjs/common";

import { MatchMakingStrategy, Participant, PlayerGroup } from "./match-makin-strategy";
import { PlayerServiceExtension } from "./player-service-extension";
import { PlayerDescriptor } from '../interfaces/player-descriptor';

interface DeadlineDescriptor {
  player: PlayerDescriptor | null;
  inQueueSince: number | null;
  timer: NodeJS.Timeout | null;
}

/**
 * @param deadline deadline in seconds
 * @returns Strategy with given settings
 */
export const anyoneWithDeadlineStrategyFactory = (deadline: number): Type<MatchMakingStrategy> => {
  @Injectable()
  class AnyoneWithDeadlineStrategy implements MatchMakingStrategy, OnModuleInit {
    private readonly serverCapacity = 10;

    private totalInQueue = 0;

    private player: PlayerServiceExtension;

    private readonly deadline: DeadlineDescriptor = {
      player: null,
      inQueueSince: null,
      timer: null
    };

    public readonly $groupFormed = new Subject<PlayerGroup>();

    constructor(private readonly moduleRef: ModuleRef) { }

    async onModuleInit() {
      this.player = await this.moduleRef.create(PlayerServiceExtension);
    }

    async enterQueue(player: Participant) {
      ++this.totalInQueue;

      if (!this.deadline.player) {
        this.deadline.player = { playerId: player.id, nickname: player.nickname };
        this.deadline.inQueueSince = Date.now();
      }

      // Possible to create minimal clash
      if (this.totalInQueue === 2) {
        // Deadline had happened
        if (this.deadline.inQueueSince + deadline * 1000 <= Date.now()) {
          this.$groupFormed.next([
            this.deadline.player,
            { playerId: player.id, nickname: player.nickname }
          ]);
        } else {
          // Deadline didn't happen, waiting for more players
          this.deadline.timer = setTimeout(
            () => this.gatherPlayers(),
            deadline * 1000);
        }
      }

      // Possible to create a clash before deadline
      if (this.totalInQueue === this.serverCapacity) {
        // +2 for reschedule a deadline without extra query
        const candidates = await this.player.findByOrderedInQueueTime(this.serverCapacity + 2);

        if (candidates.length >= this.serverCapacity) {
          this.$groupFormed.next(candidates.slice(0, this.serverCapacity).map(({ id, nickname }) => ({ playerId: id, nickname })));
        }

        if (candidates.length == this.serverCapacity + 2) {
          this.deadline.player = {
            playerId: candidates[this.serverCapacity].id,
            nickname: candidates[this.serverCapacity].nickname
          };

          this.deadline.timer = setTimeout(
            () => this.gatherPlayers(),
            this.deadline.inQueueSince - Date.now());
        }
      }
    }

    async leaveQueue(player: Participant) {
      --this.totalInQueue;

      if (this.totalInQueue < 2) {
        clearTimeout(this.deadline.timer);
        this.deadline.timer = null;
      }

      if (this.deadline.player?.playerId === player.id) {
        this.deadline.player = null;
        clearTimeout(this.deadline.timer);
        this.deadline.timer = null;

        const nextDeadline = await this.player.findByOrderedInQueueTime(1);

        if (nextDeadline.length) {
          this.deadline.player = { playerId: nextDeadline[0].id, nickname: nextDeadline[0].nickname };
          this.deadline.timer = setTimeout(
            () => this.gatherPlayers(),
            this.deadline.inQueueSince - Date.now());
        }
      }
    }

    async gatherPlayers() {
      // +2 for reschedule a deadline without extra query
      const candidates = await this.player.findByOrderedInQueueTime(this.serverCapacity + 2);

      if (candidates.length > 1) {
        this.$groupFormed.next(candidates.slice(0, Math.min(candidates.length, this.serverCapacity))
          .map(({ id, nickname }) => ({ playerId: id, nickname })));
      }

      if (candidates.length === this.serverCapacity + 2) {
        this.deadline.player = {
          playerId: candidates[this.serverCapacity].id,
          nickname: candidates[this.serverCapacity].nickname
        };

        this.deadline.inQueueSince = candidates[this.serverCapacity].quickGameQueue.getTime();
        this.deadline.timer = setTimeout(
          () => this.gatherPlayers(),
          Math.max(0, deadline * 1000 - Date.now() + candidates[this.serverCapacity].quickGameQueue.getTime()));
      }
    }
  }

  return AnyoneWithDeadlineStrategy;
}
