<template>
<v-col>
    <v-row justify="center">
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
    </v-row>
</v-col>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { ApiServiceMixin, GameMixin } from '@/mixins';
import { ServerDescription } from '@/services/api-service/game/game-api';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { AuthResult } from '@/gameplay/strategies/auth-strategy';

@Component
export default class ServerBrowser extends Mixins(ApiServiceMixin, GameMixin) {
  private readonly headers = [
    { text: 'Owner', value: 'owner' },
    { text: 'Players', value: 'players' },
    { text: '', value: 'action' }
  ];

  private games: ServerDescription[] = [];

  async created (): Promise<void> {
    const games = await this.api.game.listGames();

    if (isRejectedResponse(games)) return;

    this.games = games;
  }

  async connect (url: string): Promise<void> {
    const connstr = `wss://${url}`;

    const descriptor = await this.api.game.connect(connstr);

    if (isRejectedResponse(descriptor)) { return; }

    switch (await this.gameClient.connect(connstr, descriptor.playerToken)) {
      case AuthResult.CustomGame:
        this.$router.push({ name: 'GameLobby' });
        break;
      case AuthResult.QuickGame:
        break;
      case AuthResult.Unauthorized:
        break;
    }
  }
}
</script>
