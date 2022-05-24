<template>
<v-container>
  <v-app-bar
      app
      color="white"
      flat>
    <v-tabs
        centered
        class="ml-n9"
        color="grey darken-1">
      <v-tab :to="{ name: 'MainMenuHome' }">Home</v-tab>
      <v-tab :to="{ name: 'MainMenuPlay' }">Play</v-tab>
    </v-tabs>
    <section class="profile">
      <profile-widget v-if="App.loggedIn" :profile="App.user" />
      <auth-buttons-widget v-else />
    </section>
  </v-app-bar>
  <v-main>
    <v-container>
      <router-view></router-view>
    </v-container>
  </v-main>
</v-container>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { StoreMixin } from '@/mixins';
import ProfileWidget from '@/components/ProfileWidget.vue';
import AuthButtonsWidget from '@/components/AuthButtonsWidget.vue';

@Component({
  components: {
    AuthButtonsWidget,
    ProfileWidget
  }
})
export default class MainMenu extends Mixins(StoreMixin) {
  mounted (): void {
    const defaultRoute = 'MainMenuHome';
    if (this.$route.name !== defaultRoute) { this.$router.push({ name: defaultRoute }); }
  }
}
</script>
