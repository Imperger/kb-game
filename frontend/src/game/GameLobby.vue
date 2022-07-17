<template>
<v-container>
  <v-row>
    <v-col>
      <lobby-ffa-player-list :capacity="roomCapacity" :ownerId="ownerId" :players="players" />
    </v-col>
    <v-col>
      <lobby-scenario-list @select="selectScenario" />
    </v-col>
  </v-row>
  <v-row>
    <v-col><v-btn @click="startGame">Start game</v-btn></v-col>
  </v-row>
</v-container>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { first } from 'rxjs/operators';

import { GameMixin } from '@/mixins';
import { Player, Scenario } from './gameplay/strategies/lobby-strategy';
import LobbyFfaPlayerList from './LobbyFfaPlayerList.vue';
import LobbyScenarioList from './LobbyScenarioList.vue';

@Component({
  components: {
    LobbyFfaPlayerList,
    LobbyScenarioList
  }
})
export default class GameLobby extends Mixins(GameMixin) {
  private roomCapacity = 10;
  private ownerId = '';
  private players: Player[] = [];
  private scenario: Scenario = { id: '', title: '' };

  async created (): Promise<void> {
    if (this.gameClient.inLobby) {
      await this.gameClient.lobby.awaitInitialization();

      this.ownerId = this.gameClient.lobby.ownerId;
      this.players = this.gameClient.lobby.players;
      this.gameClient.lobby.$gameWillStart
        .pipe(first())
        .subscribe({ next: () => this.$router.push({ name: 'GameView' }) });
    }
  }

  startGame (): void {
    this.gameClient.lobby.startGame();
  }

  selectScenario (selected: Scenario): void {
    this.scenario = selected;
    this.gameClient.lobby.selectScenario(selected.id);
  }
}
</script>
