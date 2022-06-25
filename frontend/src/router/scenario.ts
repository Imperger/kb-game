import { RouteConfig } from 'vue-router';

import NewScenario from '@/views/scenario/NewScenario.vue';

export const scenario: Array<RouteConfig> = [
  {
    path: '/scenario/new',
    name: 'NewScenario',
    component: NewScenario
  }
];
