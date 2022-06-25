<template>
<v-list class="player-list">
  <v-list-item v-for="p in slots" :key="p.id">
    <v-list-item-content>
      <v-row>
        <v-col md="auto"><span>{{ p.nickname }}</span></v-col>
        <v-col md="auto"><v-icon v-if="p.owner">mdi-crown-outline</v-icon></v-col>
      </v-row>
    </v-list-item-content>
  </v-list-item>
</v-list>
</template>

<style scoped>
.player-list {
  border: 1px solid gray;
}
</style>

<script lang="ts">
import { Player } from '@/gameplay/strategies/lobby-strategy';
import { Component, Vue, Prop } from 'vue-property-decorator';

interface PlayerSlot {
  id: string;
  nickname: string;
  empty: boolean;
  owner: boolean;
}

@Component
export default class LobbyFfaPlayerList extends Vue {
  @Prop({ required: true })
  private readonly capacity!: number;

  @Prop({ required: true })
  private readonly ownerId!: string;

  @Prop({ required: true })
  private readonly players!: Player[];

  get slots (): PlayerSlot[] {
    const players = [...this.players];

    players.sort((a, b) => a.slot - b.slot);

    const slots = new Array(this.capacity);
    for (let n = 0, pid = 0; n < slots.length; ++n) {
      pid = this.findPlayerIndex(players, x => x.slot === n, pid);
      if (pid !== -1) {
        const p = players[pid];
        slots[n] = {
          id: p.id,
          nickname: p.nickname,
          empty: false,
          owner: p.id === this.ownerId
        };
      } else {
        slots[n] = {
          id: `empty#${n}`,
          nickname: 'empty',
          empty: true
        };

        ++pid;
      }
    }

    return slots;
  }

  private findPlayerIndex (players: Player[], pred: (s: Player) => boolean, start: number): number {
    for (let n = start; n < this.players.length; ++n) {
      if (pred(players[n])) {
        return n;
      }
    }

    return -1;
  }
}
</script>
