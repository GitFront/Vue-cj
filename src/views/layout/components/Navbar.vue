<template>
  <div class="navbar">
    <hamburger :toggle-click="toggleSideBar" :is-active="sidebar.opened" class="hamburger-container"/>

    <breadcrumb class="breadcrumb-container"/>

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <error-log class="errLog-container right-menu-item"/>

        <el-tooltip :content="$t('navbar.screenfull')" effect="dark" placement="bottom">
          <screenfull class="screenfull right-menu-item"/>
        </el-tooltip>

        <el-tooltip :content="$t('navbar.size')" effect="dark" placement="bottom">
          <size-select class="international right-menu-item"/>
        </el-tooltip>
        
        <lang-select class="international right-menu-item"/>

        <el-tooltip :content="$t('navbar.theme')" effect="dark" placement="bottom">
          <theme-picker class="theme-switch right-menu-item"/>
        </el-tooltip>
      </template>

      <el-dropdown class="avatar-container right-menu-item" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">
          <i class="el-icon-caret-bottom"/>
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/home">
            <el-dropdown-item>
              {{ $t('navbar.home') }}
            </el-dropdown-item>
          </router-link>

          <el-dropdown-item>
            <span style="display:block;" @click="handleDialog($t('navbar.userInfo'))">{{ $t('navbar.userInfo') }}</span>
          </el-dropdown-item>

          <el-dropdown-item>
            <span style="display:block;" @click="handleDialog($t('navbar.changePassword'))">{{ $t('navbar.changePassword') }}</span>
          </el-dropdown-item>

          <el-dropdown-item>
            <span style="display:block;"  @click.prevent.stop="guide">{{ $t('navbar.showGuide') }}</span>
          </el-dropdown-item>

          <el-dropdown-item divided>
            <span style="display:block;" @click="logout">{{ $t('navbar.logOut') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

   <!-- 个人信息 -->
    <el-dialog :title="dialogStatus"  width="500px" :visible.sync="dialogFormVisible" >
      <el-form v-if="dialogStatus == $t('navbar.userInfo')" style="width:80%;margin:-30px auto 0px auto">
        <el-form-item>
            <el-input v-model="userInfoData.loginName" disabled="">
                <template slot="prepend">
                    {{ $t("singlePage.loginName") }}
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-input v-model="userInfoData.userName">
                <template slot="prepend">
                    {{ $t("singlePage.userName") }}
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <div class="el-input el-input--medium el-input-group el-input-group--prepend">
              <div class="el-input-group__prepend" style="border-right:1px solid #dcdfe6;line-height:34px">{{ $t("singlePage.sex") }}</div>
              <el-radio-group v-model="userInfoData.sex" size="small" style="display:table-cell;border:1px solid #dcdfe6;">
                <el-radio style="margin-left:20px" label="男" ></el-radio>
                <el-radio label="女" ></el-radio>
              </el-radio-group>
            </div>
        </el-form-item>
        <el-form-item>
            <el-input v-model="userInfoData.telephone">
                <template slot="prepend">
                    {{ $t("singlePage.telePhone") }}
                </template>
            </el-input>
        </el-form-item> 
        <el-form-item>
            <el-input v-model="userInfoData.email">
                <template slot="prepend">
                    {{ $t("singlePage.email") }}
                </template>
            </el-input>
        </el-form-item>               
      </el-form>
      <el-form :model="cgPassword" v-else style="width:80%;margin:-30px auto 0px auto">
        <el-form-item>
            <el-input type="password" v-model="cgPassword.oldPas">
                <template slot="prepend">
                    {{ $t("singlePage.oldPassword") }}
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-input type="password" v-model="cgPassword.newPas">
                <template slot="prepend">
                    {{ $t("singlePage.newPassword") }}
                </template>
            </el-input>
        </el-form-item> 
        <el-form-item>
            <el-input type="password" v-model="cgPassword.newPas">
                <template slot="prepend">
                    {{ $t("singlePage.enterAgain") }}
                </template>
            </el-input>
        </el-form-item>               
      </el-form>
      <div slot="footer" style="margin-top:-30px" class="dialog-footer">
        <el-button  @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button  v-if="dialogStatus == $t('navbar.userInfo')" type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
        <el-button  v-if="dialogStatus == $t('navbar.changePassword')" type="primary" @click="updatePassword">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import ErrorLog from "@/components/ErrorLog";
import Screenfull from "@/components/Screenfull";
import SizeSelect from "@/components/SizeSelect";
import LangSelect from "@/components/LangSelect";
import ThemePicker from "@/components/ThemePicker";

import * as Driver from "driver.js";
import "driver.js/dist/driver.min.css";
import steps from "./defineSteps";
import request from "@/utils/request";

export default {
  data() {
    return {
      driver: null,
      dialogStatus: "",
      dialogFormVisible: false,
      userInfoData: {},
      url: this.$store.getters.serverUrl["https://cj-sy"],
      cgPassword: {
        oldPas: "",
        newPas: "",
        userId: this.$store.state.user.userId
      }
    };
  },
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    SizeSelect,
    LangSelect,
    ThemePicker
  },
  mounted() {
    this.driver = new Driver();
  },
  computed: {
    ...mapGetters(["sidebar", "name", "avatar", "device"])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch("toggleSideBar");
    },
    logout() {
      this.$store.dispatch("LogOut").then(() => {
        location.reload(); // In order to re-instantiate the vue-router object to avoid bugs
      });
    },
    guide() {
      this.driver.defineSteps(steps);
      this.driver.start();
    },
    handleDialog(dialogStatus) {
      var vm = this;
      let userId = vm.$store.state.user.userId;
      vm.dialogStatus = dialogStatus;
      if (vm.dialogStatus == "userInfo" || vm.dialogStatus == "用户信息") {
        request({
          url: vm.url + "user/findByUserId",
          data: {
            userId: userId
          }
        }).then(res => {
          if (res.status == 200) {
            vm.userInfoData = res.data;
            vm.dialogFormVisible = true;
          }
        });
      }else{
        vm.cgPassword = {
          oldPas: "",
          newPas: "",
          userId: this.$store.state.user.userId
        }
        vm.dialogFormVisible = true
      }
    },
    updateData() {
      var vm = this;
      request({
        url: vm.url + "user/updUserInfo",
        data: vm.userInfoData
      }).then(res => {
        if (res.status == 200) {
          vm.$notify({
            title: "成功",
            message: "个人信息已更新",
            type: "success",
            duration: 2000
          });
          vm.dialogFormVisible = false;
        }
      });
    },
    updatePassword(){
      var vm = this;
      request({
        url: vm.url + "user/updUserPassword",
        data: vm.cgPassword
      }).then(res => {
        if (res.status == 200 && res.data.error =="") {
          vm.$notify({
            title: "成功",
            message: "密码已修改",
            type: "success",
            duration: 2000
          });
          vm.dialogFormVisible = false;
        }else{
          vm.$Message({
            message: res.data.error,
            type:"error"
          })
          return false
        }
      });
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  .breadcrumb-container {
    float: left;
  }
  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }
  .right-menu {
    float: right;
    height: 100%;
    &:focus {
      outline: none;
    }
    .right-menu-item {
      display: inline-block;
      margin: 0 8px;
    }
    .screenfull {
      height: 20px;
    }
    .international {
      vertical-align: top;
    }
    .theme-switch {
      vertical-align: 15px;
    }
    .avatar-container {
      height: 50px;
      margin-right: 30px;
      .avatar-wrapper {
        cursor: pointer;
        margin-top: 5px;
        position: relative;
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }
        .el-icon-caret-bottom {
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
