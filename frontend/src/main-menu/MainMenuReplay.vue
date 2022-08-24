<template>
<replays-overview :replays="replays" />
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator';

import ReplaysOverview from '@/replay/ReplaysOverview.vue';
import { ApiServiceMixin } from '@/mixins';
import { ReplayOverview } from '@/services/api-service/replay/replay-overview';
import { isRejectedResponse } from '@/services/api-service/rejected-response';

@Component({
  components: {
    ReplaysOverview
  }
})
export default class MainMenuReplay extends Mixins(ApiServiceMixin) {
  private replays: ReplayOverview[] = [];

  async created (): Promise<void> {
    const replays = await this.api.replay.getMyReplays(new Date(0), 5);

    if (isRejectedResponse(replays)) {
      return;
    }

    this.replays = replays;
  }
}
</script>
