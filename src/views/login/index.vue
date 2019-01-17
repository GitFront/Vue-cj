<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="off" label-position="left">

      <div class="title-container">
        <h3 class="title">{{ $t('login.title') }}</h3>
        <lang-select class="set-language"/>
      </div>

      <el-form-item prop="loginName">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          v-model="loginForm.loginName"
          type="text"
          auto-complete="off"
        />
      </el-form-item>

      <el-form-item prop="passWord">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :type="passwordType"
          v-model="loginForm.passWord"
          auto-complete="off"
          @keyup.enter.native="handleLogin" />
        <span class="show-pwd" @click="showPwd">
          <svg-icon icon-class="eye" />
        </span>
      </el-form-item>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">{{ $t('login.logIn') }}</el-button>
      <el-button class="thirdparty-button" @click="handleDialog" type="primary" size="mini">{{ $t('login.register') }}</el-button>
      <!-- <el-button class="thirdparty-button" type="primary" @click="showDialog=true">{{ $t('login.thirdparty') }}</el-button> -->
    </el-form>
    <el-dialog width="500px" :center="true" translate="el-zoom-in-center"  :title="$t('login.register')"  :visible.sync="dialogVisible" append-to-body>
      <el-form ref="registerForm"  :append-to-body="true" :model="register" :rules="registerRules"  class="dialogForm" auto-complete="off" >
        <el-form-item prop="loginName">
          <el-input v-model="register.loginName">
            <template slot="prepend"><div class="prependItem">{{ $t("login.loginName") }}</div></template>
          </el-input>      
        </el-form-item>
        <el-form-item prop="passWord">
          <el-input type="password" v-model="register.passWord">
            <template slot="prepend"><div class="prependItem">{{ $t("login.passWord") }}</div></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="userName">
           <el-input v-model="register.userName">
            <template slot="prepend"><div class="prependItem">{{ $t("login.userName") }}</div></template>
          </el-input>         
        </el-form-item>
        <el-form-item prop="sex">
          <div class="el-input-group__prepend" style="border: 1px solid #dcdfe6;">
            <div class="prependItem"> {{$t("login.sex")}} </div>
          </div>
          <div style="display:table-cell; padding-left:20px">
            <el-radio v-model="register.sex" label="男">男</el-radio>
            <el-radio v-model="register.sex" label="女">女</el-radio>
          </div>
        </el-form-item>
        <el-form-item prop="telephone">
          <el-input v-model="register.telephone">
            <template slot="prepend"><div class="prependItem">{{ $t("login.telephone") }}</div></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="register.email">
            <template slot="prepend"><div class="prependItem">{{ $t("login.email") }}</div></template>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="register = {}">{{ $t('login.reset') }}</el-button>
        <el-button type="primary" @click="handleRegister">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!-- <el-dialog :title="$t('login.register')" :visible.sync="showDialog" append-to-body>
      {{ $t('login.thirdpartyTips') }}
      <br>
      <br>
      <br>
      <social-sign />
    </el-dialog> -->

  </div>
</template>

<script>
import { isvalidUsername } from "@/utils/validate";
import LangSelect from "@/components/LangSelect";
import SocialSign from "./socialsignin";
import request from "@/utils/request";
import { Message, MessageBox } from "element-ui";

