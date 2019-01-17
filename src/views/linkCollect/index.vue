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
    <el-form>
      <el-form-item>
        <el-input :placeholder="$t('table.nameText')"  clearable  prefix-icon="el-icon-search" v-model="listQuery.Name" style="width: 220px;" class="filter-item" @keyup.enter.native="getList">
        </el-input>
        <el-input :placeholder="$t('table.linkInfoText')"  clearable  prefix-icon="el-icon-search" v-model="listQuery.connectInfo" style="width: 250px;" class="filter-item" @keyup.enter.native="getList">
        </el-input>
        <el-button v-waves class="filter-item" style="margin-left:20px" type="primary" icon="el-icon-search" @click="searchList">{{ $t('table.search') }}</el-button>
        <el-button v-waves class="filter-item" style="margin-left:20px" type="primary" icon="el-icon-refresh" @click="handleRefreash">{{ $t('table.refresh') }}</el-button>
      </el-form-item>
    </el-form>
      <!-- <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('table.add') }}</el-button> -->
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="tableList"
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <el-table-column :label="$t('table.processName')" align="left" >
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.type')" align="left">
        <template slot-scope="scope">
          <el-tooltip placement="left-start">
            <div slot="content" style="width:250px">{{scope.row.type == "" ? "空":scope.row.type}}</div>
            <span class="span">{{  scope.row.type }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')">
        <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.state == 'ENABLED'">{{ $t('table.enable') }}</el-tag>
            <el-tag type="info" v-else>{{ $t('table.disabled') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.connectInfo')">
        <template slot-scope="scope">
          <el-tooltip placement="left-start">
            <div slot="content" style="width:250px">{{scope.row.connectInfo == "" ? "空":scope.row.connectInfo}}</div>
            <span class="span">{{  scope.row.connectInfo }}</span>
          </el-tooltip>        
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.validationErrors')">
        <template slot-scope="scope">
          <el-tooltip placement="left-start">
            <div slot="content" style="width:250px">{{scope.row.validationErrors == "" ? "空":scope.row.validationErrors}}</div>
            <span class="span">{{  scope.row.validationErrors }}</span>
          </el-tooltip>           
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.remark')">
        <template slot-scope="scope">
            <span>{{ scope.row.comments }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.setting')" align="left" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-waves size="mini" @click="handleDialog(scope.row,$t('table.detail'))">{{ $t('table.detail') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.size" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

  <!-- 弹出框 -->
    <el-dialog :title="dialogStatus" class="dialog" width="600px" max-height:= "500px" :visible.sync="dialogFormVisible" >
      <el-form  ref="dataForm"   label-position="left" label-width="35px">
        <el-form-item>
          <el-table
            v-loading="listNodeLoading"
            :key="tableKey"
            :data="tableListNode"
            height="400"
            border
            fit
            highlight-current-row
            style="width: calc(100% - 35px); overflow:auto">
            <el-table-column :label="$t('table.itemsName')" align="left" >
              <template slot-scope="scope">
                <span>{{ !scope.row.groupName ? "空数据": scope.row.groupName }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.processorName')" align="left">
              <template slot-scope="scope">
                  <span>{{ !scope.row.processorName ? "空数据" : scope.row.processorName}}</span>
              </template>
            </el-table-column>        
        </el-table>
        </el-form-item>
      </el-form>
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
  name: "linkCollect",
  data() {
    return {
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      url: null,
      treeData: null,
      tableKey: 0,
      tableList: null,
      total: null,
      listLoading: true,
      listNodeLoading: false,
      dialogStatus: null,
      dialogFormVisible: false,
      tableListNode: null,
      listQuery: {
        page: 0,
        size: 10,
        Name: "",
        connectInfo: ""
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
      let params = { ...vm.listQuery };
      params.page != 0 && (params.page = params.page - 1);
      // params.page = params.page * params.size
      request({
        url: vm.url + "controllerServices/findByCon",
        data: params
      }).then(res => {
        if (res.status == 200) {
          vm.tableList = res.data.data;
          vm.total = res.data.count;
          vm.listLoading = false;
        }
      });
    },
    searchList() {
      var vm = this;
      vm.listQuery.page = 0;
      vm.getList();
    },
    getListNode(params) {
      var vm = this;
      vm.listNodeLoading = true;
      request({
        url: vm.url + "controllerServices/findProAndGroByCon",
        data: {
          connectId: params
        }
      }).then(res => {
        if (res.status == 200) {
          vm.tableListNode = res.data;
          vm.listNodeLoading = false;
        }
      });
    },
    reset() {
      var vm = this;
      vm.listQuery = {
        page: 0,
        size: 10,
        Name: "",
        connectInfo: ""
      }
    },
    handleRefreash() {
      var vm = this;
      vm.reset();
      vm.getList();
    },
    handleSizeChange(val) {
      this.listQuery.page = 0
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
      vm.dialogFormVisible = true;
      vm.getListNode(value.connectId);
    }
  },
  mounted() {
    var vm = this;
    vm.url = vm.$store.getters.serverUrl["https://cj-collect"];
    vm.getList();
  }
};
</script>

<style  scoped>
.components-container {
  position: relative;
  height: 100vh;
}
.span{
  overflow:hidden; 
  text-overflow: ellipsis;
  white-space: nowrap;
  color:#409EFF;
  cursor: pointer;
}
.el-range-separator {
  padding: inherit !important;
}
.el-card__header {
  padding: 15px 0px 12px 20px !important;
}
.splitter-paneL {
  background: sienna;
}
.inputs {
  width: 350px;
  margin-left: 0px;
  margin-right: 30px;
}
</style>
<style>
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
