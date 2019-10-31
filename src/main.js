import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入全局样式表
import "./assets/css/global.css"
//导入图标样式
import "./assets/fonts/iconfont.css"
//导入树形2结构
import TreeTable from "vue-table-with-tree-grid"
//导入富文本编辑器以及其样式
import VueQuillEditor from "vue-quill-editor"
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

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

//注册树形结构
Vue.component("tree-table", TreeTable)
Vue.config.productionTip = false

//注册富文本编辑器
Vue.use(VueQuillEditor)

//定义全局时间过滤器
Vue.filter('dateFormat',function(originVal){
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth()+1+'').padStart(2,'0')
  const d = (dt.getDate()+ '').padStart(2,'0')
  
  const hh = (dt.getHours()+'').padStart(2,'0')
  const mm = (dt.getMinutes()+'').padStart(2,'0')
  const ss = (dt.getSeconds()+ '').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
