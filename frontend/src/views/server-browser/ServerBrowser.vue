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

import { ApiServiceMixin } from '@/mixins';
import { ServerDescription } from '@/services/api-service/game/game-api';
import { isRejectedResponse } from '@/services/api-service/rejected-response';

@Component
export default class ServerBrowser extends Mixins(ApiServiceMixin) {
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
  }
}
</script>
