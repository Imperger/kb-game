<template>
<div>
    Quick Game Lobby
</div>
</template>

<style scoped>
</style>

<script lang="ts">
import { first } from 'rxjs/operators';
import { Component, Mixins } from 'vue-property-decorator';

import { GameMixin } from '@/mixins';
import { Player } from './gameplay/strategies/quick-game-lobby-strategy';

@Component
export default class QuickGameLobby extends Mixins(GameMixin) {
  private players: Player[] = [];

  async created (): Promise<void> {
    if (this.gameClient.inQuickgGameLobby) {
      await this.gameClient.quickGameLobby.awaitInitialization();
      if (this.gameClient.inQuickgGameLobby) {
        this.players = this.gameClient.quickGameLobby.players;
        this.gameClient.quickGameLobby.$gameWillStart
          .pipe(first())
          .subscribe({ next: () => this.$router.push({ name: 'GameView' }) });
      } else if (this.gameClient.inGame) {
        this.$router.push({ name: 'GameView' });
      }
    }
  }
}
</script>
