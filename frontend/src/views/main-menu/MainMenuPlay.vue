<template>
<v-container>
    <v-row>
        <v-col md="auto" class="pa-1">
            <v-btn :disabled="true" class="btn-tile" plain>Quik game</v-btn>
        </v-col>
        <v-col md="auto" class="pa-1">
            <v-btn @click="newCustomGame" class="btn-tile" plain>Custom game</v-btn>
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

import { ApiServiceMixin, GameMixin } from '@/mixins';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { AuthResult } from '@/gameplay/strategies/auth-strategy';

@Component
export default class MainMenuPlay extends Mixins(ApiServiceMixin, GameMixin) {
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
}
</script>
