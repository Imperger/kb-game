import VeeValidate from 'vee-validate';
import Vue from 'vue';
import { VueReCaptcha } from 'vue-recaptcha-v3';

import App from './App.vue';
import router from './router';
import store from './store';

import '@/validators';
import i18n from './i18n';

Vue.config.productionTip = false;

Vue.use(VueReCaptcha, { siteKey: '6LfxGcIZAAAAAL2pcTnsqTwCIquSVT6kD-0VUt23' });
Vue.use(VeeValidate);

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app');
