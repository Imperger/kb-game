import { RouteConfig } from 'vue-router';

import ScenarioEditor from '@/views/scenario/ScenarioEditor.vue';

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
