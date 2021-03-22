import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { VueUieditor } from './vue-uieditor'

Vue.config.productionTip = false
Vue.use(VueUieditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
