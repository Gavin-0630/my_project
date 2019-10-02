import Vue from 'vue'
import { Button, Form, Input, FormItem, Message } from 'element-ui'


Vue.use(Button)
Vue.use(Form)
Vue.use(Input)
Vue.use(FormItem)

//message组件比较特别，需要在vue原型上挂载
Vue.prototype.$message = Message
