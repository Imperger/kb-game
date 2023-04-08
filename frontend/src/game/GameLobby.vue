<template>
<v-container>
  <v-row>
    <v-col>
      <lobby-ffa-player-list :capacity="roomCapacity" :ownerId="ownerId" :players="players" />
    </v-col>
    <v-col>
      <lobby-scenario-list />
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
import { Player } from './gameplay/strategies/lobby-strategy';
import LobbyFfaPlayerList from './LobbyFfaPlayerList.vue';
import LobbyScenarioList from './LobbyScenarioList.vue';

@Component({
  components: {
    LobbyFfaPlayerList,
    LobbyScenarioList
  }
})
export default class GameLobby extends Mixins(GameMixin) {
  public roomCapacity = 10;
  public ownerId = '';
  public players: Player[] = [];

  async created (): Promise<void> {
    if (this.gameClient.inLobby) {
      this.gameClient.lobby.$gameWillStart
        .pipe(first())
        .subscribe({ next: () => this.$router.push({ name: 'GameView' }) });

      await this.gameClient.lobby.awaitInitialization();

      this.ownerId = this.gameClient.lobby.ownerId;
      this.players = this.gameClient.lobby.players;
    } else if (this.gameClient.inGame) {
      this.$router.push({ name: 'GameView' });
    }
  }

  async startGame (): Promise<void> {
    await this.gameClient.lobby.startGame();
  }
}
</script>
