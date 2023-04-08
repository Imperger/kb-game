<template>
  <scenario-explorer title="Scenario explorer">
    <template v-slot:items="{ scenarioPage }">
      <v-list>
        <v-list-item-group>
          <v-list-item v-for="s in scenarioPage.scenarios" :key="s.id" @click="selectScenario(s.id)">
            <v-list-item-content>
              <v-list-item-title>
                {{ s.title }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ s.text }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </template>
  </scenario-explorer>
</template>

<style scoped></style>

<script lang="ts">
import { Component, Emit, Mixins } from 'vue-property-decorator';

import ScenarioExplorer from '@/scenario/ScenarioExplorer.vue';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { ApiServiceMixin } from '@/mixins';
import { Subject } from 'rxjs';
import { Scenario } from './gameplay/strategies/lobby-strategy';

@Component({
  components: {
    ScenarioExplorer
  }
})
export default class LobbyScenarioExplorer extends Mixins(ApiServiceMixin) {
  @Emit('select')
  selectScenario (id: string): void {}
}
</script>
