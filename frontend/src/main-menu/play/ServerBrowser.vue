<template>
<v-row justify="center">
  <v-col md="6">
    <v-data-table :headers="headers" :items="games">
      <template v-slot:[`item.players`]="{ item }">
        {{ item.occupancy }} / {{ item.capacity }}
      </template>
      <template v-slot:[`item.action`]="{ item }">
        <v-btn @click="connect(item.url)" color="#003c8f" icon>
          <v-icon>mdi-connection</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-col>
  <v-col md="1">
    <v-row>
      <v-btn @click="goToMainMenuPlay()" icon><v-icon>mdi-close</v-icon></v-btn>
    </v-row>
    <v-row>
      <v-btn @click="fetchServerList()" icon><v-icon>mdi-refresh</v-icon></v-btn>
    </v-row>
  </v-col>
</v-row>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { ApiServiceMixin, GameMixin } from '@/mixins';
import { ServerDescription } from '@/services/api-service/game/game-api';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { AuthResult } from '@/game/gameplay/strategies/auth-strategy';

@Component
export default class ServerBrowser extends Mixins(ApiServiceMixin, GameMixin) {
  private readonly headers = [
    { text: 'Owner', value: 'owner' },
    { text: 'Players', value: 'players' },
    { text: '', value: 'action' }
  ];

  private games: ServerDescription[] = [];

  async created (): Promise<void> {
    this.fetchServerList();
  }

  async connect (url: string): Promise<void> {
    const descriptor = await this.api.game.connect(url);

    if (isRejectedResponse(descriptor)) { return; }

    switch (await this.gameClient.connect(url, descriptor.playerToken)) {
      case AuthResult.CustomGame:
        this.$router.push({ name: 'GameLobby' });
        break;
      case AuthResult.QuickGame:
        break;
      case AuthResult.Unauthorized:
        break;
    }
  }

  goToMainMenuPlay (): void {
    this.$router.push({ name: 'MainMenuPlay' });
  }

  private async fetchServerList (): Promise<void> {
    const games = await this.api.game.listGames();

    if (isRejectedResponse(games)) return;

    this.games = games;
  }
}
</script>
