import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入全局样式表
import "./assets/css/global.css"
//导入图标样式
import "./assets/fonts/iconfont.css"

//配置axios
import axios from "axios"
//axios请求拦截
axios.interceptors.request.use(config => {
  // console.log(config)
  //为请求头对象添加token验证的Authorization
  config.headers.Authorization = window.sessionStorage.getItem('token')

  return config
})
Vue.prototype.$http = axios
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
