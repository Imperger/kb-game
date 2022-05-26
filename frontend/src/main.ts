import VeeValidate from 'vee-validate';
import Vue from 'vue';
import { VueReCaptcha } from 'vue-recaptcha-v3';

import App from './App.vue';
import router from './router';
import store from './store';

import '@/validators';
import i18n from './i18n';
import { populateFakeLocales } from './locales/populate-fake-locales';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;

Vue.use(VueReCaptcha, { siteKey: '6Leieh8gAAAAADN8D62k8ShXnlAtCGZjQTrtnVxp' });

Vue.use(VeeValidate);
populateFakeLocales();

new Vue({
  router,
  store,
  i18n,
  vuetify,
  render: h => h(App)
}).$mount('#app');
