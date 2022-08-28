<template>
<v-container fluid>
  <v-row>
    <v-col cols=10>
      <v-card>
        <v-card-text class="replay-player-text">
        <span v-for="t in text" :key="t.id" :style="t.style">{{ t.char }}</span>
        </v-card-text>
        </v-card>
    </v-col>
    <v-col>
      <div v-for="p in players" :key="p.nickname" :style="{ color: p.color }">{{ p.nickname }}</div>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="10" class="replay-player-controls">
      <v-btn @click="playPause" icon><v-icon>{{ playBtnIcon }}</v-icon></v-btn>
      <v-progress-linear color="blue-grey" :value="currentSeek" class="replay-player-seek" />
      <v-menu>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on"><v-icon>mdi-play-speed</v-icon></v-btn>
        </template>
        <v-list>
          <v-list-item v-for="s in speedList" :key="s" @click="changeSpeed(s)">
            <v-list-item-title>{{ formatSpeedUI(s) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <div>{{ speedUI }}</div>
    </v-col>
  </v-row>
</v-container>
</template>

<style scoped>
.replay-player-text {
  font-size: 1.3em;
  text-align: left;
}

.replay-player-controls {
  display: flex;
  flex-direction: row;
  padding: 0;
}

.replay-player-seek {
  margin-top: 16px;
}
</style>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';

import { ApiServiceMixin } from '@/mixins';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { Nickname, ReplaySnapshot } from '@/services/api-service/replay/replay-snapshot';

interface PlayerItem {
  nickname: string;
  color: string;
}

interface MergedInputEvent {
  playerId: string;
  char: string;
  correct: boolean;
  timestamp: number;
}

interface TextItemStyle {
  color?: string;
  backgroundColor?: string;
}

interface TextItem {
  id: number;
  char: string;
  style: TextItemStyle;
}

@Component
export default class ReplayPlayer extends Mixins(ApiServiceMixin) {
  @Prop({ required: true })
  private readonly id!: string;

  private replay: ReplaySnapshot = { id: '', duration: 0, tracks: [], createdAt: new Date(0) };

  private isPlaying = false;

  private currentTime = 0;

  private speed = 1;

  private readonly speedList = [0.25, 0.5, 1, 1.5, 2, 2.5, 3, 5];

  private pendingEventIdx = 0;

  private playersProgress: number[] = [];

  private playerToIdx!: Map<string, number>;

  private readonly colorPool = [
    '#f44336', '#8e24aa', '#1e88e5', '#00e5ff', '#4caf50',
    '#76ff03', '#fdd835', '#ff6f00', '#ff3d00', '#4e342e'];

  async created (): Promise<void> {
    const replay = await this.api.replay.getReplay(this.id);

    if (!isRejectedResponse(replay)) {
      this.replay = replay;
    }

    this.resetPlayerProgress();
    this.playerToIdx = new Map(this.replay.tracks.map((x, i) => [x.player.id, i]));
  }

  destroyed (): void {
    this.isPlaying = false;
  }

  playPause (): void {
    if (!this.isPlaying) {
      if (this.isEnd) {
        this.resetPlayer();
      }

      this.scheduleRAF();
    }

    this.isPlaying = !this.isPlaying;
  }

  private scheduleRAF (): void {
    const prev = performance.now();
    window.requestAnimationFrame(x => this.updatePlayerView(x - prev));
  }

  private resetPlayer (): void {
    this.currentTime = 0;
    this.resetPlayerProgress();
    this.pendingEventIdx = 0;
  }

  private resetPlayerProgress (): void {
    this.playersProgress = Array.from({ length: this.replay.tracks.length }, x => -1);
  }

  private updatePlayerView (elapsed: number): void {
    this.currentTime += elapsed * this.speed;

    if (this.pendingEventIdx < this.mergedTracks.length &&
    this.currentTime >= this.mergedTracks[this.pendingEventIdx].timestamp) {
      const event = this.mergedTracks[this.pendingEventIdx];

      const senderIdx = this.playerToIdx.get(event.playerId) ?? -1;
      this.$set(
        this.playersProgress,
        senderIdx,
        this.playersProgress[senderIdx] + 1);

      ++this.pendingEventIdx;
    }

    if (this.isPlaying) {
      if (this.isEnd) {
        this.isPlaying = false;
      } else {
        this.scheduleRAF();
      }
    }
  }

  private get isEnd (): boolean {
    return this.currentTime >= this.replay.duration * 1000;
  }

  fullNickname (nickname: Nickname): string {
    return `${nickname.nickname}#${nickname.discriminator}`;
  }

  changeSpeed (speed: number): void {
    this.speed = speed;
  }

  get text (): TextItem[] {
    return this.replay.tracks[0]?.data
      .filter(x => x.correct)
      .map((x, i) => ({ id: x.timestamp, char: x.char, style: this.characterStyle(i) })) ?? [];
  }

  private characterStyle (idx: number): TextItemStyle {
    const playerAtThisIdx = this.playersProgress.indexOf(idx);

    return playerAtThisIdx >= 0
      ? { backgroundColor: this.players[playerAtThisIdx].color, color: 'white' }
      : { };
  }

  get playBtnIcon (): string {
    return this.isPlaying ? 'mdi-pause' : 'mdi-play';
  }

  get currentSeek (): number {
    return this.currentTime / this.replay.duration / 10;
  }

  get players (): PlayerItem[] {
    return this.replay.tracks
      .map((x, i) => ({
        nickname: this.fullNickname(x.player.nickname),
        color: this.colorPool[i]
      }));
  }

  get speedUI (): string {
    return this.formatSpeedUI(this.speed);
  }

  formatSpeedUI (speed: number): string {
    return `${speed}X`;
  }

  get mergedTracks (): MergedInputEvent[] {
    const ret: MergedInputEvent[] = [];

    const idxs = Array.from({ length: this.replay.tracks.length }, x => 0);

    while (!idxs.every((x, i) => x === this.replay.tracks[i].data.length)) {
      const closestIdx = this.minTimestampIdx(idxs);
      ret.push({
        playerId: this.replay.tracks[closestIdx].player.id,
        ...this.replay.tracks[closestIdx].data[idxs[closestIdx]]
      });

      ++idxs[closestIdx];
    }

    return ret;
  }

  private minTimestampIdx (idxs: number[]): number {
    let min = 0;
    for (let n = 0; n < idxs.length; ++n) {
      if ((this.replay.tracks[n].data[idxs[n]]?.timestamp ?? Infinity) <
      (this.replay.tracks[min].data[idxs[min]]?.timestamp ?? Infinity)) {
        min = n;
      }
    }

    return min;
  }
}
</script>