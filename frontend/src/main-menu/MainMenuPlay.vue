<template>
<v-container>
    <v-row>
        <v-col md="auto" class="pa-1">
            <v-btn :disabled="!App.canPlay" @click="clickQuickGame" class="btn-tile" plain>{{ quickGameButtonCaption }}</v-btn>
        </v-col>
        <v-col md="auto" class="pa-1">
            <v-btn :disabled="!App.canPlay" @click="newCustomGame" class="btn-tile" plain>Custom game</v-btn>
        </v-col>
        <v-col md="auto" class="pa-1">
            <v-btn :disabled="!App.canPlay" @click="openServerBrowser" class="btn-tile" plain>Browse servers</v-btn>
        </v-col>
    </v-row>
</v-container>
</template>

<style scoped>
.btn-tile {
    width: 250px;
    min-height: 140px;
    color: white;
    background-color: #039be5;
}
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { ApiServiceMixin, GameMixin, StoreMixin } from '@/mixins';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { AuthResult } from '@/game/gameplay/strategies/auth-strategy';

@Component
export default class MainMenuPlay extends Mixins(ApiServiceMixin, GameMixin, StoreMixin) {
  private inQuickQueue = false;

  async clickQuickGame (): Promise<void> {
    if (this.inQuickQueue) {
      if (await this.api.game.leaveQuickQueue()) {
        this.inQuickQueue = false;
      }
    } else {
      this.inQuickQueue = true;

      const descriptor = await this.api.game.enterQuickQueue();

      if (isRejectedResponse(descriptor) || !descriptor) {
        this.inQuickQueue = false;
        return;
      }

      // TODO: Here we can connect to the game instance
      console.log('Game found', descriptor);
    }
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

  openServerBrowser (): void {
    this.$router.push({ name: 'MainMenuServerBrowser' });
  }

  get quickGameButtonCaption (): string {
    return this.inQuickQueue ? 'Cancel' : 'Quick Game';
  }
}
</script>
