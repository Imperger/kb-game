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
import { GameSummary, PlayerProgress, SetTypingProgress } from './gameplay/strategies/game-strategy';

@Component({
  components: {
    TypingTextTracker,
    PlayersProgressPanel,
    GameSummaryDlg
  }
})
export default class GameView extends Mixins(GameMixin, KeyboardInputMixin) {
  public fieldImg = '';

  public scroll = 0;

  public carriage = 0;

  private $playerProgressUnsub!: Subscription;

  public playersProgress: PlayerProgress[] = [];

  public summaryDlgShow = false;

  public gameSummary: GameSummary = { winner: '', scores: [] };

  async created (): Promise<void> {
    if (this.gameClient.inGame) {
      await this.gameClient.game.awaitInitialization();

      this.setTypingProgress(this.gameClient.game.cursorPosition);
    }

    this.fieldImg = this.gameClient.game.fieldImg;

    this.$playerProgressUnsub = this.gameClient.game.$playersProgress.subscribe(x => (this.playersProgress = x));
    this.gameClient.game.$endGame.pipe(first()).subscribe(x => this.endGame(x));
    this.gameClient.game.$setTypingProgress.pipe(first()).subscribe(x => this.setTypingProgress(x));
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

  private setTypingProgress (progress: SetTypingProgress): void {
    this.carriage = progress.width;
    this.scroll = progress.line;
  }
}
</script>
