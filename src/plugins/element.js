import Vue from 'vue'
import { Button, Form, Input, FormItem, Message, Header, Main, Aside, Container, Menu, Submenu, MenuItemGroup, MenuItem, Breadcrumb, BreadcrumbItem,
         Card, Row, Col, Table, TableColumn, Switch, Tooltip, Pagination, Dialog, MessageBox } from 'element-ui'


Vue.use(Button)
Vue.use(Form)
Vue.use(Input)
Vue.use(FormItem)
Vue.use(Header)
Vue.use(Main)
Vue.use(Aside)
Vue.use(Container)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItemGroup)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)

//message组件比较特别，需要在vue原型上挂载
Vue.prototype.$message = Message
//messageBox组件也需要在Vue原型上挂载
Vue.prototype.$confirm = MessageBox.confirm
