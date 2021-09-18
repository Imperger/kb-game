import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import Settings from './settings';
export { default as Settings } from './settings';

Vue.use(Vuex);

export interface StoreType {
  settings: Settings;
}

export default new Vuex.Store({
  modules: {
    settings: Settings
  },
  plugins: [createPersistedState({ paths: ['settings.locale'] })]
});
