import axios from 'axios'
// import { Message } from 'element-ui'
import store from '@/store'
import Cookies from "js-cookie"
import {
  getToken
} from '@/utils/auth'
import {
  Message,
  MessageBox
} from 'element-ui'

var service = axios.create({
  baseURL: "",
  timeout: 5000,
  method: "post",
  transformRequest: [
    //默认以表单方式请求
    function (data) {
      let ret = "";
      for (let it in data) {
        ret +=
          encodeURIComponent(it) +
          "=" +
          encodeURIComponent(data[it]) +
          "&";
      }
      return ret;
    }
  ]
})


// request interceptor
service.interceptors.request.use(
  config => {
    if (config.url.indexOf("getAllServer") < 0 && config.url.indexOf("login") < 0) {
      // config.headers["X-Token"] = getToken()
      // config.data = {
      //   ...config.data,
      //   currentLoginName: "admin1",
      //   token: "50a24776-ea73-4c83-a965-1263d1578a58"
      // }
      if (config.url.indexOf("?") > 0) {
        config.url = config.url + "&currentLoginName=" + Cookies.get("loginName") +"&token=" + Cookies.get("Admin-Token")
      } else {
        config.url = config.url + "?currentLoginName="+ Cookies.get("loginName") +"&token=" + Cookies.get("Admin-Token")
      }
    }
    return config
  },
  error => {
    console.log(error)
    Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    if (res == "noLogin" || res == "timeout") {
      if (!Cookies("userStatus")) {
        // store.commit("")
        Cookies("userStatus", res)
        MessageBox.confirm('会话已超时，可以取消继续留在该页面，或者重新登录', '确定登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('FedLogOut').then(() => {
            location.reload()
          });
        }).catch(() => {
          Message({
            type: "info",
            message: "已停留在当前页面"
          })
        })
      }
      return Promise.reject("error")
    }else {
      return response
    }
  },
  // response => {
  //   const res = response.data
  //   if (res.code !== 20000) {
  //     Message({
  //       message: res.message,
  //       type: 'error',
  //       duration: 5 * 1000
  //     })
  //     // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
  //     if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
  //       // 请自行在引入 MessageBox
  //       // import { Message, MessageBox } from 'element-ui'
  //       MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
  //         confirmButtonText: '重新登录',
  //         cancelButtonText: '取消',
  //         type: 'warning'
  //       }).then(() => {
  //         store.dispatch('FedLogOut').then(() => {
  //           location.reload() // 为了重新实例化vue-router对象 避免bug
  //         })
  //       })
  //     }
  //     return Promise.reject('error')
  //   } else {
  //     return response.data
  //   }
  // },
  error => {

    Message({
      message: "服务端错误（" + error.message + "）" + "url地址：" + error.config.url,
      type: 'error',
      duration: 5 * 1000,
    })
    if(error.config.url.indexOf("getAllServer")>0){
      next({
        path:"/"
      })
    }
    return Promise.reject(error)
  }
)

export default service
