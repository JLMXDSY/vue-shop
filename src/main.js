import Vue from 'vue'
import App from './App'
import router from './router'
// 引入global.css全局样式文件
import './assets/css/global.css'
// 引入字体图标样式
import './assets/fonts/iconfont.css'
// 引入element组件模块
import ElementUI from 'element-ui'

// 引入axios并配置
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios 请求拦截器
axios.interceptors.request.use(
  function(config) {
    // config axios的子级配置对象
    var token = window.sessionStorage.getItem('token')
    config.headers.Authorization = token
    return config
  },
  function(error) {
    return Promise.reject(error)
  }
)
// 把axios配置给vue的$http成员
Vue.prototype.$http = axios

// 注册element组件给vue
Vue.use(ElementUI)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
