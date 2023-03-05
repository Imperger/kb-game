<template>
<v-container>
    <v-row>
        <v-col md="auto" class="pa-1">
            <QuickPlayButton />
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

<style scoped src="./styles.css">
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { ApiServiceMixin, GameMixin, StoreMixin } from '@/mixins';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { AuthResult } from '@/game/gameplay/strategies/auth-strategy';
import QuickPlayButton from './play/QuickPlayButton.vue';

@Component({
  components: {
    QuickPlayButton
  }
})
export default class MainMenuPlay extends Mixins(ApiServiceMixin, GameMixin, StoreMixin) {
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
}
</script>
