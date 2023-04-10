<template>
<player-stats :player="player" />
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';

import { ApiServiceMixin } from '@/mixins';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { PlayerStats as Player } from '@/services/api-service/player/player-stats';
import PlayerStats from './PlayerStats.vue';

@Component({
  components: {
    PlayerStats
  }
})
export default class PlayerStatsViewer extends Mixins(ApiServiceMixin) {
  @Prop()
  private readonly nickname!: string;

  public player: Player | null = null;

  async created (): Promise<void> {
    const player = await this.api.player.getPlayerInfo(this.nickname);

    if (!isRejectedResponse(player)) {
      this.player = player;
    }
  }
}
</script>
