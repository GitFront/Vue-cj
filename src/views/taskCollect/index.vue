<template>
  <div class="components-container">
    <el-form>
      <el-form-item>
        <el-radio-group v-waves style="float:left" @change="handleRadio" v-model="radioValue">
          <el-radio-button :label="switchRadioItem[0]"></el-radio-button>
          <el-radio-button :label="switchRadioItem[1]"></el-radio-button>
        </el-radio-group>
        <el-select v-model="listQuery.runStatus" style="margin-left:50px" @change="initTableTree" clearable :placeholder="$t('table.selectStatusText')">
          <el-option
            v-for="item in options" 
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-input v-model="listQuery.groupRemarks" style="width:210px" @keyup.enter.native="initTableTree" :placeholder="$t('table.markinfoText')"></el-input>
        <el-input v-model="listQuery.groupName" style="width:210px"  @keyup.enter.native="initTableTree" :placeholder="$t('table.itemsText')"></el-input>
        <el-button v-waves class="filter-item" style="margin-left:20px" type="primary" icon="el-icon-search" @click="initTableTree">{{ $t('table.search') }}</el-button>
        <el-button v-waves type="primary" @click="handleRefresh" style="margin-left:20px" icon="el-icon-refresh">{{ $t('table.refresh') }}</el-button>
      </el-form-item>
    </el-form>

    <tree-table v-loading="listLoading" style="margin-top: 25px;" :data="data" :eval-func="func" :eval-args="args" :expand-all="expandAll" border>
      <el-table-column :label="$t('table.itemsName')" >
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.markInfo')">
        <template slot-scope="scope">
            {{ scope.row.remark }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.Type')">
        <template slot-scope="scope">
            {{ scope.row.type}}
        </template>
      </el-table-column>  
      <el-table-column :label="$t('table.period')">
        <template slot-scope="scope">
            <span v-text="scope.row.runCycle"></span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.status')">
        <template slot-scope="scope">
            <el-tag v-if="scope.row.runStatus =='Running'" type="success">{{ $t("table.running") }}</el-tag>
            <el-tag v-if="scope.row.runStatus =='Stopped'" type="danger">{{ $t("table.stopped") }}</el-tag>
            <el-tag v-if="scope.row.runStatus =='Invalid'" type="info">{{ $t("table.invalid") }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.setting')">
        <template slot-scope="scope"> 
          <el-button type="success" v-permission="['taskCollect-isRunning']" @click="switchStatus(scope.row)" v-if="scope.row.runStatus =='Stopped'" style="width:90px" size="mini">{{ $t("table.running") }}</el-button>
          <el-button type="danger"  v-permission="['taskCollect-isRunning']" @click="switchStatus(scope.row)" v-if="scope.row.runStatus =='Running'" style="width:90px"  size="mini">{{ $t("table.stopped") }}</el-button>
          <el-button type="info" v-permission="['taskCollect-isRunning']" v-if="scope.row.runStatus =='Invalid'" disabled style="width:90px" size="mini">{{ $t("table.invalid") }}</el-button>
        </template>
      </el-table-column>
    </tree-table>
  </div>
</template>

<style>
.el-transfer {
  text-align: center;
}
.blocks {
  width: 397px;
}
.el-transfer-panel {
  text-align: left;
}
</style>

<script>
import treeTable from "@/components/TreeTable";
import treeToArray from "./customEval";
import request from "@/utils/request";
import { parserTree, getNode, parser } from "@/utils";
import Cookies from "js-cookie";
import waves from "@/directive/waves"; // 水波纹指令
export default {
  name: "taskCollect",
  components: { treeTable },
  data() {
    return {
      url: null,
      radioValue: "",
      func: treeToArray,
      expandAll: false,
      switchRadio: {
        zh: ["展开", "收起"],
        en: ["exprand", "contract"]
      },
      language: this.$store.getters.language,
      switchRadioItem: [],
      data: [],
      args: [null, null, null],
      listLoading: true,
      options: [
        {
          value: "Running",
          label: "在线"
        },
        {
          value: "Stopped",
          label: "离线"
        },
        {
          value: "Invalid",
          label: "无效"
        }
      ],
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
        ],
      },
      listQuery: {
        runStatus: "",
        groupRemarks: "",
        processRemarks: "",
        groupName: ""
      }
    };
  },
  directives:{
    waves
  },
  computed: {
    listenLan() {
      return this.$store.getters.language;
    },
    processRemarks() {
      return this.listQuery.groupRemarks;
    }
  },
  watch: {
    listenLan: function(old, newd) {
      var vm = this;
      vm.language = old;
      vm.switchRadioItem = vm.switchRadio[vm.language];
    },
    processRemarks(newd, old) {
      var vm = this;
      vm.listQuery.processRemarks = newd;
    }
  },
  mounted() {
    var vm = this;
    vm.url = vm.$store.getters.serverUrl["https://cj-collect"];
    vm.switchRadioItem = vm.switchRadio[vm.language];
    vm.reset();
    vm.initTableTree();
  },
  methods: {
    // ---------------------------------------------------------------------------
    handleRadio() {
      var vm = this;
      if (vm.radioValue != "展开" && vm.radioValue != "exprand") {
        vm.expandAll = false;
      } else {
        vm.expandAll = true;
      }
      vm.initTableTree();
    },
    switchStatus(data){
      var vm = this;
      let status = "";
      if(data.runStatus == "Running"){
        status = "Stopped";
      }else{
        status = "Running";
      }
      request({
        url: vm.url + "ProcessorManage/updatestate",
        data:{
          runStatus: status,
          processorId: data.id
        }
      }).then(res => {
        if(res.status == 200){
          vm.$notify({
            title: "状态",
            type: "success",
            message: "状态已更改",
            duration: 2000
          });
          vm.reset();
          vm.initTableTree();
        }
      })
    },
    initTableTree() {
      var vm = this;
      vm.listLoading = true;
      request({
        url: vm.url + "ProcessorManage/findByProCon",
        data: vm.listQuery
      }).then(res => {
        if (res.status == 200)
          res.data.data.forEach(item => {
            if (item.runCycle)
              item.runCycle =
                "每隔" + item.runCycle.split(" ")[0] + "秒执行一次";
          });
        vm.data = parserTree(res.data.data, "id", "d_pid");
        parser(vm.data, "id", "children");
        vm.listLoading = false;
      });
    },

    reset() {
      var vm = this;
      vm.listQuery = {
        runStatus: "",
        groupRemarks: "",
        processRemarks: "",
        groupName: ""
      };
    },
    handleRefresh() {
      var vm = this;
      vm.reset();
      vm.initTableTree();
    }
    // ---------------------------------------------------------------------------
  }
};
</script>
