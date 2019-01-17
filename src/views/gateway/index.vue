<template>
  <div class="app-container">
    <el-radio-group  @change="handleRadio" v-model="radioValue">
      <el-radio-button label="展开"></el-radio-button>
      <el-radio-button label="收起"></el-radio-button>
    </el-radio-group>
    <tree-table v-loading="listLoading" style="margin-top: 25px" :data="data" :eval-func="func" :eval-args="args" :expand-all="expandAll" border>
      
      <el-table-column :label="$t('table.gatewayName')">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.gatewayIP')">
        <template slot-scope="scope">
            {{ scope.row.IP}}
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.getewayMark')">
        <template slot-scope="scope">
          {{ scope.row.serverRemarks }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.getewaySend')">
        <template slot-scope="scope">
            {{ !scope.row.send ? "": scope.row.send}}
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.gatewayRXD')">
        <template slot-scope="scope">
            {{ !scope.row.rxd ? "": scope.row.rxd}}
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.gatewayPT')">
        <template slot-scope="scope">
            {{ !scope.row.gatewayPT ? "": scope.row.gatewayPT}}
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.gatewayStatus')">
        <template slot-scope="scope">
            {{ !scope.row.status ? "": scope.row.status}}
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.gatewayTime')">
        <template slot-scope="scope">
            {{ !scope.row.time ? "": scope.row.time}}
        </template>
      </el-table-column>

    </tree-table>
  </div>
</template>

<style>
.el-transfer{
  text-align: center
}
.el-transfer-panel{
  text-align: left
}
</style>

<script>
import treeTable from "@/components/TreeTable";
import treeToArray from "./customEval";
import request from "@/utils/request";
import { parserTree, getNode, parser } from "@/utils";

export default {
  name: "gateway",
  components: { treeTable },
  data() {
    return {
      url: null,
      radioValue: "收起",
      func: treeToArray,
      expandAll: false,
      data: [],
      args: [null, null, null],
      listLoading: true,
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
      },
      submitData: {
        depPath: [],
        depName: "",
        parentId: 0,
        depId: null,
        isDelete: 0,
        depParentName: ""
      }
    };
  },
  mounted() {
    var vm = this;
    vm.reset();
    vm.url =  vm.$store.getters.serverUrl["https://cj-log"];
    vm.initTableTree();
  },
  methods: {
    // ---------------------------------------------------------------------------
    message(row) {},

    handleRadio() {
      var vm = this;
      if (vm.radioValue == "展开") {
        vm.expandAll = true;
      } else {
        vm.expandAll = false;
      }
      vm.initTableTree();
    },

    initTableTree() {
      var vm = this;
      vm.listLoading = true;
      vm.reset();
      request({
        url: vm.url + "KafkaLog/findLogList"
      }).then(res => {
        if(res.status == 200)
        vm.data = parserTree(res.data.data, "id", "pid");
        // parser(vm.data, "depId", "children");
        vm.listLoading = false;
      });
    },
    reset() {
      var vm = this;
      vm.submitData = {
        depPath: [],
        depName: "",
        parentId: 0,  
        depId: null,
        isDelete: 0,
        depParentName: ""
      };
    }
    // ---------------------------------------------------------------------------
  }
};
</script>
