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
      <el-cascader slot="prepend"
          style= "float:left;width:calc(100% - 150px);display: block;"
          expand-trigger="click"
          :options="treeData"
          :placeholder="$t('table.depParentName')"
          show-all-levels
          clearable
          change-on-select
          :props="{value:'depId',label:'depName',width:'200px'}"
          v-model="listQuery.depId"
          @change="handleChange"
          >
      </el-cascader>
      <!-- <el-input :placeholder="$t('table.searchCode')" clearable  prefix-icon="el-icon-search" v-model="listQuery.diCode" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter">
      </el-input>
      <el-button v-waves class="filter-item" style="margin-left:20px" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button v-waves class="filter-item" style="margin-left:20px" type="primary" icon="el-icon-add" @click="handleDialog(null,$t('table.add'))">{{ $t('table.add') }}</el-button> -->
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
      <el-table-column :label="$t('table.loginName')" align="left" >
        <template slot-scope="scope">
          <span>{{ scope.row.loginName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.userName')" align="left">
        <template slot-scope="scope">
            <span>{{ scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.sex')">
        <template slot-scope="scope">
            <span>{{ scope.row.sex }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.depName')">
        <template slot-scope="scope">
            <span>{{ scope.row.depName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.userStatus')">
        <template slot-scope="scope">
            <span>{{ scope.row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.userType')">
        <template slot-scope="scope">
            <span>{{ scope.row.userType }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.setting')" align="left" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleDialog(scope.row,$t('table.edit'))">{{ $t('table.edit') }}</el-button>
          <el-button size="mini" @click="handleDialog(scope.row,$t('table.detail'))">{{ $t('table.detail') }}</el-button>
          <el-button size="mini" type="danger" @click="deleteData(scope.row,$t('table.delete'))">{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.size" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

  <!-- 弹出框 -->
    <!-- <el-dialog :title="dialogStatus" class="dialog" width="1000px" :visible.sync="dialogFormVisible" >
      <el-form  ref="dataForm" :rules="rules" :model="formData" label-position="left" label-width="35px">
        <el-form-item>
            <el-input class="input inputs"  :disabled="dialogStatus != 'Add' && dialogStatus != '添加'" v-model="formData.diName" placeholder="请输入">
              <template slot="prepend">
                  <span>{{ $t("table.dictionaryName") }}</span>
              </template>
            </el-input>
            <el-input class="input inputs" :disabled="dialogStatus != 'Add' && dialogStatus != '添加'" v-model="formData.diCode" placeholder="请输入">
              <template slot="prepend">
                  <span>{{ $t("table.dictionaryCode") }}</span>
              </template>
            </el-input>
            <el-button v-waves class="filter-item" v-if = "dialogStatus != 'detail' && dialogStatus !='查看'" style="margin-left:20px" type="primary" icon="el-icon-add" 
            @click="createNode">{{ $t('table.add') }}</el-button>
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
    </el-dialog> -->
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
import { parser } from "@/utils";
import Cookies from "js-cookie";

export default {
  name: "user",
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
        diCode: "",
        diName: "",
        diId: null,
        dictionarycontent: []
      },
      rawNodeData: null,
      listQuery: {
        page: 1,
        size: 10,
        depId: "",
        depName: ""
      },
      rules: {
        menuParentId: [
          {
            required: true,
            message: "menuParentId is required",
            trigger: "change"
          }
        ],
        timestamp: [
          {
            type: "date",
            required: true,
            message: "timestamp is required",
            trigger: "change"
          }
        ],
        title: [
          { required: true, message: "title is required", trigger: "blur" }
        ]
      }
    };
  },
  directives: {
    waves
  },
  methods: {
    getList() {
      var vm = this;
      vm.listLoading = true;
      request({
        url: vm.url + "user/findUserList",
        data: vm.listQuery
      }).then(res => {
        if (res.status == 200) {  
          vm.tableList = res.data.data;
          vm.total = res.data.count;
        }
        vm.listLoading = false;
      });
    },
    getTreeList() {
      var vm = this;
      request({
        url: vm.url + "menu/findDepTree",
        data: {
          cid: -999375261
        }
      }).then(res => {
        if (res.status == 200) {
          vm.treeData = res.data;
          parser(vm.treeData, "depId", "children");
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
    handleChange() {
      var vm = this;
      vm.listQuery.depId = vm.listQuery.depId[vm.listQuery.depId.length - 1];
      vm.getList();
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
      } else {
        vm.getListNode();
      }
    },
    createData() {
      var vm = this;
      vm.listLoading = true;
      let _req = JSON.stringify({
        diId: vm.formData.diId,
        diName: vm.formData.diName,
        diCode: vm.formData.diCode,
        dictionarycontent: vm.rawNodeData
      });
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
    },
    deleteData(data, type) {
      var vm = this;
      vm.dialogStatus = type;
      vm.$confirm("是否删除名称为【" + data.diName + "】的字典吗", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true
      })
        .then(() => {
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
        })
        .catch(() => {
          vm.$notify({
            title: "取消",
            message: "删除操作已终止",
            type: "warning",
            duration: 2000
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
      request({
        url: vm.url + "dictionary/udpDictionaryCont",
        data: {
          array: _req
        }
      }).then(res => {
        if (res.status == 200) {
          vm.$notify({
            title: "成功",
            message: "修改成功",
            type: "success",
            duration: 2000
          });
          vm.dialogFormVisible = false;
        }
      });
    }
  },
  mounted() {
    var vm = this;
    vm.url = vm.$store.getters.serverUrl["https://cj-sy"];
    vm.getList();
    vm.getTreeList();
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
  width: 250px;
  margin-left: 0px;
  margin-right: 30px;
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
/* .select {
  width: 260px;
  float: left;
}
.input {
  width: 360px;
} */
.el-dialog .el-card__header {
  padding: 15px 20px !important;
  box-shadow: 0px 2px #cccccc;
}
</style>
