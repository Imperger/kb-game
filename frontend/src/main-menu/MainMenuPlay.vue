<template>
<v-container>
    <v-row>
      <template v-if="canPlay">
        <v-col md="auto" class="pa-1">
            <QuickPlayButton :disabled="gameDisabled" />
        </v-col>
        <v-col md="auto" class="pa-1">
            <v-btn :disabled="gameDisabled" @click="newCustomGame" class="btn-tile" plain>Custom game</v-btn>
        </v-col>
      </template>
      <template v-else-if="canReconnect">
        <v-col md="auto" class="pa-1">
          <v-btn @click="reconnect" class="reconnect-btn-tile" plain>Reconnect</v-btn>
        </v-col>
      </template>
        <v-col md="auto" class="pa-1">
            <v-btn :disabled="!App.canPlay" @click="openServerBrowser" class="btn-tile" plain>Browse servers</v-btn>
        </v-col>
    </v-row>
</v-container>
</template>

<style scoped src="./styles.css"></style>

<style scoped>
.reconnect-btn-tile {
    width: 508px;
    min-height: 140px;
    color: white;
    background-color: #039be5;
}
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { ApiServiceMixin, GameMixin, StoreMixin, WatchMixin } from '@/mixins';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { AuthResult } from '@/game/gameplay/strategies/auth-strategy';
import { PlayerStats } from '@/services/api-service/player/player-stats';
import QuickPlayButton from './play/QuickPlayButton.vue';

@Component({
  components: {
    QuickPlayButton
  }
})
export default class MainMenuPlay extends Mixins(ApiServiceMixin, GameMixin, StoreMixin, WatchMixin) {
  private gameInstanceUrl: string | null = null;

  async created (): Promise<void> {
    this.watch(
      () => this.api.player.currentPlayerInfo(),
      (stats) => this.maintainIngameStatus(stats),
      20000);
  }

  async newCustomGame (): Promise<void> {
    const gi = await this.api.game.newCustom();
    if (isRejectedResponse(gi)) {
      return;
    }

    switch (await this.gameClient.connect(gi.instanceUrl, gi.playerToken)) {
      case AuthResult.CustomGame:
        this.$router.push({ name: 'GameLobby' });
        break;
      case AuthResult.QuickGame:
        break;
      case AuthResult.Unauthorized:
        break;
    }
  }

  public async reconnect (): Promise<void> {
    if (this.gameInstanceUrl) {
      const game = await this.api.game.connect(this.gameInstanceUrl);

      if (isRejectedResponse(game)) {
        return;
      }

      switch (await this.gameClient.connect(this.gameInstanceUrl, game.playerToken)) {
        case AuthResult.CustomGame:
          this.$router.push({ name: 'GameLobby' });
          break;
        case AuthResult.QuickGame:
          this.$router.push({ name: 'QuickGameLobby' });
          break;
        case AuthResult.Unauthorized:
          break;
      }
    }
  }

  openServerBrowser (): void {
    this.$router.push({ name: 'MainMenuServerBrowser' });
  }

  private maintainIngameStatus (stats: PlayerStats) {
    this.gameInstanceUrl = stats.game?.instanceUrl ?? '';
  }

  public get gameDisabled (): boolean {
    return !(this.App.canPlay && this.gameInstanceUrl?.length === 0);
  }

  public get canPlay (): boolean {
    return !this.gameInstanceUrl;
  }

  public get canReconnect (): boolean {
    return this.gameInstanceUrl !== null && this.gameInstanceUrl.length > 0;
  }
}
</script>
