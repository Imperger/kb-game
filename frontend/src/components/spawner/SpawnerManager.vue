<template>
<v-card>
    <v-card-title>Spawners</v-card-title>
    <v-list>
        <spawner-table v-if="hasSpawner" :spawners="spawners" @remove="remove" />
        <v-list-item v-else>
            <v-list-item-content class="warning-text">
                Without any spawner server can't works properly.
            </v-list-item-content>
        </v-list-item>
        <add-spawner-item @add="add" />
    </v-list>
</v-card>
</template>

<style scoped>
.warning-text {
    color: #f57c00;
}
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { ApiServiceMixin, StoreMixin } from '@/mixins';
import AddSpawnerItem from './AddSpawnerItem.vue';
import SpawnerTable from './SpawnerTable.vue';
import { SpawnerInfo } from '@/services/api-service/spawner/spawner-api';
import { LoadingController } from './loading-controller';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { NotifyType } from '@/store/notify';

@Component({
  components: {
    AddSpawnerItem,
    SpawnerTable
  }
})
export default class SpawnerManager extends Mixins(ApiServiceMixin, StoreMixin) {
  private spawners: SpawnerInfo[] = [];

  async created (): Promise<void> {
    this.spawners = await this.api.spawner.listAll();
  }

  async add (url: string, secret: string, loading: LoadingController): Promise<void> {
    loading.addBtn = true;

    const spawner = await this.api.spawner.add(url, secret);

    if (isRejectedResponse(spawner)) {
      this.Notify.show({ message: spawner.message ?? '', type: NotifyType.Error });
    } else {
      this.spawners.push({ ...spawner, url });
      this.Notify.show({ message: 'Added', type: NotifyType.Message });
    }

    loading.addBtn = false;
  }

  async remove (url: string): Promise<void> {
    await this.api.spawner.remove(url);
    this.spawners.splice(this.spawners.findIndex(x => x.url === url), 1);
  }

  get hasSpawner (): boolean {
    return this.spawners.length > 0;
  }
}
</script>
