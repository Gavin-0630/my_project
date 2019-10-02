import Vue from 'vue'
import Router from 'vue-router'
//导入登录组件
import login from "./components/login.vue"
//导入home组件
import home from "./components/home.vue"

Vue.use(Router)

const router = new Router({
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", component: login },
    { path: "/home", component: home }
  ]
})

//挂载路由导航守卫
router.beforeEach((to,from,next) => {
  //如果用户要登录的是login页面，直接放行
  if(to.path === "/login") return next();

  //获取token
  const tokenStr = window.sessionStorage.getItem("token")
  //如果token不存在，直接跳转到login页面
  if(!tokenStr) return next("/login")
  //如果存在，直接方形
  next()
})

export default router