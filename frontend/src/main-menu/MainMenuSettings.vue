<template>
  <v-container fluid>
    <v-row>
      <v-col cols="6"><profile-brief /></v-col>
      <v-col cols="6"><update-password /></v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { ApiServiceMixin } from '@/mixins';
import ProfileBrief from './settings/ProfileBrief.vue';
import UpdatePassword from './settings/UpdatePassword.vue';

@Component({
  components: {
    ProfileBrief,
    UpdatePassword
  }
})
export default class MainMenuSettings extends Mixins(ApiServiceMixin) { }
</script>
