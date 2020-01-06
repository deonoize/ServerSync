import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import fs from 'fs';
import {Bus} from './assets/js/Bus';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.prototype.ipserv = "127.0.0.1";
Vue.prototype.$fs = fs;
Vue.prototype.$bus = Bus;
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app');
