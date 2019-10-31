import Vue from 'vue'
import Router from 'vue-router'
//导入登录组件
import login from "./components/login.vue"
//导入home组件
import home from "./components/home.vue"
//导入welcome组件
import welcome from "./components/welcome.vue"
//导入用户列表组件
import users from "./components/user/users.vue"
Vue.use(Router)
//导入用户权限列表组件
import rights from "./components/power/rights.vue"
//导入角色列表
import roles from "./components/power/roles.vue"
//导入商品分类组件
import cate from "./components/goods/cate.vue"
//导入商品分类参数组件
import params from "./components/goods/params.vue"
//导入商品列表组件
import goodsList from "./components/goods/list.vue"
//导入商品添加组件
import add from "./components/goods/add.vue"
//导入订单列表组件
import order from "./components/order/order.vue"
const router = new Router({
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", component: login },
    {
      path: "/home",
      component: home,
      redirect: "/welcome",
      children: [
        { path: "/welcome", component: welcome },
        { path: "/users", component: users },
        {path: "/rights", component: rights},
        {path: "/roles", component: roles},
        {path: "/categories", component: cate},
        {path: "/params", component: params},
        {path: "/goods", component: goodsList},
        {path: '/goods/add', component: add},
        {path: '/orders', component: order}
      ]
    }
  ]
})
//解决重复点击菜单控制台出现警告的问题
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //如果用户要登录的是login页面，直接放行
  if (to.path === "/login") return next();

  //获取token
  const tokenStr = window.sessionStorage.getItem("token")
  //如果token不存在，直接跳转到login页面
  if (!tokenStr) return next("/login")
  //如果存在，直接方形
  next()
})

export default router