import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css'

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss'

import App from './App'
import router from './router'
import store from './store'

import i18n from './lang'
import './icons'
import './errorLog'
import './permission'
import './mock'
import * as filters from './filters'
import VueBus from 'vue-bus'
import request from "@/utils/request"
import md5 from "js-md5"
import permission from '@/directive/permission/index.js'
import * as _ from "lodash"
import {
  Message,
  MessageBox
} from 'element-ui'

Vue.prototype._ = _
Vue.prototype.$Message = Message
Vue.prototype.$MessageBox = MessageBox
Vue.prototype.$md5 = md5;

Vue.use(Element, {
  size: Cookies.get('size') || 'medium',
  i18n: (key, value) => i18n.t(key, value)
})

Vue.use(VueBus);
Vue.use(permission)


Object.defineProperty(Vue.prototype, "$Cookies", { value: Cookies })

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
