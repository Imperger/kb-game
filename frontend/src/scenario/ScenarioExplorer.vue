<template>
  <v-card class="scenario-explorer">
    <v-card-title>{{ title }}</v-card-title>
    <v-card-subtitle class="query-controller">
      <v-text-field v-model="searchQuery" @input="$queryInput.next()" class="query-input" />
      <v-btn-toggle v-model="sortAttribute" @change="initialSearch" mandatory>
        <v-btn icon><v-icon>mdi-format-letter-case</v-icon></v-btn>
        <v-btn icon><v-icon>mdi-arrow-bottom-left</v-icon></v-btn>
      </v-btn-toggle>
      <v-btn-toggle v-model="sortOrder" @change="initialSearch" mandatory class="query-sort-btns">
        <v-btn icon><v-icon>mdi-sort-ascending</v-icon></v-btn>
        <v-btn icon><v-icon>mdi-sort-descending</v-icon></v-btn>
      </v-btn-toggle>
    </v-card-subtitle>
    <v-card-text>
      <slot name="items" v-bind:scenarioPage="scenarioPage"></slot>
      <span>Total: {{ scenarioPage.total }}</span>
    </v-card-text>
    <v-card-actions>
      <v-row>
        <v-col cols="11">
          <v-btn x-large icon :disabled="prevDisabled" @click="prev"><v-icon>mdi-chevron-left-circle</v-icon></v-btn>
          <v-btn x-large icon :disabled="nextDisabled" @click="next"><v-icon>mdi-chevron-right-circle</v-icon></v-btn>
        </v-col>
        <slot name="actions"></slot>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.scenario-explorer {
  min-height: 388px;
}

.query-controller {
  display: flex;
}

.query-input {
  margin-right: 5px;
}

.query-sort-btns {
  margin: 0 5px;
}
</style>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { ApiServiceMixin } from '@/mixins';
import { isRejectedResponse } from '@/services/api-service/rejected-response';
import { ScenarioPage, SearchQueryOrder, SearchQuerySort } from '@/services/api-service/scenario/scenario-api';
import { interval, Subject, Subscription } from 'rxjs';
import { debounce } from 'rxjs/operators';

enum CursorDirection {
  Next = 'cursorNext',
  Prev = 'cursorPrev'
}

interface Cursor {
  value: string;
  direction: CursorDirection;
}

@Component({
  components: {
  }
})
export default class ScenarioExplorer extends Mixins(ApiServiceMixin) {
  private page = 1;

  private perPage = 10;

  public scenarioPage: ScenarioPage = { total: 0, scenarios: [], cursorNext: '', cursorPrev: '' };

  public searchQuery = '';

  public sortAttribute = 0;

  public sortOrder = 0;

  public $queryInput!: Subject<void>;

  private $queryInputUnsub!: Subscription;

  private requestInProgress = false;

  private lastCursor: Cursor | null = null;

  @Prop()
  public title!: string;

  @Prop({ required: false })
  public refreshSub!: Subject<void>;

  private $refreshUnsub!: Subscription;

  async created (): Promise<void> {
    this.$queryInput = new Subject();

    this.$queryInputUnsub = this.$queryInput
      .pipe(debounce(() => interval(200)))
      .subscribe(x => this.initialSearch());

    if (this.refreshSub) {
      this.$refreshUnsub = this.refreshSub.subscribe(() => this.refresh());
    }

    this.initialSearch();
  }

  public destroyed (): void {
    this.$queryInputUnsub.unsubscribe();

    if (this.refreshSub) {
      this.$refreshUnsub.unsubscribe();
    }
  }

  public async initialSearch (): Promise<void> {
    this.requestInProgress = true;

    const scenarioPage = await this.api.scenario.list(this.buildSearchParams());

    if (!isRejectedResponse(scenarioPage)) {
      this.scenarioPage = scenarioPage;
      this.page = 1;
    }

    this.requestInProgress = false;
  }

  public async next (): Promise<void> {
    this.requestInProgress = true;

    const scenarioPage = await this.api.scenario.list({
      ...this.buildSearchParams(),
      cursorNext: this.scenarioPage.cursorNext
    });

    if (!isRejectedResponse(scenarioPage)) {
      this.scenarioPage = scenarioPage;
      ++this.page;
      this.lastCursor = { value: this.scenarioPage.cursorPrev, direction: CursorDirection.Next };
    }

    this.requestInProgress = false;
  }

  public async prev (): Promise<void> {
    this.requestInProgress = true;

    const scenarioPage = await this.api.scenario.list({
      ...this.buildSearchParams(),
      cursorPrev: this.scenarioPage.cursorPrev
    });

    if (!isRejectedResponse(scenarioPage)) {
      this.scenarioPage = scenarioPage;
      --this.page;
      this.lastCursor = { value: this.scenarioPage.cursorPrev, direction: CursorDirection.Prev };
    }

    this.requestInProgress = false;
  }

  public get prevDisabled (): boolean {
    return this.page === 1 || this.requestInProgress;
  }

  public get nextDisabled (): boolean {
    return this.scenarioPage.scenarios.length < this.perPage ||
      (this.page === 1 && this.scenarioPage.scenarios.length === this.scenarioPage.total) ||
      this.requestInProgress;
  }

  private buildSearchParams () {
    return {
      ...(this.searchQuery && { query: this.searchQuery }),
      sortBy: [SearchQuerySort.Title, SearchQuerySort.Length][this.sortAttribute],
      orderBy: [SearchQueryOrder.Asc, SearchQueryOrder.Desc][this.sortOrder],
      limit: this.perPage
    };
  }

  private async refresh (): Promise<void> {
    const scenarioPage = await this.api.scenario.list({
      ...this.buildSearchParams(),
      ...(this.lastCursor && { [this.lastCursor?.direction]: this.lastCursor?.value })
    });

    if (!isRejectedResponse(scenarioPage)) {
      this.scenarioPage = scenarioPage;
    }
  }
}
</script>
