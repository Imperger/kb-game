<template>
<v-main>
  <v-row justify="center">
    <v-col cols="10">
      <v-text-field v-model="title" placeholder="Title" />
      <v-textarea v-model="text" label="Text" outlined/>
      <v-btn @click="save" :loading="savePending" icon large><v-icon>mdi-content-save</v-icon></v-btn>
    </v-col>
  </v-row>
</v-main>
</template>

<style scoped>
</style>

<script lang="ts">
import { ApiServiceMixin } from '@/mixins';
import { Component, Mixins } from 'vue-property-decorator';

@Component
export default class NewScenario extends Mixins(ApiServiceMixin) {
  title = '';
  text = '';
  savePending = false;

  async save (): Promise<void> {
    this.savePending = true;

    await this.api.scenario.add(this.title, this.text);

    this.savePending = false;
  }
}
</script>
