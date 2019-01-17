<template>
  <div class="components-container">
    <el-row>
      <el-col style="width:300px">
        <el-card class="box-card" style="margin-top:20px;">
          <div slot="header" class="clearfix">{{$t('other.treeGird')}}</div>
          <el-tree
            :data="treeData"
            :props="{'children':'children','label':'menuName'}"
            :highlight-current="true"
            accordion
            @node-click="handleNodeClick"
          ></el-tree>
        </el-card>
      </el-col>
      <el-col style="width: calc(100% - 300px)">
        <div class="grid-content bg-purple-light">
          <div  class="app-container">
            <div class="filter-container">
              <el-input
                :placeholder="$t('table.assetsSearchText')"
                clearable
                prefix-icon="el-icon-search"
                v-model="listQuery.menuName"
                style="width: 200px;"
                class="filter-item"
                @keyup.enter.native="handleFilter"
              ></el-input>
              <el-button
                v-waves
                class="filter-item"
                style="margin-left:20px"
                type="primary"
                icon="el-icon-search"
                @click="handleFilter"
              >{{ $t('table.search') }}</el-button>
              <el-button
                v-waves
                v-permission="['assets-create']"
                class="filter-item"
                style="margin-left: 10px;"
                type="primary"
                icon="el-icon-edit"
                @click="handleDialog('',$t('table.add'))"
              >{{ $t('table.add') }}</el-button>
              <el-button
                v-waves
                class="filter-item"
                @click="refresh"
                style="margin-left: 10px;"
                type="primary"
                icon="el-icon-refresh"
              >{{ $t('table.refresh') }}</el-button>
            </div>

            <el-table
              v-loading="listLoading"
              :key="tableKey"
              :data="tableList"
              border
              fit
              highlight-current-row
              style="width: 100%;"
            >
              <el-table-column :label="$t('table.assetsName')" align="left" width="300">
                <template slot-scope="scope">
                  <span>{{ scope.row.menuName }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('table.parentAssetsName')" width="150px" align="left">
                <template slot-scope="scope">
                  <span>{{ scope.row.menuParentName}}</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('table.assetsUrl')" min-width="150px">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.menuUrl!= '' && scope.row.menuUrl">{{ scope.row.menuUrl}}</el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="$t('table.assetsType')" width="110px" align="left">
                <template slot-scope="scope">
                  <span v-if="scope.row.menuType == '2'">事件模块</span>
                  <span v-if="scope.row.menuType == '1'">菜单模块</span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('table.status')" class-name="status-col" width="100">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.isEnable == 0" type="success">启用</el-tag>
                  <el-tag v-if="scope.row.isEnable == 1" type="danger">未启用</el-tag>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('table.setting')"
                align="left"
                width="430"
                class-name="small-padding fixed-width"
              >
                <template slot-scope="scope">
                  <el-button v-permission="['assets-detail']"  @click="handleDialog(scope.row,$t('table.detail'))" size="mini">{{ $t('table.detail') }}</el-button>
                  <el-button
                    v-permission="['assets-edit']"
                    type="primary"
                    size="mini"
                    @click="handleDialog(scope.row,$t('table.edit'))"
                  >{{ $t('table.edit') }}</el-button>
                  <el-button
                    v-permission="['assets-delete']"
                    size="mini"
                    type="danger"
                  >{{ $t('table.delete') }}</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container">
              <el-pagination
                v-show="total>0"
                :current-page="listQuery.page"
                :page-sizes="[10,20,30, 50]"
                :page-size="listQuery.size"
                :total="total"
                background
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>

            <!-- 弹出框 -->
            <el-dialog :title="dialogStatus" width="600px" :visible.sync="dialogFormVisible">
              <el-form
                ref="dataForm"
                :rules="rules"
                :model="formData"
                label-position="left"
                label-width="70px"
                style="width: 90%"
                :disabled="dialogStatus == $t('table.detail')"
              >
                <el-form-item>
                  <div class="block">
                    <div
                      style="float:left"
                      class="el-input-group__prepend"
                    >{{$t("table.parentAssetsName")}}</div>
                    <el-cascader
                      slot="prepend"
                      style="float:left;width:calc(100% - 150px);display: block;"
                      expand-trigger="click"
                      :options="treeData"
                      show-all-levels
                      clearable
                      :placeholder="''"
                      change-on-select
                      :props="{value:'menuId',label:'menuName',width:'200px'}"
                      v-model="formData.items"
                      @change="handleChange"
                    ></el-cascader>
                  </div>
                </el-form-item>
                <el-form-item prop="menuType">
                  <div class="el-input-group__prepend" style="float:left">{{$t("table.assetsType")}}</div>
                  <el-select
                    v-model="formData.menuType"
                    :placeholder="''"
                    class="filter-item select"
                  >
                    <el-option
                      v-for="item in menuTypeOptions"
                      :key="item.key"
                      :label="item.value"
                      :value="item.key"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item prop="menuName">
                  <el-input :style="{widht:'200px'}" class="input" v-model="formData.menuName">
                    <template slot="prepend">{{$t("table.assetsName")}}</template>
                  </el-input>
                </el-form-item>
                <el-form-item v-if="formData.menuType == 1" prop="menuUrl">
                  <el-input :style="{widht:'200px'}" class="input" v-model="formData.menuUrl">
                    <template slot="prepend">{{$t("table.assetsUrl")}}</template>
                  </el-input>
                </el-form-item>
                <el-form-item prop="isEnable">
                  <div class="el-input-group__prepend" style="float:left">{{$t("table.isEnable")}}</div>
                  <el-select
                    v-model="formData.isEnable"
                    :placeholder="''"
                    class="filter-item select"
                  >
                    <el-option
                      v-for="item in isEnable"
                      :key="item.key"
                      :label="item.value"
                      :value="item.key"
                    />
                  </el-select>
                </el-form-item>
              </el-form>
              <div slot="footer" class="dialog-footer">
                <el-button
                  v-if="dialogStatus != $t('table.detail')"
                  @click="dialogFormVisible = false"
                >{{ $t('table.cancel') }}</el-button>
                <el-button
                  v-if="dialogStatus == $t('table.add')"
                  type="primary"
                  @click="createData"
                >{{ $t('table.confirm') }}</el-button>
                <el-button
                  v-if="dialogStatus == $t('table.edit')"
                  type="primary"
                  @click="updateData"
                >{{ $t('table.confirm') }}</el-button>
              </div>
            </el-dialog>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import splitPane from "vue-splitpane";
import request from "@/utils/request";

import waves from "@/directive/waves"; // 水波纹指令
// import { parseTime } from "@/utils";
import { parser, getNode, validateEmail } from "@/utils";
import Cookies from "js-cookie";
// arr to obj ,such as { CN : "China", US : "USA" }

export default {
  data() {
    return {
      treeData: null,
      tableData: null,
      tableKey: 0,
      tableList: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        size: 10,
        menuName: ""
        // menuId: ''
      },
      isEnable: [{ key: "0", value: "启用" }, { key: "1", value: "未启用" }],
      formData: {
        menuParentId: 0
      },
      dialogFormVisible: false,
      dialogStatus: "",
      menuTypeOptions: [],
      rules: {
        menuType: [
          {
            required: true,
            message: "Please Select Resources Type",
            trigger: ["blur", "change"]
          }
        ],
        menuName: [
          {
            required: true,
            message: "Please Enter Resources Name",
            trigger: ["blur", "change"]
          },
          {
            min: 1,
            max: 30,
            message: "Please Enter 1-30 Strings",
            trigger: "change"
          }
        ],
        menuUrl: [
          {
            required: true,
            message: "Please Enter 1-30 Strings",
            trigger: ["change"]
          }
        ],
        isEnable: [
          {
            required: true,
            message: "Please Select Resource Status",
            trigger: ["blur", "change"]
          }
        ]
      }
    };
  },
  name: "assets",
  components: { splitPane },
  directives: {
    waves
  },
  watch: {
    "formData.menuType"(newd, old) {
      var vm = this;
      if (newd == 2) {
        vm.formData.menuUrl = "";
      }
    }
  },
  created() {
    this.getList();
  },
  computed: {
    // data :function(){
    //   var vm = this
    //   let a = vm.b+ vm.c
    //   return a
    // }
    // listQuery: function(){
    //   debugger
    //   if(vm.listQuery.menuId && vm.listQuery.menuId == ""){
    //     delete vm.listQuery.menuId
    //   }
    //   return vm.listQuery
    // }
  },

  methods: {
    handleNodeClick(data) {
      this.listQuery.menuId = data.menuId;
      this.listQuery.page = 1;
      this.getList();
    },
    getList() {
      var vm = this;
      vm.listLoading = true;
      request({
        url:
          vm.$store.getters.serverUrl["https://cj-sy"] + "resMode/findResList",
        data: vm.listQuery
      }).then(response => {
        vm.tableList = response.data.data;
        vm.total = response.data.count;
        vm.listLoading = false;
      });
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
    resetQuery() {
      var vm = this;
      vm.listQuery = {
        page: 1,
        size: 10,
        menuName: ""
        // sort: "+id"
      };
    },
    refresh() {
      var vm = this;
      vm.resetQuery();
      vm.getList();
    },
    // typeSwitch(value){
    //   var vm = this;
    //   value == 2 && (vm.formData.menuUrl = '')
    // },
    handleDialog(value, type) {
      var vm = this;
      vm.dialogStatus = type;
      vm.dialogFormVisible = true;
      vm.$nextTick(() => {
        vm.$refs["dataForm"].clearValidate();
      });
      if (type == this.$t("table.add")) {
        vm.formData = {
          menuParentId: 0
        };
      } else {
        let parseNode = null;
        parseNode = getNode(vm.treeData, "menuId", value.menuId);
        if (parseNode === undefined) {
          parseNode = value;
        }
        vm.formData = parseNode;
        if (vm.formData.items.length > 1) {
          vm.formData.items = vm.formData.items.slice(
            0,
            vm.formData.items.length - 1
          );
        } else {
          vm.formData.items = [];
        }
        debugger
        vm.dialogFormVisible = true;
        // vm.selectedOptionss = vm.formData.items
        vm.$nextTick(() => {
          vm.$refs["dataForm"].clearValidate();
        });
      }
    },
    createData() {
      var vm = this;
      vm.$refs["dataForm"].validate(valid => {
        if (valid) {
          if (vm.formData.menuParentId == 0 && vm.formData.menuType == 2) {
            vm.$Message({
              type: "info",
              message: "事件模块不可作为顶级资源，请选择上级资源",
              duration: 1500
            });
            return false;
          } else {
            request({
              url:
                vm.$store.getters.serverUrl["https://cj-sy"] +
                "resMode/addResManageOne",
              data: { ...vm.formData, isDelete: 0 }
            }).then(res => {
              if (res.data.msg == "请求成功") {
                vm.listQuery = {
                  page: 1,
                  size: 10,
                  menuName: ""
                  // sort: "+id"
                };
                vm.getList();
                vm.dialogFormVisible = false;
                vm.$notify({
                  title: "成功",
                  message: "创建成功",
                  type: "success",
                  duration: 2000
                });
              } else {
                return false;
              }
            });
          }
        } else {
          vm.$Message({
            type: "info",
            message: "验证未通过"
          });
        }
      });
    },
    updateData() {
      var vm = this;
      vm.$refs["dataForm"].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, vm.formData);
          initList(
            tempData,
            vm.$store.getters.serverUrl["https://cj-sy"] +
              "resMode/updResManageOne"
          ).then(res => {
            if (res.status == 200) {
              vm.dialogFormVisible = false;
              vm.$notify({
                title: "成功",
                message: "更新成功",
                type: "success",
                duration: 2000
              });
              vm.getList();
            } else {
              return false;
            }
          });
        }
      });
    },
    handleChange(value) {
      var vm = this;
      value.length > 0
        ? (vm.formData.menuParentId = value[value.length - 1])
        : (vm.formData.menuParentId = 0);
    },
    handleDelete(row) {
      this.$notify({
        title: "成功",
        message: "删除成功",
        type: "success",
        duration: 2000
      });
      const index = this.tableList.indexOf(row);
      this.tableList.splice(index, 1);
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          if (j === "timestamp") {
            return parseTime(v[j]);
          } else {
            return v[j];
          }
        })
      );
    }
  },
  mounted() {
    var vm = this;
    var a = function(url,params){
      return new Promise((resolve,reject) => {
        request({
          url: url,
          data: params
        }).then(res => {
          res.code == 200 ? resolve(res) : reject("数据错误")
        })
      })
    }
    request({
      url:
        vm.$store.getters.serverUrl["https://cj-sy"] + "menu/findManageTreeNew"
    }).then(function(res) {
      vm.treeData = res.data;
      parser(vm.treeData, "menuId", "children");
    });
    request({
      url:
        vm.$store.getters.serverUrl["https://cj-sy"] +
        "dictionary/findType?diCode=zylx"
    }).then(res => {
      vm.menuTypeOptions = [];
      res.data.forEach((item, i) => {
        let child = { key: null, value: null };
        child.key = item.split(",")[0];
        child.value = item.split(",")[1];
        vm.menuTypeOptions.push(child);
      });
    });
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
.el-input--medium .el-input__inner {
  width: 320px;
}
</style>
<style>
.el-input-group__prepend {
  border-right: 0;
  width: 150px;
  text-align: center;
}
.el-dialog__body {
  padding: 10px 0px;
}
.el-input--medium .el-input__inner {
  height: 38px;
}
.select {
  float: left;
  width: 320px;
}
/* .input {
  width: 360px;
} */
.el-dialog .el-card__header {
  padding: 15px 20px !important;
  box-shadow: 0px 2px #cccccc;
}
</style>
