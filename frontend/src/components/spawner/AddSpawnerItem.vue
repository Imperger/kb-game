<template>
<v-list-item>
    <v-list-item-content class="d-inline-flex">
        <v-col><v-text-field v-model="url" label="Spawner URL" placeholder="https://spawner.domain:443"></v-text-field></v-col>
        <v-col cols="3"><v-text-field v-model="secret" label="Secret" type="password"></v-text-field></v-col>
        <v-col class=" flex-grow-0"><v-btn @click="add(url, secret, loading)" :loading="loading.addBtn">Add</v-btn></v-col>
    </v-list-item-content>
</v-list-item>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Emit, Mixins } from 'vue-property-decorator';

import { ApiServiceMixin } from '@/mixins';
import { LoadingController } from './loading-controller';

@Component
export default class AddSpawnerItem extends Mixins(ApiServiceMixin) {
  public url = '';

  public secret = '';

  public loading: LoadingController = { addBtn: false };

  @Emit('add')
  add (url: string, secret: string, loading: LoadingController): void {}
}
</script>
