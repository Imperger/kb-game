import Vue from 'vue'
import { VueReCaptcha } from 'vue-recaptcha-v3'

import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

Vue.use(VueReCaptcha, { siteKey: '6LfxGcIZAAAAAL2pcTnsqTwCIquSVT6kD-0VUt23' })

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
