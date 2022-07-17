import { RouteConfig } from 'vue-router';

import ScenarioEditor from './ScenarioEditor.vue';

export const scenario: Array<RouteConfig> = [
  {
    path: '/scenario/new',
    name: 'NewScenario',
    component: ScenarioEditor
  },
  {
    path: '/scenario/:id',
    name: 'EditScenario',
    component: ScenarioEditor,
    props: true
  }
];
