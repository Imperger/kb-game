<template>
<v-container>
  <typing-text-tracker :textImage="fieldImg" :scroll="scroll" :carriage="carriage" />
  <players-progress-panel :progress="playersProgress" />
  <game-summary-dlg v-model="summaryDlgShow" :summary="gameSummary" />
</v-container>
</template>

<style scoped>
</style>

<script lang="ts">
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { Component, Mixins } from 'vue-property-decorator';

import { GameMixin } from '@/mixins';
import KeyboardInputMixin from './KeyboardInputMixin';
import TypingTextTracker from './TypingTextTracker.vue';
import PlayersProgressPanel from './PlayersProgressPanel.vue';
import GameSummaryDlg from './GameSummaryDlg.vue';
import { GameSummary, PlayerProgress } from './gameplay/strategies/game-strategy';

@Component({
  components: {
    TypingTextTracker,
    PlayersProgressPanel,
    GameSummaryDlg
  }
})
export default class GameView extends Mixins(GameMixin, KeyboardInputMixin) {
  private fieldImg = '';

  private scroll = 0;

  private carriage = 0;

  private $playerProgressUnsub!: Subscription;

  private playersProgress: PlayerProgress[] = [];

  private summaryDlgShow = false;

  private gameSummary: GameSummary = { winner: '', scores: [] };

  async created (): Promise<void> {
    if (this.gameClient.inGame) {
      await this.gameClient.game.awaitInitialization();
    }

    this.fieldImg = this.gameClient.game.fieldImg;

    this.$playerProgressUnsub = this.gameClient.game.$playersProgress.subscribe(x => (this.playersProgress = x));
    this.gameClient.game.$endGame.pipe(first()).subscribe(x => this.endGame(x));
  }

  destroyed (): void {
    this.$playerProgressUnsub.unsubscribe();
  }

  async keypress (key: string): Promise<void> {
    const width = await this.gameClient.sendKey(key);
    if (width !== -1) {
      if (width < this.carriage) {
        this.scroll += 1;
      }

      this.carriage = width;
    }
  }

  endGame (summary: GameSummary): void {
    this.gameSummary = summary;
    this.summaryDlgShow = true;
  }
}
</script>
