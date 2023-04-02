<template>
    <v-btn v-bind="$attrs" v-on="$listeners" @click="click" class="btn-tile" plain>{{ caption }}</v-btn>
</template>

<style scoped src="./../styles.css">
</style>

<script lang="ts">
import Component from 'vue-class-component';
import { Mixins } from 'vue-property-decorator';
import { ApiServiceMixin, GameMixin, StoreMixin } from '@/mixins';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { AuthResult } from '@/game/gameplay/strategies/auth-strategy';
import { NotifyType } from '@/store/notify';

@Component
export default class QuickPlayButton extends Mixins(ApiServiceMixin, GameMixin, StoreMixin) {
  private inQuickQueue = false;

  async click (): Promise<void> {
    if (this.inQuickQueue) {
      if (await this.api.game.leaveQuickQueue()) {
        this.inQuickQueue = false;
      }
    } else {
      this.inQuickQueue = true;

      const descriptor = await this.api.game.enterQuickQueue();

      if (isRejectedResponse(descriptor)) {
        this.inQuickQueue = false;

        this.Notify.show({ message: descriptor?.message ?? "Can't enter queue", type: NotifyType.Warning });
        return;
      } else if (descriptor === null) {
        this.inQuickQueue = false;
        return;
      }

      switch (await this.gameClient.connect(descriptor.instanceUrl, descriptor.playerToken)) {
        case AuthResult.CustomGame:
          break;
        case AuthResult.QuickGame:
          this.$router.push({ name: 'QuickGameLobby' });
          break;
        case AuthResult.Unauthorized:
          break;
      }
    }
  }

  get caption (): string {
    return this.inQuickQueue ? 'Cancel' : 'Quick Game';
  }
}
</script>
