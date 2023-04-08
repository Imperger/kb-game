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
import { ScenarioContentUpdate } from '@/services/api-service/scenario/scenario-api';

@Component
export default class ScenarioEditor extends Mixins(ApiServiceMixin) {
  @Prop({ type: String })
  private readonly id!: string;

  title = '';
  text = '';
  savePending = false;

  originTitle = '';
  originText = '';

  readonly titleBounds = { min: 3, max: 50 };
  readonly textBounds = { min: 10, max: 100000 };

  async created (): Promise<void> {
    if (this.isEditMode) {
      const content = await this.api.scenario.content(this.id);

      if (!isRejectedResponse(content)) {
        this.title = content.title;
        this.text = content.text;

        this.syncOrigin();
      }
    }
  }

  async save (): Promise<void> {
    this.savePending = true;

    if (this.isEditMode) {
      const updated: ScenarioContentUpdate = { id: this.id };

      if (this.isTitleEdited) {
        updated.title = this.title;
      }

      if (this.isTextEdited) {
        updated.text = this.text;
      }

      await this.api.scenario.update(updated);

      this.syncOrigin();
    } else {
      const created = await this.api.scenario.add({ title: this.title, text: this.text });

      if (!isRejectedResponse(created)) {
        this.$router.push({ name: 'EditScenario', params: { id: created.id } });

        this.syncOrigin();
      }
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
     this.validateText(this.text) === true &&
     this.isEdited;
  }

  get isEditMode (): boolean {
    return this.id !== undefined;
  }

  get isEdited (): boolean {
    return this.isTitleEdited || this.isTextEdited;
  }

  get isTitleEdited (): boolean {
    return this.title !== this.originTitle;
  }

  get isTextEdited (): boolean {
    return this.text !== this.originText;
  }

  private syncOrigin () : void {
    this.originTitle = this.title;
    this.originText = this.text;
  }
}
</script>
