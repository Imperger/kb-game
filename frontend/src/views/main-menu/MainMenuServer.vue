<template>
<v-container fluid>
  <v-row>
    <v-col cols="6">
      <spawner-manager />
    </v-col>
    <v-col cols="6">
      <scenario-editor />
    </v-col>
  </v-row>
</v-container>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import SpawnerManager from '@/components/spawner/SpawnerManager.vue';
import ScenarioEditor from '@/components/scenario-editor/ScenarioEditor.vue';

@Component({
  components: {
    SpawnerManager,
    ScenarioEditor
  }
})
export default class MainMenuServer extends Vue {
}
</script>
