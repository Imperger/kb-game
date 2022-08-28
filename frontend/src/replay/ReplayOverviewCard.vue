<template>
<v-card class="replay-item ma-3">
  <v-card-title class="replay-item-title">
    <router-link :to="toPlayer(replay.id)">{{ replay.id }}</router-link>
    <div class="replay-item-upload-date">{{ uploadDate }}</div>
  </v-card-title>
  <v-card-text>
    <v-container class="replay-item-container">
    <v-row v-for="t in replay.tracks" :key="t.player.id" :class="{'highlight-yourself': isMe(t.player.id)}">
      <v-col cols="4" class="replay-item-col">{{ fullNickname(t.player.nickname)}}</v-col>
      <v-col cols="3" class="replay-item-col">{{ t.cpm }}</v-col>
      <v-col cols="3" class="replay-item-col">{{ accuracyStr(t.accuracy) }}</v-col>
    </v-row>
    </v-container>
    <div class="replay-item-duration">{{ duration }}</div>
  </v-card-text>
</v-card>
</template>

<style scoped>
.replay-item {
  min-width: 300px;
  min-height: 264px;
}

.replay-item-title {
  color: #757575;
  font-size: 0.7em;
  margin: -5px 0 1px 5px;
  padding: 0;
}

.replay-item-upload-date {
  margin: 0 5px 0 auto;
}

.replay-item-container {
  align-content: flex-start;
}

.replay-item-col {
  margin: 0;
  padding: 0;
}

.highlight-yourself {
  font-weight: bold;
}

.replay-item-duration {
  position: absolute;
  bottom: 0;
  right: 7px;
}
</style>

<script lang="ts">
import { RawLocation } from 'vue-router';
import { Component, Prop, Mixins } from 'vue-property-decorator';

import { Nickname, ReplayOverview } from '@/services/api-service/replay/replay-overview';
import { StoreMixin } from '@/mixins';
import { msToMmss } from '@/util/formatters/ms-to-mm-ss';

@Component
export default class ReplayOverviewCard extends Mixins(StoreMixin) {
  @Prop({ required: true })
  private readonly currentPlayerId!: string;

  @Prop({ required: true })
  private readonly replay!: ReplayOverview;

  fullNickname (nickname: Nickname): string {
    return `${nickname.nickname}#${nickname.discriminator}`;
  }

  toPlayer (id: string): RawLocation {
    return { name: 'ReplayPlayer', params: { id } };
  }

  accuracyStr (accuracy: number): string {
    return `${(accuracy * 100).toFixed(1)}%`;
  }

  isMe (playerId: string): boolean {
    return this.currentPlayerId === playerId;
  }

  get uploadDate (): string {
    const d = this.replay.createdAt;
    return Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    }).format(d);
  }

  get duration () : string {
    return msToMmss(this.replay.duration * 1000);
  }
}
</script>
