import { RouteConfig } from 'vue-router';

import ReplayPlayer from './ReplayPlayer.vue';

export const replay: Array<RouteConfig> = [
  {
    path: '/replay/:id',
    name: 'ReplayPlayer',
    component: ReplayPlayer,
    props: true
  }
];
