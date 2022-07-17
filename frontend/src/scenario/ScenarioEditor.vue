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
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { ApiServiceMixin } from '@/mixins';
import { isRejectedResponse } from '@/services/api-service/rejected-response';

@Component
export default class ScenarioEditor extends Mixins(ApiServiceMixin) {
  @Prop({ type: String })
  private readonly id!: string;

  title = '';
  text = '';
  savePending = false;

  readonly titleBounds = { min: 3, max: 50 };
  readonly textBounds = { min: 10, max: 100000 };

  async created (): Promise<void> {
    if (this.isEditMode) {
      const content = await this.api.scenario.content(this.id);

      if (!isRejectedResponse(content)) {
        this.title = content.title;
        this.text = content.text;
      }
    }
  }

  async save (): Promise<void> {
    this.savePending = true;

    if (this.isEditMode) {
      await this.api.scenario.update(this.id, { title: this.title, text: this.text });
    } else {
      await this.api.scenario.add(this.title, this.text);
    }

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

  get isEditMode (): boolean {
    return this.id !== undefined;
  }
}
</script>
