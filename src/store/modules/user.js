import {
  getToken,
  setToken,
  removeToken
} from '@/utils/auth'
import request from "@/utils/request"
import store from "../../store"
import Cookies from 'js-cookie'
import {
  Message
} from "element-ui"

const user = {
  state: {
    user: '',
    status: '',
    code: '',
    token: getToken(),
    name: '',
    avatar: '',
    introduction: '',
    roles: [],
    userId: "",
  },

  mutations: {
    SET_CODE: (state, code) => {
      state.code = code
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction
    },
    SET_USERID: (state, userId) => {
      state.userId = userId
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },

  actions: {
    // 用户名登录
    LoginByUsername({
      commit
    }, userInfo) {
      // const userName = userInfo.userName.trim()
      return new Promise((resolve, reject) => {
        request({
          url: store.getters.serverUrl["https://cj-sy"] +
            "userLogin/login",
          data: {
            loginName: userInfo.loginName,
            passWord: userInfo.passWord
          }
        }).then(res => {
          const data = res.data
          if (data.resultCode == "0000") {
            commit('SET_TOKEN', data.token[userInfo.loginName])
            setToken(data.token[userInfo.loginName])
            Cookies.set("loginName", userInfo.loginName)
            Cookies.set("passWord", userInfo.passWord)
            resolve(data)
          } else {
            Message.error(data.resultDesc)
            reject(data)
          }
        })
      })
    },


    /**
     *
     *
     * @param
     * @returns
     */
    GetUserInfo({
      commit,
      state
    }) {
      return new Promise((resolve, reject) => {
        request({
          url: store.getters.serverUrl["https://cj-sy"] +
            "userLogin/login?loginName=" + Cookies.get("loginName") + "&passWord=" + Cookies.get("passWord")
        }).then(res => {
          const data = res.data
          data.routers = 
          [{
              path: '/SystemMangaer',
              component: "Layout",
              redirect: '/assets/index',
              alwaysShow: true,
              meta: {
                title: 'system',
                icon: 'tab',
                noCache: true
              },
              children: [{
                  path: 'assets',
                  component: "Assets",
                  name: 'assets',
                  meta: {
                    title: 'assets',
                    noCache: true
                  },
                },
                {
                  path: 'company',
                  component: "Company",
                  name: 'company',
                  meta: {
                    title: 'company',
                    noCache: true
                  }
                },
                {
                  path: 'role',
                  component: "Role",
                  name: 'role',
                  meta: {
                    title: 'role',
                    noCache: true
                  }
                },
                {
                  path: 'userAuth',
                  component: "UserAuth",
                  name: 'userAuth',
                  meta: {
                    title: 'userAuth',
                    noCache: true
                  }
                },
                {
                  path: 'dictionary',
                  component: "Dictionary",
                  name: 'dictionary',
                  meta: {
                    title: 'dictionary',
                    noCache: true
                  }
                }
              ]
            },
            {
              path: '/collect',
              component: "Layout",
              redirect: '/taskCollect/index',
              alwaysShow: true,
              meta: {
                title: 'collect',
                icon: 'tab'
              },
              children: [{
                  path: 'taskCollect',
                  component: "TaskCollect",
                  name: 'taskCollect',
                  meta: {
                    title: 'taskCollect'
                  }
                },
                {
                  path: 'logCollect',
                  component: "LogCollect",
                  name: 'logCollect',
                  meta: {
                    title: 'logCollect'
                  }
                },
                {
                  path: 'linkCollect',
                  component: "LinkCollect",
                  name: 'linkCollect',
                  meta: {
                    title: 'linkCollect'
                  }
                },
              ]
            },
            {
              path: '/deviceManage',
              component: "Layout",
              redirect: '/linkEquipment/index',
              alwaysShow: true,
              meta: {
                title: 'deviceManage',
                icon: 'tab'
              },
              children: [{
                path: 'linkEquipment',
                component: "LinkEquipment",
                name: 'linkEquipment',
                meta: {
                  title: 'linkEquipment'
                }
              }, {
                path: 'myEquipment',
                component: "MyEquipment",
                name: 'myEquipment',
                meta: {
                  title: 'myEquipment'
                }
              }]
            },
            {
              path: '/gateway',
              component: "Layout",
              redirect: '/gateway/index',
              alwaysShow: true,
              meta: {
                title: 'gateway',
                icon: 'tab'
              },
              children: [{
                path: 'gateway',
                component: "Gateway",
                name: 'gateway',
                meta: {
                  title: 'gateway'
                }
              }]
            },
            // chartsRouter,
            // componentsRouter,
            // tableRouter,
            // nestedRouter,
            {
              path: '*',
              redirect: '/404',
              hidden: true
            }
          ]

          data.roles = [
            "assets-create",
            "assets-delete",
            "assets-edit",
            "assets-detail",

            "company-create",
            "company-delete",
            "company-edit",
            "company-detail",
            "company-permission",

            "user-create",
            "user-delete",
            "user-edit",
            "user-detail",
            "user-permission",

            "role-create",
            "role-delete",
            "role-edit",
            "role-detail",
            "role-permission",

            "dictionary-create",
            "dictionary-delete",
            "dictionary-edit",
            "dictionary-detail",

            "taskCollect-isRunning",

            "logCollect-create",
            "logCollect-delete",
            "logCollect-edit",
            "logCollect-detail",

            "linkCollect-create",
            "linkCollect-delete",
            "linkCollect-edit",
            "linkCollect-detail",

            "linkEqu-create",
            "linkEqu-delete",
            "linkEqu-edit",
            "linkEqu-detail",

            "myEqu-create",
            "myEqu-delete",
            "myEqu-edit",
            "myEqu-detail",
          ]
          // "assets": ["create","delete","edit","detail"],
          // "company": ["create","delete","edit","detail"],
          // "user": ["create","delete","edit","detail"],
          // "role": ["create","delete","edit","detail"],
          // "dictionary": ["create","delete","edit","detail"],
          // "taskCollect": ["create","delete","edit","detail"],
          // "logCollect": ["create","delete","edit","detail"],
          // "linkCollect": ["create","delete","edit","detail"],
          // "linkEqu": ["create","delete","edit","detail"],
          // "myEqu": ["create","delete","edit","detail"]
          if (data.roles && data.roles.length > 0) {
            commit('SET_ROLES', data.roles)
          } else {
            reject('用户信息不可为空')
          }
          commit('SET_USERID', data.data.userId)
          commit('SET_NAME', data.data.userName)
          commit('SET_AVATAR', 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif')
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 第三方验证登录
    // LoginByThirdparty({ commit, state }, code) {
    //   return new Promise((resolve, reject) => {
    //     commit('SET_CODE', code)
    //     loginByThirdparty(state.status, state.email, state.code).then(res => {
    //       commit('SET_TOKEN', res.data.token)
    //       setToken(res.data.token)
    //       resolve()
    //     }).catch(error => {
    //       reject(error)
    //     })
    //   })
    // },

    // 登出
    LogOut({
      commit,
      state
    }) {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken();
      // return new Promise((resolve, reject) => {
      //   logout(state.token).then(() => {
      //     commit('SET_TOKEN', '')
      //     commit('SET_ROLES', [])
      //     removeToken();
      //     resolve()
      //   }).catch(error => {
      //     reject(error)
      //   })
      // })
    },
    //用户状态
    setStatus({
      commit,
      status
    }) {
      commit("SET_STATUS", status)
    },
    // 前端 登出

    FedLogOut({
      commit
    }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken();
        resolve()
      })
    },

    // 动态修改权限
    // ChangeRoles({
    //   commit,
    //   dispatch
    // }, role) {
    //   return new Promise(resolve => {
    //     commit('SET_TOKEN', role)
    //     setToken(role)
    //     getUserInfo(role).then(res => {
    //       const data = res.data
    //       commit('SET_ROLES', data.roles)
    //       commit('SET_NAME', data.name)
    //       commit('SET_AVATAR', data.avatar)
    //       commit('SET_INTRODUCTION', data.introduction)
    //       dispatch('GenerateRoutes', data) // 动态修改权限后 重绘侧边菜单
    //       resolve()
    //     })
    //   })
    // }
  }
}

export default user