export default {
  name: "Login",
  components: { LangSelect, SocialSign },
  data() {
    return {
      url: this.$store.getters.serverUrl["https://cj-sy"],
      loginForm: {
        loginName: "",
        passWord: ""
      },
      dialogVisible: false,
      loginRules: {
        loginName: [
          {
            required: true,
            trigger: ["blur", "change"],
            message: "Please Enter LoginName"
          }
        ],
        passWord: [
          { required: true, trigger: "blur", message: "Please Enter PassWord" }
        ]
      },
      passwordType: "password",
      loading: false,
      showDialog: false,
      redirect: undefined,
      register: {},

      registerRules: {
        loginName: [
          {
            required: true,
            trigger: ["blur", "change"],
            message: "Please Enter LoginName"
          },
          {
            min: 1,
            max: 20,
            trigger: ["blur", "change"],
            message: "Please Enter 1-20 Strings"
          }
        ],
        passWord: [
          {
            required: true,
            trigger: ["blur", "change"],
            message: "Please Enter Password"
          },
          {
            min: 6,
            max: 12,
            trigger: ["blur", "change"],
            message: "Please Enter 6-12 Strings"
          },
        ],
        userName: [
          {
            required: true,
            trigger: ["blur", "change"],
            message: "Please Enter userName"
          },
          {
            min: 1,
            max: 12,
            trigger: ["blur", "change"],
            message: "Please Enter 1-12 Strings"
          }
        ],
        sex: [
          {
            required: true,
            trigger: ["blur", "change"],
            message: "Please Select Sex"
          }
        ],
        telephone: [
          {
            required: true,
            trigger: ["blur", "change"],
            message: "Please Enter Telephone"
          },
          // {
          //   validator: this.telValidate,
          //   trigger: ["blur", "change"],
          // }
        ],
        email: [
          {
            required: true,
            trigger: ["blur", "change"],
            message: "Please Enter email"
          },
          {
            type: "email",
            message: "Please Enter Correct Email Address",
            trigger: ["blur", "change"]
          }
        ]
      }
    };
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  created() {
    var vm = this;
    // window.addEventListener('hashchange', this.afterQRScan)
  },
  destroyed() {
    // window.removeEventListener('hashchange', this.afterQRScan)
    var vm = this;
  },
  mounted() {
    var vm = this;
  },
  methods: {
    showPwd() {
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
    },
    telValidate(rule, value, callback){
      if (!/^1[34578]\d{9}$/.test(value)) {
        callback(new Error("Please Enter Correct Telephone"));
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          let signIn = {...this.loginForm}
          if (signIn.passWord.length != 32) signIn.passWord = this.$md5(signIn.passWord);
          this.$store
            .dispatch("LoginByUsername", signIn)
            .then(() => {
              this.loading = false; 
              this.$router.push({ path: this.redirect || "/" });
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    handleDialog() {
      var vm = this;
      vm.dialogVisible = true;
      vm.register = {};
      vm.$nextTick(() => {
        vm.$refs["registerForm"].clearValidate();
      });
    },
    handleRegister() {
      var vm = this;
      vm.$refs.registerForm.validate(valid => {
        if (valid) {
          let reg = {...vm.register}
          reg.passWord = vm.$md5(reg.passWord)
          request({
            url: vm.url + "userLogin/addUser",
            data: reg
          }).then(res => {
            let title, type;
            if (res.status == 200) {
              title = res.data == "注册成功" ? "注册成功" : "注册失败";
              type = res.data == "注册成功" ? "success" : "warning";
              vm.$notify({
                title: title,
                type: type,
                message: res.data
              });
              vm.dialogVisible = res.data == "注册成功" ? false : true
            }
          });
        }
      });
    },
    afterQRScan() {
      // const hash = window.location.hash.slice(1)
      // const hashObj = getQueryObject(hash)
      // const originUrl = window.location.origin
      // history.replaceState({}, '', originUrl)
      // const codeMap = {
      //   wechat: 'code',
      //   tencent: 'code'
      // }
      // const codeName = hashObj[codeMap[this.auth_type]]
      // if (!codeName) {
      //   alert('第三方登录失败')
      // } else {
      //   this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
      //     this.$router.push({ path: '/' })
      //   })
      // }
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
$bg: #283443;
$light_gray: #eee;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
    &::first-line {
      color: $light_gray;
    }
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;
      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.dialogForm {
  width: 90%;
  margin: -10px auto 20px auto;
  .prependItem {
    width: 80px;
    text-align: center;
  }
}
.login-container {
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: $bg;
  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    width: 520px;
    max-width: 100%;
    padding: 35px 35px 15px 35px;
    margin: 120px auto;
  }
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }
  .title-container {
    position: relative;
    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
    .set-language {
      color: #fff;
      position: absolute;
      top: 5px;
      right: 0px;
    }
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .thirdparty-button {
    position: absolute;
    right: 35px;
  }
}
</style>
