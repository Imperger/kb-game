<template>
<v-virtual-scroll
        :items="scenarios"
        :item-height="48"
        height="500">
        <template v-slot:default="{ item }">
          <v-list-item @click="selectScenario(item)" :class="{'selected-scenario': isSelectedScenario(item) }">
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-virtual-scroll>
</template>

<style scoped>
.selected-scenario {
  background-color: #5ea1ff;
}
</style>

<script lang="ts">
import { Component, Emit, Mixins } from 'vue-property-decorator';

import { Scenario } from './gameplay/strategies/lobby-strategy';
import { GameMixin } from '@/mixins';

@Component
export default class LobbyScenarioList extends Mixins(GameMixin) {
  private scenarios: Scenario[] = [];
  private selected: Scenario = { id: '', title: '' };

  @Emit('select')
  selectScenario (scenario: Scenario): void {
    this.selected = scenario;
  }

  async created (): Promise<void> {
    if (this.gameClient.inLobby) {
      await this.gameClient.lobby.awaitInitialization();

      this.scenarios = this.gameClient.lobby.scenarios;
      this.selected = this.scenarios[0];
    }
  }

  isSelectedScenario (scenario: Scenario): boolean {
    return scenario === this.selected;
  }
}
</script>
