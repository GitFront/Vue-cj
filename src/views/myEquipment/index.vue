<template>
  <div class="components-container" >
    <el-row v-for="(items, index) in deviceData" :key="index">
      <el-col v-for="(o, index) in items" :key="index" :span="4.5"  style="margin-bottom:20px;min-width:336px">
        <el-card  :body-style="{ padding: '20px',height:'200px'}">
          <!-- <img src="~examples/assets/images/hamburger.png" class="image"> -->
          <div style="text-align:center ">
              <p class="p">名称：
                <span>{{o.deviceName}}</span>
                <el-tag type="danger" style="margin-left:10px" v-if="o.isOnline =='0'">离线</el-tag>
                <el-tag type="success" style="margin-left:10px" v-if="o.isOnline =='1'">在线</el-tag>
              </p>
              <p class="p">编码：<span>{{o.deviceCode}}</span></p>
              <p class="p">类型：<span>{{o.deviceType}}</span></p>
              <el-row style="margin-top:25px">
                <el-button size="small" type="info" @click="handleDialog(o,$t('table.detail'))"  plain>{{ $t("table.detail") }}</el-button>
                <el-button size="small" type="primary" @click="handleDialog(o,$t('table.edit'))" plain>{{ $t("table.edit") }}</el-button>
                <el-button size="small" type="danger" @click="deleteDevice(o)" plain>{{ $t("table.delete") }}</el-button>
              </el-row>       
          </div>
        </el-card>
      </el-col>
    </el-row>


      <!-- 弹出框 -->
    <el-dialog :title="dialogStatus" :width="dialogStatus == $t('table.edit')?'800PX' : '1000px'" :before-close="dialogDistory"  :visible.sync="dialogFormVisible" >
      <el-form ref="dataForm" :rules="rules" v-if ="dialogStatus == $t('table.edit')" label-width="70px" :model="formDataList">
        <el-form-item prop="deviceCode">
          <el-input class="input" v-model="formDataList.deviceCode">
            <template slot="prepend">{{$t("table.deviceCode")}}</template>
          </el-input>
        </el-form-item>
        <el-form-item prop="deviceName">
          <el-input class="input" v-model="formDataList.deviceName">
            <template slot="prepend">{{$t("table.deviceName")}}</template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-col :style="{width: dialogStatus == $t('table.add')? '10%' : '23%'}">
            <div class="el-input-group__prepend" style="border-right:1px solid #dcdfe6">{{  !formDataList.unit? $t('table.scopeMeasurement') :($t('table.scopeMeasurement')+ "(单位:" + formDataList.unit + ")")}}</div>
          </el-col>
          <el-col style="width:210px">
            <el-form-item prop="lowerLimit">
              <el-input-number v-model="formDataList.lowerLimit" controls-position="right"></el-input-number>              
            </el-form-item>
          </el-col>
          <el-col :span="1">至</el-col>
          <el-col style="padding-left:0px;width:100PX">
            <el-form-item prop="upperLimit">
              <el-input-number v-model="formDataList.upperLimit" controls-position="right"></el-input-number>              
            </el-form-item>
          </el-col>
        </el-form-item>
        
        <el-form-item prop="remark">
          <el-input  class="input" style="width:83.5%" v-model="formDataList.remark">
            <template slot="prepend">{{$t("table.remarkInfo")}}</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" v-if="dialogStatus == $t('table.edit')" class="dialog-footer">
        <el-button  @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button  type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </div>
      
      <!-- 图标eChats -->
      <div v-if="dialogStatus == $t('table.detail')" class="chart-container">
        <chart :params="deviceDetail" v-if="isShow" height="500px" width="100%"/>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/utils/request";
import waves from "@/directive/waves"; // 水波纹指令
import { arrayForGroup } from "@/utils";
import Chart from "@/components/Charts/keyboard";

