<template>
<v-data-table :headers="headers" :items="spawners">
  <template v-slot:[`item.action`]="{ item }">
      <v-btn @click="emitRemove(item.url)" color="red" icon>
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
</v-data-table>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Emit, Mixins, Prop } from 'vue-property-decorator';

import { SpawnerInfo } from '@/services/api-service/spawner/spawner-api';
import { ApiServiceMixin } from '@/mixins';

@Component
export default class SpawnerTable extends Mixins(ApiServiceMixin) {
  @Prop({ required: true })
  private readonly spawners!: SpawnerInfo[];

  @Emit('remove')
  emitRemove (url: string): void {}

  private headers = [
    { text: 'Url', value: 'url' },
    { text: 'Name', value: 'name' },
    { text: 'Capacity', value: 'capacity' },
    { text: '', value: 'action' }
  ];
}
</script>
