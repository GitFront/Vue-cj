<template>
  <div class="components-container" >
    <!-- <code><strong>SplitPane</strong> If you've used
      <a href="http://codepen.io/" target="_blank"> codepen</a>,
      <a href="https://jsfiddle.net/" target="_blank"> jsfiddle </a>will not be unfamiliar.
      <a href="https://github.com/PanJiaChen/vue-split-pane" target="_blank"> Github repository</a>
    </code> -->
<el-row :gutter="24">
  <el-col>
    <div class="grid-content bg-purple-light">
      <div class="app-container">
    <div class="filter-container">
      <el-input :placeholder="$t('table.searchRoleText')" clearable  prefix-icon="el-icon-search" v-model="listQuery.roleName" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter">
      </el-input>
      <el-button v-waves class="filter-item" style="margin-left:20px" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button v-permission="['role-create']" v-waves class="filter-item" style="margin-left:20px" type="primary" icon="el-icon-plus" @click="handleDialog(null,$t('table.add'))">{{ $t('table.add') }}</el-button>
      <!-- <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('table.add') }}</el-button> -->
    </div>
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="tableList"
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <el-table-column :label="$t('table.roleName')" align="left" >
        <template slot-scope="scope">
          <span>{{ scope.row.roleName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.createPerson')" align="left">
        <template slot-scope="scope">
          <span>{{ scope.row.createPerson}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.createDate')">
        <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.setting')" align="left" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-permission="['role-detail']" size="mini" @click="handleDialog(scope.row,$t('table.detail'))">{{ $t('table.detail') }}</el-button>
          <el-button v-permission="['role-edit']" type="primary" size="mini" @click="handleDialog(scope.row,$t('table.edit'))">{{ $t('table.edit') }}</el-button>
          <el-button v-permission="['role-permission']" size="mini" @click="handleDialog(scope.row,$t('table.auth'))"  type="warning">{{ $t('table.auth') }}</el-button>        
          <el-button v-permission="['role-delete']" size="mini" type="danger" @click="deleteData(scope.row,$t('table.delete'))">{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.size" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

  <!-- 弹出框 -->
    <el-dialog :title="dialogStatus" class="dialog"  :width="dialogStatus == $t('table.auth') ? '350px' : '500px'" :visible.sync="dialogFormVisible" >
      <el-form  v-if= "dialogStatus != $t('table.auth')" ref="dataForm" :rules="rules" :model="formData" label-position="left" label-width="35px">
        <el-form-item>
          <el-input class="input" style= "width:397px"  :disabled="true" v-model="formData.createPerson" placeholder="请输入">
            <template slot="prepend">
                <span>{{ $t("table.createPerson") }}</span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="roleName">
          <el-input class="input" style= "width:397px"  :disabled="dialogStatus == $t('table.detail')" v-model="formData.roleName" :placeholder="$t('table.roleNameText')">
            <template slot="prepend">
                <span>{{ $t("table.roleName") }}</span>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
        <el-tree style="margin-left:30px"
        :loading="false"
        v-if="dialogStatus == $t('table.auth')"
        :data="roleList"
        ref="tree"
        show-checkbox
        node-key="menuId"
        :default-checked-keys="roleNode"
        :props="{children: 'children', label: 'menuName'}">
                <!-- :default-expanded-keys="[2, 3]" -->
        </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="dialogStatus != $t('table.detail')" @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus == $t('table.add')" type="primary"  @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-if="dialogStatus == $t('table.edit')" type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
        <el-button v-if="dialogStatus == $t('table.auth')" type="primary" @click="setRole">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
    </div>
  </el-col>
</el-row>
  </div>
</template>

<script>
import request from "@/utils/request";

import waves from "@/directive/waves"; // 水波纹指令
import { parseTime } from "@/utils";
import Cookies from "js-cookie";

export default {
  data() {
    return {
      url: null,
      treeData: null,
      tableKey: 0,
      tableList: null,
      total: null,
      listLoading: true,
      dialogStatus: null,
      dialogFormVisible: false,
      formData: {
        roleName: "",
        createPerson: "管理员",
        roleId: null
      },
      roleNode: [],
      roleList: [],
      listQuery: {
        page: 1,
        size: 10,
        roleName: ""
        // sort: "+id"
      },
      rules: {
        roleName: [
          {
            required: true,
            message: "Please Enter Role Name",
            trigger: "blur"
          },
          {
            min: 1,
            max: 30,
            message: "Please Enter 1-30 Strings",
            trigger: "change"
          }
        ],
      }
    };
  },
  name: "role",
  directives: {
    waves
  },
  methods: {
    getList() {
      var vm = this;
      vm.listLoading = true;
      request({
        url:
          vm.url +
          "role/findRoleList?page=" +
          vm.listQuery.page +
          "&size=" +
          vm.listQuery.size +
          "&roleName=" +
          vm.listQuery.roleName
      }).then(res => {
        if (res.status == 200) {
          res.data.data = res.data.data.map((item, i) => {
            item.createTime = parseTime(item.createTime);
            return item;
          });
          vm.tableList = res.data.data;
          vm.total = res.data.count;
          vm.listLoading = false;
        }
      });
    },
    getRoleNode(value) {
      var vm = this;
      request({
        url: vm.url + "role/selectRoleList?roleId=" + value.roleId
      }).then(res => {
        vm.roleNode = res.data.menuId.split(",");
      });
    },
    getRoleList(value) {
      var vm = this;
      request({
        url: vm.url + "menu/findManageTree"
      }).then(res => {
        vm.roleList = res.data;
      });
    },
    reset() {
      var vm = this;
      vm.formData = {
        createPerson: "管理员",
        roleName: ""
      };
    },
    setRole() {
      var vm = this;
      request({
        url: vm.url + "role/addImpowerRole?roleId=" + vm.formData.roleId + "&roleMenuId=" + vm.$refs.tree.getCheckedKeys().toString()
      }).then(res => {
        if(res.status == 200){
          vm.$notify({
            title: "成功",
            message: "已重新授权",
            type :"success",
            duration: 2000
          })
          vm.dialogFormVisible = false
        }
      })
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.size = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.getList();
    },

    handleDialog(value, type) {
      var vm = this;
      vm.dialogStatus = type;
      vm.reset();
      if (value != null && type != "授权" && type != "authorization") {
        vm.formData.createPerson = value.createPerson;
        vm.formData.roleName = value.roleName;
        vm.formData.roleId = value.roleId;
      } else if (type == "授权" || type == "authorization") {
        vm.formData.roleId = value.roleId;
        vm.getRoleList(value);
        vm.getRoleNode(value);
      }
      vm.dialogFormVisible = true;
      vm.$nextTick(() => {
        vm.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      var vm = this;
      vm.$refs["dataForm"].validate(valid => {
        if(valid){
          request({
            url:
              vm.url +
              "role/addRoleOne?createPerson=" +
              vm.formData.createPerson +
              "&roleName=" +
              vm.formData.roleName
          }).then(res => {
            if (res.status == 200) {
              vm.$notify({
                title: "成功",
                message: "添加成功",
                type: "success",
                duration: 2000
              });
            }
            vm.dialogFormVisible = false;
            vm.getList();
          });
        }else{
          vm.$Message({
            type: "info",
            message: "验证未通过"
          })
          return false
        }
      })

    },
    deleteData(roleData, type) {
      var vm = this;
      vm.listLoading = true;
      vm.dialogStatus = type;
      vm.$confirm(
        "是否删除名称为【" + roleData.roleName + "】的组织机构",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          center: true
        }
      )
        .then(() => {
          request({
            url: vm.url + "role/delRoleOne?roleId=" + roleData.roleId
          }).then(res => {
            if (res.status == 200) {
              vm.$notify({
                title: "成功",
                message: "成功删除",
                type: "success",
                duration: 2000,
                onClose: function() {
                  vm.getList()
                }
              });
            }
          });
        })
        .catch(() => {
          vm.$notify({
            title: "取消",
            message: "删除操作已终止",
            type: "success",
            duration: 2000
          });
        });
    },
    updateData() {
      var vm = this;
      vm.$refs["dataForm"].validate(valid => {
        if(valid){
          request({
            url:
              vm.url +
              "role/updRoleOne?roleName=" +
              vm.formData.roleName +
              "&createPerson=" +
              vm.formData.createPerson +
              "&roleId=" +
              vm.formData.roleId
          }).then(res => {
            if (res.status == 200) {
              vm.$notify({
                title: "成功",
                message: "修改成功",
                type: "success",
                duration: 2000
              });
              vm.dialogFormVisible = false;
              vm.getList();
            }else{
              vm.$Message({
                type:"info",
                message: "验证未通过"
              })
              return false
            }
          });
        }
      })
    }
  },
  mounted() {
    var vm = this;
    vm.url =  vm.$store.getters.serverUrl["https://cj-sy"];
    vm.getList();
  }
};
</script>

<style  scoped>
.components-container {
  position: relative;
  height: 100vh;
}
.el-card__header {
  padding: 15px 0px 12px 20px !important;
}
.splitter-paneL {
  background: sienna;
}
.el-input-group__prepend {
  border-right: 0;
  width: 100px;
  text-align: center;
}
.el-dialog__body {
  padding: 10px 0px;
}
.el-dialog {
  width: 505px;
}
.el-input--medium .el-input__inner {
  height: 38px;
}
.select {
  width: 260px;
  float: left;
}
.input {
  width: 360px;
}
.el-dialog .el-card__header {
  padding: 15px 20px !important;
  box-shadow: 0px 2px #cccccc;
}
</style>