export default {
  name: "MyEquipment",
  components: { Chart },
  data() {
    return {
      userId: this.$store.state.user.userId,
      websock: "",
      deviceData: [],
      dialogStatus: "",
      dialogFormVisible: false,
      formDataList: [],
      wss:
        "wss" +
        this.$store.getters.serverUrl["https://cj-device"].split("https")[1],
      url: this.$store.getters.serverUrl["https://cj-device"],
      deviceDetail: {},
      isShow: null,
      rules: {
        deviceCode: [
          {
            required: true,
            message: "Please Enter Device Code",
            trigger: "blur"
          },
          {
            min: 1,
            max: 30,
            message: "Please Enter 1-30 Strings",
            trigger: "change"
          }
        ],
        deviceName: [
          {
            required: true,
            message: "Please Enter Device Name",
            trigger: "blur"
          },
          {
            min: 1,
            max: 30,
            message: "Please Enter 1-30 Strings",
            trigger: "change"
          }
        ],
        lowerLimit: [
          {
            required: true,
            message: "Please Enter lowerLimit",
            trigger: "blur"
          }
        ],
        upperLimit: [
          {
            required: true,
            message: "Please Enter upperLimit",
            trigger: "blur"
          }
        ],
        remark: [
          {
            required: true,
            message: "Please Enter remark",
            trigger: "blur"
          },
          {
            min: 1,
            max: 30,
            message: "Please Enter 1-30 Strings",
            trigger: "change"
          }
        ]
      }
    };
  },
  mounted() {
    var vm = this;
    vm.send();
  },
  destroyed() {
    this.websock.close();
  },
  methods: {
    handleDialog(data, type) {
      var vm = this;
      vm.dialogFormVisible = true;
      vm.dialogStatus = type;
      vm.formDataList = data;
      if (type == "detail" || type == "查看") {
        let params = {
          queueName: data.queueName,
          queueIpPort: data.queueIpPort,
          deviceCode: data.deviceCode,
          upperLimit: data.upperLimit,
          lowerLimit: data.lowerLimit
        };
        vm.isShow = true;
        vm.deviceDetail = { ...params };
      }
    },

    updateData() {
      var vm = this;
      vm.$refs["dataForm"].validate(vaild => {
        if (vaild) {
          request({
            url: vm.url + "deviceDistribution/updatemydevice",
            data: vm.formDataList
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
        }else{
          vm.$Message({
            type:"info",
            message: "验证未通过"
          })
          return false
        }
      });
    },
    deleteDevice(data) {
      var vm = this;
      vm.$confirm("是否删除id为【" + data.deviceId + "】的设备", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true
      }).then(() => {
        request({
          url: vm.url + "deviceDistribution/deleteDeviceFromUser",
          data: {
            deviceId: data.deviceId,
            userId: vm.$store.state.user.userId
          }
        }).then(res => {
          if (res.status == 200) {
            vm.$notify({
              title: "成功",
              message: "成功删除",
              type: "success",
              duration: 2000
            });
          }
        });
      });
    },

    //webSocket
    send() {
      this.readyChat(this.inputText);
    },
    dialogDistory(done) {
      var vm = this;
      vm.isShow = false;
      vm.dialogFormVisible = false;
    },
    readyChat() {
      let This = this;
      if (this.websock.readyState === 1) {
        this.websocketSend();
      } else if (this.websock.readyState === 0) {
        // 表示正在连接，设置3000ms后发送信息
        setTimeout(function() {
          This.websocketSend();
        }, 3000);
      } else {
        // 连接未创建或者创建失败，则重新创建连接，并设置500ms后发送信息
        this.websochetInit();
        setTimeout(function() {
          This.websocketSend();
        }, 500);
        this.websock.onerror = function(e) {
          This.$Message({
            message: "连接WebSocket出错",
            type: "error"
          });
        };
      }
    },
    /* 初始化websochet */
    websochetInit() {
      if (this.websock == "") {
        this.websock = new WebSocket(this.wss + "deviceData-websocket");
        this.websock.onmessage = this.websocketMessage;
      }
    },
    /* websochet发送信息 */
    websocketSend() {
      this.websock.send(this.userId);
    },
    /* websochet接收服务器返回的信息 */
    websocketMessage(e) {
      if (e.data != "连接成功") {
        let deviceData = JSON.parse(e.data);
        this.deviceData = [];
        this.deviceData.push(deviceData);
        // this.deviceData = arrayForGroup(this.deviceData, 4);
      }
    }
  }
};
</script>

<style  scoped>
.components-container {
  position: relative;
  height: 100vh;
}
.dialog {
  width: 1200px;
  height: 500px;
}
.chart-container {
  position: relative;
  width: 100%;
}
.form {
  padding: 0px 25px;
}
.tabPanel {
  padding: 20px 0;
}
.deviceName {
}
.p {
  font-weight: bold;
  font-size: 14px;
  text-align: left;
  margin-left: 70px;
}
.p span {
  font-size: 14px;
  font-weight: initial;
}
.el-card {
  border-radius: 15pxs;
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

.el-input-group__prepend {
  border-right: 0;
  width: 100px;
  /* text-align: center; */
}
.m_select .is-focus {
  border: 1px;
  border-style: dotted;
}
.el-dialog__body {
  padding: 10px 0px;
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
<style>
</style>
