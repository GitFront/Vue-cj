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
        <el-input :placeholder="$t('table.itemsText')"  clearable  prefix-icon="el-icon-search" v-model="listQuery.groupName" style="width: 220px;" class="filter-item" @keyup.enter.native="searchList">
        </el-input>
        <el-date-picker
          v-model="listQuery.date"
          style="height:39px"
          type="datetimerange"
          value-format= "yyyy-MM-dd HH:mm:ss"
          :picker-options="pickerOptions"
          :range-separator="$t('table.to')"
          :start-placeholder="$t('table.startDate')"
          :end-placeholder="$t('table.endDate')"
          @change="searchList">
        </el-date-picker>
        <el-button v-waves class="filter-item" style="margin-left:20px" type="primary" icon="el-icon-search" @click="searchList">{{ $t('table.search') }}</el-button>
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-refresh" @click="handleRefreash">{{ $t('table.refresh') }}</el-button>
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
      <el-table-column :label="$t('table.itemsName')" align="left" >
        <template slot-scope="scope">
          <span>{{ scope.row.groupName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.runningCount')" align="left">
        <template slot-scope="scope">
            <span>{{ scope.row.runningCount }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.stoppedCount')">
        <template slot-scope="scope">
            <span>{{ scope.row.stoppedCount }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.invalidCount')">
        <template slot-scope="scope">
            <span>{{ scope.row.invalidCount }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.written')">
        <template slot-scope="scope">
            <span>{{ scope.row.written }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.readed')">
        <template slot-scope="scope">
            <span>{{ scope.row.readed }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.createTime')">
        <template slot-scope="scope">
            <span>{{ scope.row.createTime }}</span>
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
    <el-dialog :title="dialogStatus" class="dialog" width="1000px" :visible.sync="dialogFormVisible" >
      <el-form  ref="dataForm"   label-position="left" label-width="35px">
        <el-form-item>
          <el-date-picker
            v-model="listNodeQuery.date"
            style="height:39px"
            type="datetimerange"
            value-format= "yyyy-MM-dd HH:mm:ss"
            :picker-options="pickerOptions"
            :range-separator="$t('table.to')"
            :start-placeholder="$t('table.startDate')"
            :end-placeholder="$t('table.endDate')">
          </el-date-picker>
          <el-button v-waves class="filter-item" style="margin-left:20px" type="primary" icon="el-icon-search" @click="searchListNode">{{ $t('table.search') }}</el-button>
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
            <el-table-column :label="$t('table.processName')" align="left" >
              <template slot-scope="scope">
                <span>{{ scope.row.processName }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.runStatus')" align="left">
              <template slot-scope="scope">
                  <el-tag type="warning" v-if="scope.row.runStatus == 'Invalid'">{{ $t('table.invalid') }}</el-tag>
                  <el-tag type="success" v-if="scope.row.runStatus == 'Running'">{{ $t('table.running') }}</el-tag>
                  <el-tag type="danger" v-if="scope.row.runStatus == 'Stopped'">{{ $t('table.stopped') }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.refreshedTime')" align="left">
              <template slot-scope="scope">
                  <span>{{ scope.row.refreshedTime }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.input')" align="left">
              <template slot-scope="scope">
                  <span>{{ scope.row.input }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.output')" align="left">
              <template slot-scope="scope">
                  <span>{{ scope.row.output }}</span>
              </template>
            </el-table-column>

             <el-table-column :label="$t('table.validationErrors')" align="left">
              <template slot-scope="scope">
                <el-tooltip placement="left-start">
                  <div slot="content" v-if="scope.row.validationErrors =='' " :style="{'width':'30px'}">空</div>
                  <div slot="content" v-if="scope.row.validationErrors !='' " :style="{'width':'300px'}">{{scope.row.validationErrors }}</div>
                  <el-button>{{  $t("table.clickMe") }}</el-button>
                </el-tooltip>              
              </template>
            </el-table-column>           
        </el-table>
        <div class="pagination-container">
          <el-pagination v-show="totalNode>0" :current-page="listNodeQuery.page" :page-sizes="[6,8,10]" :page-size="listNodeQuery.size" :total="totalNode" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleNodeSizeChange" @current-change="handleNodeCurrentChange"/>
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
  name: "logCollect",
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
      totalNode: null,
      tableListNode: null,
      listQuery: {
        page: 0,
        size: 10,
        groupName: "",
        startDate: "",
        endDate: "",
        date: []
      },
      listNodeQuery: {
        page: 0,
        size: 6,
        groupId: "",
        startDate: "",
        endDate: "",
        date: ""
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
      params.date &&
        params.date.length > 0 &&
        (params.startDate = params.date[0]) &&
        (params.endDate = params.date[1]);
      request({
        url: vm.url + "ProcessorManage/findGroupLogList",
        data: params
      }).then(res => {
        if (res.status == 200) {
          vm.tableList = res.data.data;
          vm.total = res.data.count;
          vm.listLoading = false;
        }
      });
    },
    searchListNode() {
      var vm = this;
      vm.listNodeQuery.page = 0;
      vm.getListNode();
    },
    searchList() {
      var vm = this;
      vm.listQuery.page = 0;
      vm.getList();
    },
    getListNode() {
      var vm = this;
      vm.listNodeLoading = true;
      let params = { ...vm.listNodeQuery };
      params.page != 0 && (params.page = params.page - 1);
      // params.page = params.page * params.size
      params.date &&
        params.date.length > 0 &&
        (params.startDate = params.date[0]) &&
        (params.endDate = params.date[1]);
      request({
        url: vm.url + "ProcessorManage/findProcessorLogList",
        data: params
      }).then(res => {
        if (res.status == 200) {
          vm.tableListNode = res.data.data;
          vm.totalNode = res.data.count;
          vm.listNodeLoading = false;
        }
      });
    },
    reset() {
      var vm = this;
      vm.listQuery = {
        page: 0,
        size: 10,
        groupName: "",
        startDate: "",
        endDate: "",
        date: []
      };
    },

    resetNode() {
      var vm = this;
      vm.listNodeQuery.page = 0;
      vm.listNodeQuery.size = 6;
      vm.listNodeQuery.startDate = "";
      vm.listNodeQuery.endDate = "";
      vm.listNodeQuery.date = [];
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

    handleNodeSizeChange(val) {
      this.listNodeQuery.page = 0
      this.listNodeQuery.size = val;
      this.getListNode();
    },
    handleNodeCurrentChange(val) {
      this.listNodeQuery.page = val;
      this.getListNode();
    },
    handleDialog(value, type) {
      var vm = this;
      vm.dialogStatus = type;
      vm.resetNode();
      vm.dialogFormVisible = true;
      vm.listNodeQuery.groupId = value.groupId;
      vm.getListNode();
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
