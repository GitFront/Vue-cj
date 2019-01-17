<template>
  <div class='dashboard-editor-container'>
    <panel-group :deviceCount ="device"/>
    <el-row style='background:#fff;padding:16px 16px 0;margin-bottom:32px;'>
        <bar-chart  v-if="device.subCount > 0" :echartData = "device"/>
        <div v-else style="text-align:center;line-height:200px;color:#909399">暂无数据.......</div>
    </el-row>
</div>
</template>

<script>
import PanelGroup from "./components/PanelGroup";
import BarChart from "./components/BarChart";
import request from "@/utils/request";
import Cookies from "js-cookie";
import store from "@/store";

export default {
  name: "DashboardAdmin",
  components: {
    PanelGroup,
    BarChart
  },
  data() {
    return {
      device: {
        subCount: null, //设备总数目（包括在线、离线的设备）
        offlineSub: null, //在线的设备总数目
        onlineSub: null, //离线的设备总数目
        deviceOnline: [], //在线设备的集合
        deviceOffline: [], //离线设备的集合
        deviceType: [], //设备类型的数组集合
        originalData: null //设备的原始数据
      }
    };
  },
  mounted() {
    var vm = this;
    request({
      url:
        vm.$store.getters.serverUrl["https://cj-sy"] +
        // vm.$store.getters.serverUrl["https://cj-sy"] +
        "userLogin/selectDeviceOnline",
      data: {
        userId: vm.$store.state.user.userId
      }
    }).then(function(res) {
      if (typeof res.data == "string") {
        return false;
      }
      for (var i = 0; i < res.data.data.length; i++) {
        vm.device.subCount +=
          res.data.data[i].offline + res.data.data[i].online;
        vm.device.offlineSub += res.data.data[i].offline;
        vm.device.onlineSub += res.data.data[i].online;
        res.data.data[i].subline =
          res.data.data[i].online + res.data.data[i].offline;
        vm.device.deviceOnline.push(res.data.data[i].online);
        vm.device.deviceOffline.push(res.data.data[i].offline);
        vm.device.deviceType.push(res.data.data[i].type);
      }
      res.data.data = res.data.data.sort(function(a, b) {
        return b.subline - a.subline;
      });
      vm.device.originalData = res.data.data;
      vm.device = { ...vm.device };
    });
  },
  methods: {}
};
</script>

<style rel='stylesheet/scss' lang='scss' scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}
</style>
