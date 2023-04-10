<template>
<v-menu offset-y>
  <template v-slot:activator="{ attrs, on }">
    <v-btn icon v-bind="attrs" v-on="on">
      <v-avatar rounded size="32">
        <img :src="avatarUrl" alt="you">
      </v-avatar>
    </v-btn>
  </template>
  <v-list>
    <v-list-item @click="signOut">
      Log out
    </v-list-item>
  </v-list>
</v-menu>
</template>

<style scoped>
</style>

<script lang="ts">
import { ApiServiceMixin, StoreMixin } from '@/mixins';

import { Component, Mixins } from 'vue-property-decorator';

@Component
export default class ProfileWidget extends Mixins(StoreMixin, ApiServiceMixin) {
  get avatarUrl (): string {
    return this.App.user?.avatar || require('@/assets/default_avatar.png');
  }

  signOut (): void {
    this.App.signOut();
    this.api.auth.signOut();
  }
}
</script>
