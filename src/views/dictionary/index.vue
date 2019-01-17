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
      <el-input :placeholder="$t('table.searchName')" clearable  prefix-icon="el-icon-search" v-model="listQuery.diName" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter">
      </el-input>
      <el-input :placeholder="$t('table.searchCode')" clearable  prefix-icon="el-icon-search" v-model="listQuery.diCode" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter">
      </el-input>
      <el-button v-waves class="filter-item" style="margin-left:20px" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button v-waves v-permission="['dictionary-create']"  class="filter-item" style="margin-left:20px" type="primary" icon="el-icon-plus" @click="handleDialog(null,$t('table.add'))">{{ $t('table.add') }}</el-button>
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
      <el-table-column :label="$t('table.dictionaryName')" align="left" >
        <template slot-scope="scope">
          <span>{{ scope.row.diName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.dictionaryCode')" align="left">
        <template slot-scope="scope">
            <span>{{ scope.row.diCode }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.createDate')">
        <template slot-scope="scope">
            <span>{{ scope.row.diCreate }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.setting')" align="left" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-permission="['dictionary-detail']" size="mini" @click="handleDialog(scope.row,$t('table.detail'))">{{ $t('table.detail') }}</el-button>
          <el-button v-permission="['dictionary-edit']" type="primary" size="mini" @click="handleDialog(scope.row,$t('table.edit'))">{{ $t('table.edit') }}</el-button>
          <el-button v-permission="['dictionary-delete']" size="mini" type="danger" @click="deleteData(scope.row,$t('table.delete'))">{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.size" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

  <!-- 弹出框 -->
    <el-dialog :title="dialogStatus" class="dialog" width="1000px" :visible.sync="dialogFormVisible" >
      <el-form  ref="dataForm" :rules="rules" :model="formData" label-position="left" label-width="35px">
        <el-form-item>
          <el-col style="width:310px">
            <el-form-item prop="diName">
              <el-input class="input inputs"  :disabled="dialogStatus != $t('table.add')" v-model="formData.diName">
                <template slot="prepend">
                    <span>{{ $t("table.dictionaryName") }}</span>
                </template>
              </el-input>              
            </el-form-item>
          </el-col>
          <el-col :span="1"></el-col>
          <el-col style="width:310px">
            <el-form-item prop="diCode">
              <el-input  class="input inputs" :disabled="dialogStatus != $t('table.add')" v-model="formData.diCode">
                <template slot="prepend">
                    <span>{{ $t("table.dictionaryCode") }}</span>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col style="width:200px;margin-top:3px">
            <el-button v-waves  v-if = "dialogStatus != $t('table.detail')" style="margin-left:20px" type="primary" icon="el-icon-plus" 
            @click="createNode">{{ $t('table.add') }}</el-button>
          </el-col>
        </el-form-item>

        <el-form-item>
          <el-table
            v-loading="listNodeLoading"
            :key="tableKey"
            :data="tableListNode"
            border
            fit
            highlight-current-row
            style="width: calc(100% - 35px)">
            <el-table-column label="序号" type="index" show-overflow-tooltip width="50"></el-table-column>
            <el-table-column :label="$t('table.dictionaryName')" align="left" >
              <template slot-scope="scope">
                <span v-if="scope.row.isEdit" class="cell-edit-input"><el-input v-model="scope.row.dcName" placeholder="请输入内容"></el-input></span>
                <span v-else>{{ scope.row.dcName }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.dictionaryCode')" align="left">
              <template slot-scope="scope">
                  <span v-if="scope.row.isEdit" class="cell-edit-input"><el-input v-model="scope.row.dcCode" placeholder="请输入内容"></el-input></span>
                  <span v-else>{{ scope.row.dcCode }}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="dialogStatus == 'detail' || dialogStatus =='查看'" :label="$t('table.createDate')">
              <template slot-scope="scope">
                  <span v-if="scope.row.isEdit" class="cell-edit-input"><el-input v-model="scope.row.dcCreate" placeholder="请输入内容"></el-input></span>
                  <span v-else>{{ scope.row.dcCreate }}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="dialogStatus != 'detail' && dialogStatus !='查看'" :label="$t('table.setting')" align="left" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button type="primary" v-if="!scope.row.isEdit" size="mini" @click="switchEdit(scope)">{{ $t('table.edit') }}</el-button>
                <el-button type="success" icon="el-icon-check" v-else size="mini" @click="saveNode(scope)">{{ $t('table.locked') }}</el-button>
                <!-- <el-button size="mini" @click="handleDialog(scope.row,$t('table.detail'))">{{ $t('table.detail') }}</el-button>
                <el-button size="mini" type="danger" @click="deleteData(scope.row,$t('table.delete'))">{{ $t('table.delete') }}</el-button> -->
              </template>
            </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination v-show="totalNode>0" :current-page="listNodeQuery.page" :page-sizes="[4,5,6]" :page-size="listNodeQuery.size" :total="totalNode" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleNodeSizeChange" @current-change="handleNodeCurrentChange"/>
        </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="dialogStatus!='detail' && dialogStatus != '查看'" @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='Edit' || dialogStatus == '编辑'" type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
        <el-button v-if="dialogStatus=='Add' || dialogStatus == '添加'" type="primary" @click="createData">{{ $t('table.confirm') }}</el-button>
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
import { parseTime, arrayForGroup } from "@/utils";
import Cookies from "js-cookie";

export default {
  name: "dictionary",
  data() {
    return {
      url: null,
      treeData: null,
      tableKey: 0,
      tableList: null,
      total: null,
      listLoading: true,
      listNodeLoading: false,
      dialogStatus: null,
      dialogFormVisible: false,
      formData: {
        diCode: "",
        diName: "",
        diId: null,
        dictionarycontent: []
      },
      rawNodeData: null,
      totalNode: null,
      tableListNode: null,
      roleNode: [],
      roleList: [],
      listQuery: {
        page: 0,
        size: 10,
        diName: "",
        diCode: ""
      },
      listNodeQuery: {
        page: 1,
        size: 4
      },
      rules: {
        diCode: [
          {
            required: true,
            message: "Please Enter Dicitonary  Code",
            trigger: "blur"
          },
          {
            min: 1,
            max: 30,
            trigger: "change",
            message: "Please Enter 1-30 Strings"
          }
        ],
        diName: [
          {
            required: true,
            message: "Please Enter Dicitonary  Code",
            trigger: "blur"
          },
          {
            min: 1,
            max: 30,
            trigger: "change",
            message: "Please Enter 1-30 Strings"
          }
        ]
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
          "dictionary/findDictionaryList?page=" +
          vm.listQuery.page +
          "&size=" +
          vm.listQuery.size +
          "&diName=" +
          vm.listQuery.diName +
          "&diCode=" +
          vm.listQuery.diCode
      }).then(res => {
        if (res.status == 200) {
          res.data.data = res.data.data.map((item, i) => {
            item.diCreate = parseTime(item.diCreate);
            return item;
          });
          vm.tableList = res.data.data;
          vm.total = res.data.count;
          vm.listLoading = false;
        }
      });
    },
    getListNode() {
      var vm = this;
      vm.listNodeLoading = true;
      request({
        url:
          vm.url +
          "dictionary/selectDictionaryContList?diCode=" +
          vm.formData.diCode
      }).then(res => {
        if (res.status == 200) {
          res.data = res.data.map((item, i) => {
            item.dcCreate = parseTime(item.dcCreate);
            item.isEdit = false;
            return item;
          });
          vm.rawNodeData = res.data;
          vm.tableListNode = arrayForGroup(
            vm.rawNodeData,
            vm.listNodeQuery.size
          )[vm.listNodeQuery.page - 1];
          vm.totalNode = vm.rawNodeData.length;
          vm.listNodeLoading = false;
        }
      });
    },
    reset() {
      var vm = this;
      vm.formData = {
        diCode: "",
        diName: "",
        diId: "",
        dictionarycontent: []
      };
    },
    createNode() {
      var vm = this;
      vm.rawNodeData.unshift({
        dcCode: "",
        dcName: "",
        isEdit: true
      });
      vm.tableListNode = arrayForGroup(vm.rawNodeData, vm.listNodeQuery.size)[
        vm.listNodeQuery.page - 1
      ];
      vm.totalNode = vm.rawNodeData.length;
    },
    saveNode(value) {
      var vm = this;
      value.row.isEdit = false;
    },
    switchEdit(value) {
      var vm = this;
      value.row.isEdit = true;
    },
    handleFilter() {
      this.listQuery.page = 0;
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.size = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val - 1;
      this.getList();
    },
    handleNodeSizeChange(val) {
      var vm = this;
      vm.listNodeLoading = true;
      vm.listNodeQuery.size = val;
      vm.tableListNode = arrayForGroup(vm.rawNodeData, vm.listNodeQuery.size)[
        vm.listNodeQuery.page - 1
      ];
      vm.listNodeLoading = false;
    },
    handleNodeCurrentChange(val) {
      var vm = this;
      vm.listNodeLoading = true;
      vm.listNodeQuery.page = val;
      vm.tableListNode = arrayForGroup(vm.rawNodeData, vm.listNodeQuery.size)[
        vm.listNodeQuery.page - 1
      ];
      vm.listNodeLoading = false;
    },
    handleDialog(value, type) {
      var vm = this;
      vm.dialogStatus = type;
      vm.reset();
      if (value != null) {
        vm.formData.diCode = value.diCode;
        vm.formData.diName = value.diName;
        vm.formData.diId = value.diId;
      }
      vm.dialogFormVisible = true;
      if (type == "Add" || type == "添加") {
        vm.tableListNode = [];
        vm.totalNode = 0;
        vm.rawNodeData = [];
        vm.$nextTick(() => {
          vm.$refs["dataForm"].clearValidate();
        });
      } else {
        vm.getListNode();
      }
    },
    createData() {
      var vm = this;
      let _req = JSON.stringify({
        diId: vm.formData.diId,
        diName: vm.formData.diName,
        diCode: vm.formData.diCode,
        dictionarycontent: vm.rawNodeData
      });
      vm.$refs["dataForm"].validate(valid => {
        if (valid) {
          let isT = isTrue(vm.rawNodeData);
          if (isT == "isEdit") {
            vm.$Message({
              type: "info",
              message: "存在表格项未锁定,请先锁定所有表格项",
              duration: 3000
            });
            return false;
          } else if (isT == "vaild") {
            vm.$Message({
              type: "info",
              message: "表格中字典编码、字典名称应输入1-30位字符串",
              duration: 3000
            });
            return false;
          }
          request({
            url: vm.url + "dictionary/addDictionary",
            data: {
              array: _req
            }
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
        }
      });
    },
    deleteData(data, type) {
      var vm = this;
      vm.dialogStatus = type;
      vm.$confirm("是否删除名称为【" + data.diName + "】的字典吗", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true
      }).then(() => {
        vm.listLoading = true;
        request({
          url: vm.url + "dictionary/delDictionary?diId=" + data.diId
        }).then(res => {
          if (res.status == 200) {
            vm.$notify({
              title: "成功",
              message: "成功删除",
              type: "success",
              duration: 2000,
              onClose: function() {
                vm.getList();
              }
            });
          }
        });
      });
    },

    updateData() {
      var vm = this;
      let _req = JSON.stringify({
        diId: vm.formData.diId,
        diName: vm.formData.diName,
        diCode: vm.formData.diCode,
        dictionarycontent: vm.rawNodeData
      });
      vm.$refs["dataForm"].validate(valid => {
        if (valid) {
          let isT = vm.rawNodeData.findIndex(item => {
            return item.isEdit == true
          })
          if(isT >= 0 ){
            vm.$Message({
              type: "info",
              message: "存在表格项未锁定,请先锁定所有表格项",
              duration: 3000
            });
            return false;
          } else if(vm.rawNodeData.findIndex(item => {
            return item.dcCode == "" || item.dcCode.length > 30 || item.dcName == "" || item.dcName.length > 30
          }) >= 0) {
            vm.$Message({
              type: "info",
              message: "表格中字典编码、字典名称应输入1-30位字符串",
              duration: 3000
            });
            return false;
          }
          request({
            url: vm.url + "dictionary/udpDictionaryCont",
            data: {
              array: _req
            }
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
        }
      });


      // var vm = this;
      // let _req = JSON.stringify({
      //   diId: vm.formData.diId,
      //   diName: vm.formData.diName,
      //   diCode: vm.formData.diCode,
      //   dictionarycontent: vm.rawNodeData
      // });

      // request({
      //   url: vm.url + "dictionary/udpDictionaryCont",
      //   data: {
      //     array: _req
      //   }
      // }).then(res => {
      //   if (res.status == 200) {
      //     vm.$notify({
      //       title: "成功",
      //       message: "修改成功",
      //       type: "success",
      //       duration: 2000
      //     });
      //     vm.dialogFormVisible = false;
      //   }
      // });
    }
  },
  mounted() {
    var vm = this;
    vm.url = vm.$store.getters.serverUrl["https://cj-sy"];
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
.inputs {
  width: 280px;
  margin-left: 0px;
  margin-right: 80px;
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
