<template>
<v-card class="replay-item ma-3">
  <v-card-title class="replay-item-title">
    <div>{{ replay.id }}</div>
    <div class="replay-item-upload-date">{{ uploadDate }}</div>
  </v-card-title>
  <v-card-text>
    <v-container>
    <v-row v-for="t in replay.tracks" :key="t.player.id" :class="{'highlight-yourself': isMe(t.player.id)}">
      <v-col cols="4" class="replay-item-col">{{ fullNickname(t.player.nickname)}}</v-col>
      <v-col cols="3" class="replay-item-col">{{ t.cpm }}</v-col>
      <v-col cols="3" class="replay-item-col">{{ accuracyStr(t.accuracy) }}</v-col>
    </v-row>
    </v-container>
  </v-card-text>
</v-card>
</template>

<style scoped>
.replay-item {
  min-width: 300px;
  min-height: 220px;
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

.replay-item-col {
  margin: 0;
  padding: 0;
}

.highlight-yourself {
  font-weight: bold;
}
</style>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';

import { Nickname, ReplayOverview } from '@/services/api-service/replay/replay-overview';
import { StoreMixin } from '@/mixins';

@Component
export default class ReplayItemOverview extends Mixins(StoreMixin) {
  @Prop({ required: true })
  private readonly currentPlayerId!: string;

  @Prop({ required: true })
  private readonly replay!: ReplayOverview;

  fullNickname (nickname: Nickname): string {
    return `${nickname.nickname}#${nickname.discriminator}`;
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
}
</script>
