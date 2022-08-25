<template>
<div class="main-menu-replay">
  <v-btn x-large icon :disabled="prevDisabled" @click="prev"><v-icon>mdi-chevron-left-circle</v-icon></v-btn>
  <replays-overview :replays="overview.replays" />
  <v-btn x-large icon :disabled="nextDisabled" @click="next"><v-icon>mdi-chevron-right-circle</v-icon></v-btn>
</div>
</template>

<style scoped>
.main-menu-replay {
  display: flex;
  flex-direction: row;
}
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import ReplaysOverview from '@/replay/ReplaysOverview.vue';
import { ApiServiceMixin } from '@/mixins';
import { ReplayOverview, ReplaysOverview as IReplaysOverview } from '@/services/api-service/replay/replay-overview';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { DateCondition } from '@/services/api-service/replay/replay-api';

@Component({
  components: {
    ReplaysOverview
  }
})
export default class MainMenuReplay extends Mixins(ApiServiceMixin) {
  private page = 1;

  private perPage = 8;

  private overview: IReplaysOverview = { total: 0, replays: [] };

  created (): void{
    this.fetchReplays(DateCondition.Greather, new Date(0));
  }

  async prev (): Promise<void> {
    await this.fetchReplays(
      DateCondition.Greather,
      this.overview.replays[0].createdAt);

    --this.page;
  }

  async next (): Promise<void> {
    await this.fetchReplays(
      DateCondition.Less,
      this.overview.replays[this.overview.replays.length - 1].createdAt);

    ++this.page;
  }

  get prevDisabled (): boolean {
    return this.page === 1;
  }

  get nextDisabled (): boolean {
    return this.overview.replays.length < this.perPage ||
      this.page * this.perPage === this.overview.total;
  }

  private async fetchReplays (cond: DateCondition, since: Date) {
    const overview = await this.api.replay.getMyReplays(cond, since, this.perPage);

    if (isRejectedResponse(overview)) {
      return;
    }

    this.overview = overview;
  }
}
</script>
