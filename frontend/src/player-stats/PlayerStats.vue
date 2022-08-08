<template>
<v-container v-if="player">
  <v-row>
    <v-col class="text-h3">{{ nicknameFull }}</v-col>
  </v-row>
  <v-row justify="center">
    <v-col cols="5" class="text-h5">Played time</v-col>
    <v-col cols="5" class="text-h5">{{ playedTime }}</v-col>
  </v-row>
  <v-row justify="center">
    <v-col cols="5" class="text-h5">MMR</v-col>
    <v-col cols="5" class="text-h5">{{ player.elo }}</v-col>
  </v-row>
  <v-row justify="center">
    <v-col cols="5" class="text-h5">CPM</v-col>
    <v-col cols="5" class="text-h5">{{ cpm }}</v-col>
  </v-row>
  <v-row justify="center">
    <v-col cols="5" class="text-h5">Total games</v-col>
    <v-col cols="5" class="text-h5">{{ player.totalPlayed }}</v-col>
  </v-row>
  <v-row justify="center">
    <v-col cols="5" class="text-h5">Won games</v-col>
    <v-col cols="5" class="text-h5">{{ player.totalWins }}</v-col>
  </v-row>
  <v-row justify="center">
    <v-col cols="5" class="text-h5">Win rate</v-col>
    <v-col cols="5" class="text-h5">{{ winrate }}</v-col>
  </v-row>
</v-container>
<v-container v-else>
  <v-row>
    <v-col class="text-h3">Player not found</v-col>
  </v-row>
</v-container>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';

import { ApiServiceMixin } from '@/mixins';
import { PlayerStats as Player } from '@/services/api-service/player/player-stats';

@Component
export default class PlayerStats extends Mixins(ApiServiceMixin) {
  @Prop()
  private player: Player | null = null;

  get nicknameFull (): string {
    return `${this.player?.nickname}#${this.player?.discriminator}`;
  }

  get playedTime (): string {
    return `${this.player?.hoursInGame.toFixed(1)}h`;
  }

  get cpm (): string {
    return `${this.player?.averageCpm}/${this.player?.maxCpm}`;
  }

  get winrate (): string {
    const total = this.player?.totalPlayed ? this.player?.totalPlayed : 1;

    return this.player
      ? `${(this.player?.totalWins / total * 100).toFixed(1)}%`
      : '0%';
  }
}
</script>
