<template>
  <scenario-explorer title="Scenario manager" :refreshSub="refresh">
    <template v-slot:items="{ scenarioPage }">
      <v-list>
        <v-list-item v-for="s in scenarioPage.scenarios" :key="s.id">
          <v-list-item-content>
            <v-list-item-title>
              {{ s.title }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ s.text }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-row>
              <v-col class="pa-1">
                <v-btn :to="edit(s.id)" :disabled="isRemoveDisabled(s.id)" icon><v-icon>mdi-pencil</v-icon></v-btn>
              </v-col>
              <v-col class="pa-1">
                <v-btn @click="remove(s.id)" :disabled="isRemoveDisabled(s.id)" color="red"
                  icon><v-icon>mdi-close</v-icon></v-btn>
              </v-col>
            </v-row>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </template>
    <template v-slot:actions>
      <v-col cols="1"><v-btn :to="add" icon large elevation="2"
          class="add-scenario-btn"><v-icon>mdi-plus</v-icon></v-btn></v-col>
    </template>
  </scenario-explorer>
</template>

<style scoped>
.add-scenario-btn {
  position: relative;
  right: 19px;
  background-color: #7CB342;
}
</style>

<script lang="ts">
import { Location } from 'vue-router/types/router';
import { Component, Mixins } from 'vue-property-decorator';

import ScenarioExplorer from '@/scenario/ScenarioExplorer.vue';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { ApiServiceMixin } from '@/mixins';
import { Subject } from 'rxjs';

@Component({
  components: {
    ScenarioExplorer
  }
})
export default class ScenarioManager extends Mixins(ApiServiceMixin) {
  public refresh = new Subject<void>();

  private removeInProgress: string[] = [];

  get add (): Location {
    return { name: 'NewScenario' };
  }

  edit (id: string): Location {
    return { name: 'EditScenario', params: { id } };
  }

  async remove (id: string): Promise<void> {
    this.removeInProgress.push(id);

    const removed = await this.api.scenario.remove(id);

    if (!isRejectedResponse(removed)) {
      this.refresh.next();
    }

    this.removeInProgress.splice(this.removeInProgress.indexOf(id), 1);
  }

  public isRemoveDisabled (id: string): boolean {
    return this.removeInProgress.includes(id);
  }
}
</script>
