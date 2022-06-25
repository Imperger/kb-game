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
        <div class="text-h4 font-weight-medium">{{ cpm }} cpm. Accuracy: {{ accuracy }}%</div>
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
import { GameSummary } from '@/gameplay/strategies/game-strategy';

@Component
export default class GameSummaryDlg extends Mixins(GameMixin) {
  @Model('show')
  readonly show!: boolean;

  @Prop({ required: true, type: Object })
  readonly summary!: GameSummary;

  @Emit('show')
  emitShow (show: boolean): void { }

  get winner (): string {
    return this.gameClient.game.players.find(p => p.id === this.summary.winner)?.nickname ?? 'Unknown';
  }

  get cpm (): number {
    const replay = this.summary.scores.find(s => s.id === this.summary.winner);

    if (!replay) { return 0; }

    return Math.round(replay.cpm.reduce((acc, x) => x + acc, 0) / replay.cpm.length);
  }

  get accuracy (): string {
    const replay = this.summary.scores.find(s => s.id === this.summary.winner);

    if (!replay) { return '0'; }

    return (replay.accuracy * 100).toFixed(1);
  }

  backToMenu (): void {
    this.$router.push({ name: 'MainMenuPlay' });
  }
}
</script>
