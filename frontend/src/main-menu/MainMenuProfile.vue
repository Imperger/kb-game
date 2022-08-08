<template>
<player-stats :player="player" />
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import PlayerStats from '@/player-stats/PlayerStats.vue';
import { ApiServiceMixin } from '@/mixins';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { PlayerStats as Player } from '@/services/api-service/player/player-stats';

@Component({
  components: {
    PlayerStats
  }
})
export default class MainMenuProfile extends Mixins(ApiServiceMixin) {
  private player: Player | null = null;

  async created (): Promise<void> {
    const player = await this.api.player.currentPlayerInfo();

    if (!isRejectedResponse(player)) {
      this.player = player;
    }
  }
}
</script>
