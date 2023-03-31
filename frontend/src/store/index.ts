import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import Settings from './settings';
import App from './app';
import Notify from './notify';
export { default as Settings } from './settings';
export { default as App } from './app';

Vue.use(Vuex);

export interface StoreType {
  settings: Settings;
}

export default new Vuex.Store({
  modules: {
    app: App,
    settings: Settings,
    notify: Notify
  },
  plugins: [createPersistedState({ paths: ['settings.locale', 'app.authToken'] })]
});
