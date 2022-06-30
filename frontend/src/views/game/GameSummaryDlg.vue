<template>
<v-dialog
  :value="show"
  @input="emitShow"
  transition="dialog-top-transition"
  max-width="600">
  <template v-slot:default="">
    <v-card>
      <v-toolbar color="primary" dark>Summary</v-toolbar>
      <v-card-text>
        <div class="text-h2 mb-2 font-weight-bold">{{ winner }}</div>
        <div class="text-h4 font-weight-medium">{{ cpm }} cpm. Accuracy: {{ accuracy }}</div>
        <v-data-table v-if="hasRival" :headers="headers" :items="participants">
          <template v-slot:[`item.cpm`]="{ item }">
            {{ item.cpm.toFixed(1) }}
          </template>
          <template v-slot:[`item.accuracy`]="{ item }">
            {{ accuracyStr(item.accuracy) }}
          </template>
      </v-data-table>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn text @click="backToMenu">Exit To Main Menu</v-btn>
      </v-card-actions>
    </v-card>
  </template>
</v-dialog>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Prop, Model, Emit, Mixins } from 'vue-property-decorator';

import { GameMixin } from '@/mixins';
import { GameSummary, PlayerStats } from '@/gameplay/strategies/game-strategy';

interface Participants {
  nickname: string;
  cpm: number;
  accuracy: number;
}

@Component
export default class GameSummaryDlg extends Mixins(GameMixin) {
  @Model('show')
  readonly show!: boolean;

  @Prop({ required: true, type: Object })
  readonly summary!: GameSummary;

  @Emit('show')
  emitShow (show: boolean): void { }

  private headers = [
    { text: 'Nickname', value: 'nickname' },
    { text: 'CPM', value: 'cpm' },
    { text: 'Accuracy', value: 'accuracy' }
  ];

  get winner (): string {
    return this.nicknameById(this.summary.winner);
  }

  get cpm (): number {
    if (!this.winnerStats) { return 0; }

    return this.avgCPM(this.winnerStats.cpm);
  }

  get accuracy (): string {
    if (!this.winnerStats) { return '0'; }

    return this.accuracyStr(this.winnerStats.accuracy);
  }

  get hasRival (): boolean {
    return this.summary.scores.length > 1;
  }

  get participants (): Participants[] {
    return this.summary.scores
      .filter(x => x.id !== this.summary.winner)
      .map(x => ({
        nickname: this.nicknameById(x.id),
        cpm: this.avgCPM(x.cpm),
        accuracy: x.accuracy
      }));
  }

  backToMenu (): void {
    this.$router.push({ name: 'MainMenuPlay' });
  }

  accuracyStr (accuracy: number): string {
    return `${(accuracy * 100).toFixed(1)}%`;
  }

  private get winnerStats (): PlayerStats | undefined {
    return this.summary.scores.find(p => p.id === this.summary.winner);
  }

  private avgCPM (samples: number[]): number {
    return Math.round(samples.reduce((acc, x) => x + acc, 0) / samples.length);
  }

  private nicknameById (id: string): string {
    return this.gameClient.game.players.find(p => p.id === id)?.nickname ?? 'Unknown';
  }
}
</script>
