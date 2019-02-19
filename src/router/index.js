import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import User from '@/components/User'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: User }
      ]
    }
  ]
})

// 路由导航守卫，只有登录用户才能访问后台home路由
router.beforeEach((to, from, next) => {
  // 请求login直接放行
  if (to.path === '/login') return next()
  // 其他路径获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token要跳转到login登录页面（有两种方式）
  if (!tokenStr) return next('/login')
  // if (!tokenStr) return this.a.push('/login')
  // 直接放行
  next()
})

// 暴露路由对象
export default router
