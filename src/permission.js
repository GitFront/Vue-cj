import router from './router'
import store from './store'
import {
  Message
} from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import {
  getToken
} from '@/utils/auth'
import request from "@/utils/request"
import Cookies from "js-cookie"
import {
  filterRouter
} from "@/utils";
// import componentsRouter from './modules/components'
// import chartsRouter from './modules/charts'
// import tableRouter from './modules/table'
// import nestedRouter from './modules/nested'
NProgress.configure({
  showSpinner: false
})

function hasPermission(roles, permissionRoles) {
  if (roles.indexOf('admin') >= 0) return true
  if (!permissionRoles) return true
  return roles.some(role => permissionRoles.indexOf(role) >= 0)
}

const whiteList = ['/login', '/auth-redirect']
const mapRouters = {
  Layout: () => import("@/views/layout/Layout"),
  Assets: () => import('@/views/assets/index'),
  Company: () => import('@/views/company/index'),
  UserAuth: () => import('@/views/userAuth/index'),
  Dictionary: () => import('@/views/dictionary/index'),
  Role: () => import('@/views/role/index'),
  Gateway: () => import('@/views/gateway/index'),
  TaskCollect: () => import('@/views/taskCollect/index'),
  LogCollect: () => import('@/views/logCollect/index'),
  LinkCollect: () => import('@/views/linkCollect/index'),
  LinkEquipment: () => import("@/views/linkEquipment/index"),
  MyEquipment: () => import('@/views/myEquipment/index')
}


router.beforeEach((to, from, next) => {
  NProgress.start()
  if (Cookies("userStatus")) {
    Cookies.remove("userStatus")
  }
  request({
    url: "https://cj.datasurge.cn:11115/getAllServer"
  }).then((res) => {
    res.data["https://cj-sy"] = "https://" + res.data["https://cj-sy"]
    res.data["https://cj-log"] = "https://" + res.data["https://cj-log"]
    res.data["https://cj-collect"] = "https://" + res.data["https://cj-collect"]
    res.data["https://cj-device"] = "https://" + res.data["https://cj-device"]

    // res.data["https://cj-sy"] = "http://192.168.3.207:8080/"
    // res.data["https://cj-log"] = "http://192.168.3.204:8099/"
    // res.data["https://cj-collect"] = "http://192.168.3.207:9094/"
    // res.data["https://cj-device"] = "http://192.168.3.205:9091/"
    store.dispatch("getAllserverUrl", res.data);
    if (getToken()) {
      /* has token*/
      if (to.path === '/login') {
        next({
          path: '/'
        })
        NProgress.done()
      } else {
        if (store.getters.addRouters.length == 0) {
          store.dispatch('GetUserInfo').then(res => {
            // 拉取user_info
            const asyncRouters = filterRouter(res.data.routers, mapRouters)
            store.dispatch('GenerateRoutes', {
              asyncRouters
            }).then(() => {
              // 动态添加可访问路由表 
              router.addRoutes(store.getters.addRouters)
              next({ ...to,
                replace: true
              })
            })
          }).catch((err) => {
            store.dispatch('FedLogOut').then(() => {
              Message.error(err || '验证失败，请重新登陆')
              next({
                path: '/'
              })
            })
          })
        } else {
          next()
        }
      }
    } else {
      /* has no token*/
      if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
        next()
      } else {
        next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
        NProgress.done()
      }
    }
    // ----------------------------------------------
  })
})

router.afterEach(() => {
  NProgress.done()
})
