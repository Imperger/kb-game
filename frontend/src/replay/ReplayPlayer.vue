<template>
<v-container fluid>
  <v-row>
    <v-col cols=10>
      <v-card>
        <v-card-text class="replay-player-text">
          <span v-for="t in styledText" :key="t.id" :style="t.style">{{ t.char }}</span>
        </v-card-text>
        </v-card>
    </v-col>
    <v-col>
      <transition-group name="replay-player-player-list">
        <div v-for="p in players" :key="p.nickname" :style="{ color: p.color }">{{ p.nickname }}</div>
      </transition-group>
    </v-col>
  </v-row>
  <v-row class>
    <v-col class="replay-player-playback-time" cols="10">{{ playbackTimeUI }}</v-col>
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

.replay-player-playback-time {
  margin-top: -10px;
  margin-bottom: -20px;
  padding: 0;
}

.replay-player-controls {
  display: flex;
  flex-direction: row;
  padding: 0;
}

.replay-player-seek {
  margin-top: 16px;
}

.replay-player-player-list-move {
  transition: transform 0.5s;
}
</style>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';

import { ApiServiceMixin } from '@/mixins';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { InputEventSnapshot, Nickname, ReplaySnapshot, TrackSnapshot } from '@/services/api-service/replay/replay-snapshot';

interface PlayerItem {
  nickname: string;
  color: string;
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

interface Track extends TrackSnapshot {
  colorIdx: number;
  progress: number;
}

interface Replay extends ReplaySnapshot {
  tracks: Track[];
}

interface MergedInputEvent {
  track: Track;
  char: string;
  correct: boolean;
  timestamp: number;
}

@Component
export default class ReplayPlayer extends Mixins(ApiServiceMixin) {
  @Prop({ required: true })
  private readonly id!: string;

  private replay: Replay = { id: '', duration: 0, tracks: [], createdAt: new Date(0) };

  private isPlaying = false;

  private currentTime = 0;

  private speed = 1;

  private readonly speedList = [0.25, 0.5, 1, 1.5, 2, 2.5, 3, 5];

  private pendingEventIdx = 0;

  private readonly colorPool = [
    '#f44336', '#8e24aa', '#1e88e5', '#00e5ff', '#4caf50',
    '#76ff03', '#fdd835', '#ff6f00', '#ff3d00', '#4e342e'];

  async created (): Promise<void> {
    const replay = await this.api.replay.getReplay(this.id);

    if (!isRejectedResponse(replay)) {
      this.replay = {
        ...replay,
        tracks: replay.tracks.map((x, i) => ({ ...x, colorIdx: i, progress: -1 }))
      };
    }

    this.resetPlayerProgress();
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
    this.replay.tracks.forEach(x => (x.progress = -1));
  }

  private updatePlayerView (elapsed: number): void {
    this.currentTime += elapsed * this.speed;

    if (this.pendingEventIdx < this.mergedTracks.length &&
    this.currentTime >= this.mergedTracks[this.pendingEventIdx].timestamp) {
      ++this.mergedTracks[this.pendingEventIdx].track.progress;

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

  get text (): InputEventSnapshot[] {
    return this.replay.tracks[0]?.data.filter(x => x.correct) ?? [];
  }

  get styledText (): TextItem[] {
    return this.text.map((x, i) => ({
      id: x.timestamp,
      char: x.char,
      style: this.characterStyle(i)
    })) ?? [];
  }

  private characterStyle (idx: number): TextItemStyle {
    const playerAtThisIdx = this.replay.tracks.find(x => x.progress === idx);

    return playerAtThisIdx
      ? { backgroundColor: this.colorPool[playerAtThisIdx.colorIdx], color: 'white' }
      : { };
  }

  get playBtnIcon (): string {
    return this.isPlaying ? 'mdi-pause' : 'mdi-play';
  }

  get currentSeek (): number {
    return this.currentTime / this.replay.duration / 10;
  }

  get players (): PlayerItem[] {
    return (this.isEnd
      ? [...this.replay.tracks]
      : [...this.replay.tracks].sort((a, b) => b.progress - a.progress))
      .map(x => ({
        nickname: this.fullNickname(x.player.nickname),
        color: this.colorPool[x.colorIdx]
      }));
  }

  get speedUI (): string {
    return this.formatSpeedUI(this.speed);
  }

  get playbackTimeUI () : string {
    return `${this.msToTime(this.currentTime)} - ${this.msToTime(this.replay.duration * 1000)}`;
  }

  private msToTime (ms: number): string {
    const seconds = ms / 1000;
    const minutes = Math.floor(seconds / 60);
    const remSeconds = Math.round(seconds - minutes * 60);
    return `${minutes.toString().padStart(2, '0')}:${remSeconds.toString().padStart(2, '0')}`;
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
        track: this.replay.tracks[closestIdx],
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
