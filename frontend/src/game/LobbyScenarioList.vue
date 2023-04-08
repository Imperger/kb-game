<template>
  <div>
    <lobby-scenario-explorer v-if="isScenarioExplorerVisible" @select="selectScenario"></lobby-scenario-explorer>
    <v-card v-if="selected">
      <v-card-title>{{ selected.title }}</v-card-title>
      <v-card-text>{{ selected.text }}</v-card-text>
    </v-card>
    <v-card v-else>
      <v-card-text class="text-center">Map not selected</v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.selected-scenario {
  background-color: #5ea1ff;
}
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { Scenario } from './gameplay/strategies/lobby-strategy';
import { ApiServiceMixin, GameMixin } from '@/mixins';
import LobbyScenarioExplorer from './LobbyScenarioExplorer.vue';
import { Subscription } from 'rxjs';
import { isRejectedResponse } from '@/services/api-service/rejected-response';

@Component({
  components: {
    LobbyScenarioExplorer
  }
})
export default class LobbyScenarioList extends Mixins(ApiServiceMixin, GameMixin) {
  public selected: Scenario | null = null;

  private selectScenarioUnsub: Subscription | null = null;

  public isScenarioExplorerVisible = false;

  async selectScenario (scenarioId: string): Promise<void> {
    if (this.gameClient.inLobby) {
      await this.gameClient.lobby.selectScenario(scenarioId);
    }
  }

  async created (): Promise<void> {
    if (this.gameClient.inLobby) {
      await this.gameClient.lobby.awaitInitialization();
      if (this.gameClient.inLobby) {
        const me = await this.api.player.currentPlayerInfo();

        if (!isRejectedResponse(me)) {
          this.isScenarioExplorerVisible = me.id === this.gameClient.lobby.ownerId;
        }

        this.selected = this.gameClient.lobby.scenario;

        this.selectScenarioUnsub = this.gameClient.lobby
          .$selectedScenario
          .subscribe(x => (this.selected = x));
      }
    }
  }

  destroyed (): void {
    if (this.selectScenarioUnsub) {
      this.selectScenarioUnsub.unsubscribe();
    }
  }
}
</script>
