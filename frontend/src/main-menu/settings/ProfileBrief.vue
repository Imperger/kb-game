<template>
  <v-card v-if="user">
    <v-row justify="center">
      <v-col cols="5" class="text-h5">Username</v-col>
      <v-col cols="5" class="text-h5">{{ user.username }}</v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="5" class="text-h5">Email</v-col>
      <v-col cols="5" class="text-h5">{{ user.email }}</v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="5" class="text-h5">Registered</v-col>
      <v-col cols="5" class="text-h5">{{ user.registeredAt.toLocaleDateString() }}</v-col>
    </v-row>
  </v-card>
</template>

<style scoped></style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { ApiServiceMixin, StoreMixin } from '@/mixins';
import { NotifyType } from '@/store/notify';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { CurrentUser } from '@/services/api-service/user/types';

@Component
export default class Settings extends Mixins(ApiServiceMixin, StoreMixin) {
  async created (): Promise<void> {
    const me = await this.api.user.currentUserInfo();

    if (isRejectedResponse(me)) {
      this.Notify.show({ message: 'Failed to fetch profile info', type: NotifyType.Warning });
    } else {
      this.App.setUser(me);
    }
  }

  public get user (): CurrentUser {
    return this.App.user as CurrentUser;
  }
}
</script>
