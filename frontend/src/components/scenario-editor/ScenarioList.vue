<template>
<v-card class="scenario-editor">
    <v-card-title>Scenario editor</v-card-title>
    <v-card-text>
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
                    <v-btn icon><v-icon>mdi-pencil</v-icon></v-btn>
                  </v-col>
                  <v-col class="pa-1">
                    <v-btn @click="remove(s.id)" color="red" icon><v-icon>mdi-close</v-icon></v-btn>
                  </v-col>
                  </v-row>
                </v-list-item-action>
            </v-list-item>
        </v-list>
        <v-row class="actions">
          <v-col cols="11"><v-pagination :value="page" @input="changePage" :length="pages" circle /></v-col>
          <v-col cols="1"><v-btn @click="add" icon large elevation="2" class="add-scenario-btn"><v-icon>mdi-plus</v-icon></v-btn></v-col>
        </v-row>
    </v-card-text>
</v-card>
</template>

<style scoped>
.scenario-editor {
  min-height: 388px;
}

.actions {
  position: absolute;
  width: 100%;
  bottom: 10px;
}

.add-scenario-btn {
  position: relative;
  right: 19px;
  background-color: #7CB342;
}
</style>

<script lang="ts">
import { ApiServiceMixin } from '@/mixins';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { ScenarioPage } from '@/services/api-service/scenario/scenario-api';
import { Component, Mixins } from 'vue-property-decorator';

@Component({
  components: {
  }
})
export default class ScenarioList extends Mixins(ApiServiceMixin) {
  page = 1;
  pages = 4;
  perPage = 4;

  scenarioPage: ScenarioPage = { total: 0, scenarios: [] };

  async created (): Promise<void> {
    this.syncView(this.page);
  }

  add (): void {
    this.$router.push({ name: 'NewScenario' });
  }

  async remove (id: string): Promise<void> {
    const removed = await this.api.scenario.remove(id);

    if (!isRejectedResponse(removed) && removed) {
      this.syncView(this.page, true);
    }
  }

  async changePage (page: number): Promise<void> {
    if (await this.syncView(page)) {
      this.page = page;
    }
  }

  async syncView (page: number, force = false): Promise<boolean> {
    if (!force && page === this.page && this.scenarioPage.scenarios.length) {
      return false;
    }

    const scenarioPage = await this.api.scenario.list((page - 1) * this.perPage, this.perPage);

    if (!isRejectedResponse(scenarioPage)) {
      this.scenarioPage = scenarioPage;
      this.pages = Math.ceil(scenarioPage.total / this.perPage);

      return true;
    }

    return false;
  }
}
</script>
