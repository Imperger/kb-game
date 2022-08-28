<template>
<div class="replays-overview">
  <replay-overview-card v-for="r in replays" :key="r.id" :currentPlayerId="currentPlayerId" :replay="r" />
</div>
</template>

<style scoped>
.replays-overview {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
}
</style>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';

import { ApiServiceMixin } from '@/mixins';
import ReplayOverviewCard from './ReplayOverviewCard.vue';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { ReplayOverview } from '@/services/api-service/replay/replay-overview';

@Component({
  components: {
    ReplayOverviewCard
  }
})
export default class ReplaysOverview extends Mixins(ApiServiceMixin) {
  @Prop({ required: true })
  private readonly replays!: ReplayOverview[];

  private currentPlayerId = '';

  async created (): Promise<void> {
    const player = await this.api.player.currentPlayerInfo();

    if (!isRejectedResponse(player)) {
      this.currentPlayerId = player.id;
    }
  }
}
</script>
