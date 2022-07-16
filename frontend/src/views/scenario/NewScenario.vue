<template>
<v-main>
  <v-row justify="center">
    <v-col cols="10">
      <v-text-field v-model="title" :rules="[validateTitle]" :counter="titleBounds.max" placeholder="Title" />
      <v-textarea v-model="text" :rules="[validateText]" :counter="textBounds.max" label="Text" outlined/>
      <v-btn @click="save" :disabled="!canSave" :loading="savePending" icon large><v-icon>mdi-content-save</v-icon></v-btn>
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

  readonly titleBounds = { min: 3, max: 50 };
  readonly textBounds = { min: 10, max: 100000 };

  async save (): Promise<void> {
    this.savePending = true;

    await this.api.scenario.add(this.title, this.text);

    this.savePending = false;
  }

  validateTitle (x: string): boolean | string {
    return (x.length >= this.titleBounds.min && x.length <= this.titleBounds.max) ||
    `Should be between ${this.titleBounds.min} and ${this.titleBounds.max}`;
  }

  validateText (x: string): boolean | string {
    return (x.length >= this.textBounds.min && x.length <= this.textBounds.max) ||
    `Should be between ${this.textBounds.min} and ${this.textBounds.max}`;
  }

  get canSave (): boolean {
    return this.validateTitle(this.title) === true &&
     this.validateText(this.text) === true;
  }
}
</script>
