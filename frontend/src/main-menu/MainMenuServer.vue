<template>
<v-container fluid>
  <v-row>
    <v-col cols="6">
      <spawner-manager />
    </v-col>
    <v-col cols="6">
      <scenario-manager />
    </v-col>
  </v-row>
</v-container>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import SpawnerManager from '@/components/spawner/SpawnerManager.vue';
import ScenarioManager from './server/ScenarioManager.vue';

@Component({
  components: {
    ScenarioManager,
    SpawnerManager
  }
})
export default class MainMenuServer extends Vue {
}
</script>
