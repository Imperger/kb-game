<template>
<v-row>
  <v-progress-linear
    v-for="p in orderedProgress"
    :key="p.id"
    :value="progress100(p.progress)"
    color="blue-grey"
    height="25">
      <template v-slot:default="">
        <strong>{{ nameFromId(p.id) }}</strong>
      </template>
  </v-progress-linear>
</v-row>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';

import { PlayerProgress } from '@/gameplay/strategies/game-strategy';
import { GameMixin } from '@/mixins';

@Component
export default class PlayersProgressPanel extends Mixins(GameMixin) {
  @Prop({ required: true, type: Array })
  readonly progress!: PlayerProgress[];

  progress100 (progress: number): number {
    return Math.floor(progress * 100);
  }

  nameFromId (id: string): string {
    return this.gameClient.game.players.find(x => x.id === id)?.nickname ?? 'Unknown';
  }

  get orderedProgress (): PlayerProgress[] {
    return this.progress.sort((a, b) => b.progress - a.progress);
  }
}
</script>
