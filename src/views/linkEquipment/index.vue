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
        <el-input @keyup.enter.native="searchList"  v-model="listQuery.supplier" :placeholder="$t('table.nameSupplierText')"  clearable  prefix-icon="el-icon-search" style="width: 220px;" class="filter-item" >
        </el-input>
        <el-input @keyup.enter.native="searchList" v-model="listQuery.gatewayPort" :placeholder="$t('table.portNumberGatewayText')"  clearable  prefix-icon="el-icon-search"  style="width: 250px;" class="filter-item">
        </el-input>
        <el-select @change="searchList" v-model="listQuery.protocol"  style="width:270px" clearable :placeholder="$t('table.protocolsTransportText')">
          <el-option
            v-for="item in protocolItems"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-date-picker
            v-model="listQuery.date"
            style="height:39px"
            type="datetimerange"
            value-format= "yyyy-MM-dd HH:mm:ss"
            :picker-options="pickerOptions"
            :range-separator="$t('table.to')"
            :start-placeholder="$t('table.startTime')"
            :end-placeholder="$t('table.endTime')"
            @change="searchList">
        </el-date-picker>
        <el-select @change="searchList" v-model="listQuery.isOnline"  clearable :placeholder="$t('table.isOnlineText')">
          <el-option
            v-for="item in isOnlineItems"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="searchList">{{ $t('table.search') }}</el-button>
        <el-button v-waves class="filter-item" style="margin-left:20px" type="primary" icon="el-icon-plus" @click="handleDialog({},$t('table.add'))">{{ $t('table.add') }}</el-button>
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
      <el-table-column :label="$t('table.deviceCode')" align="left" >
        <template slot-scope="scope">
          <span>{{ scope.row.deviceCode }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.protocolsTransport')" align="left">
        <template slot-scope="scope">
          <span>{{scope.row.protocol == '0' ? "TCP":'UDP'}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.portNumberGateway')">
        <template slot-scope="scope">
          <span> {{ scope.row.gatewayPort }} </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.nameSupplier')">
        <template slot-scope="scope">
            <span> {{ scope.row.supplier }} </span>   
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.createTime')">
        <template slot-scope="scope">
            <span> {{ scope.row.createTime }} </span>     
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.isOnline')">
        <template slot-scope="scope">
            <el-tag type="success" v-if= "scope.row.isOnline == 1">在线</el-tag>
            <el-tag type="danger" v-if= "scope.row.isOnline == 0">离线</el-tag>
            <el-tag type="success" v-if= "!scope.row.isOnline">暂无数据</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.setting')" align="left" width="400px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button  size="mini" @click="handleDialog(scope.row,$t('table.deviceSend'))">{{ $t('table.deviceSend') }}</el-button>
          <el-button type="primary" size="mini" @click="handleDialog(scope.row,$t('table.edit'))">{{ $t('table.edit') }}</el-button>
          <el-button type="warning" size="mini" @click="handleDialog(scope.row,$t('table.clone'))">{{ $t('table.clone') }}</el-button>
          <el-button type="danger" size="mini" @click="deleteData(scope.row,$t('table.delete'))">{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination v-show="total>0" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.size" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

  <!-- 弹出框 -->
    <el-dialog  :title="dialogStatus"  class="dialog" width="1000px" :visible.sync="dialogFormVisible" >
      <el-form class="demo-ruleForm form" ref="dataForm"  :model="formDataList" :rules="rules" :disabled="dialogStatus == $t('table.deviceSend')">

        <el-tabs type="border-card" v-model="tabIndex" :stretch="true">
          <!-- 设备信息 -->
          <el-tab-pane  class="tabPanel" name="0" :label="$t('table.deviceInfo')">           
            <el-form-item>
              <el-col :span="11">
                <el-form-item prop="deviceCode">
                  <el-input  v-model="formDataList.deviceCode">
                    <template slot="prepend">{{ $t('table.deviceCode') }}</template>
                  </el-input>                 
                </el-form-item>
              </el-col>
              <el-col :span="2"></el-col>
              <el-col :span="11">
                <el-form-item prop="deviceType">
                  <el-input  v-model="formDataList.deviceType">
                    <template slot="prepend">{{ $t('table.deviceType') }}</template>
                  </el-input> 
                </el-form-item>
              </el-col>
            </el-form-item>

            <el-form-item>
              <el-col :span="11">
                <el-form-item prop="supplier">
                  <el-input  v-model="formDataList.supplier">
                    <template slot="prepend">{{ $t('table.nameSupplier') }}</template>
                  </el-input>              
                </el-form-item>
              </el-col>
              <el-col :span="2"></el-col>
              <el-col :span="11">
                <el-form-item prop="model">
                  <el-input  v-model="formDataList.model">
                    <template slot="prepend">{{ $t('table.typeAttr') }}</template>
                  </el-input>              
                </el-form-item>
              </el-col>
            </el-form-item>

            <el-form-item>
              <el-col :style="{width: dialogStatus == $t('table.add')? '10%' : '17%'}">
                <div class="el-input-group__prepend" style="border-right:1px solid #dcdfe6">{{  !formDataList.unit? $t('table.scopeMeasurement') :($t('table.scopeMeasurement')+ "(单位:" + formDataList.unit + ")")}}</div>
              </el-col>
              <el-col style="width:210px">
                <el-form-item prop="lowerLimit">
                  <el-input-number v-model="formDataList.lowerLimit" controls-position="right"></el-input-number>              
                </el-form-item>
              </el-col>
              <el-col :span="1">至</el-col>
              <el-col style="padding-left:0px;width:200px">
                <el-form-item prop="upperLimit">
                  <el-input-number v-model="formDataList.upperLimit" controls-position="right"></el-input-number>              
                </el-form-item>
              </el-col>
            </el-form-item>                          

            <el-form-item>
              <el-col :span="22">
                <el-form-item prop="description">
                  <el-input  v-model="formDataList.description">
                    <template slot="prepend">{{ $t('table.descriptionParams') }}</template>
                  </el-input>
                </el-form-item>              
              </el-col>
            </el-form-item>                                                                
          </el-tab-pane>

          <!-- 设备接入信息 -->
          <el-tab-pane name="1" :label="$t('table.deviceInfoLink')">
            <el-form-item>
              <el-col :span="11">
                <el-form-item prop="protocol">
                  <div class="el-input el-input--medium el-input-group el-input-group--prepend">
                    <div class="el-input-group__prepend">{{ $t('table.protocolsTransport') }}</div>
                    <el-select  v-model="formDataList.protocol"  class="m_select" clearable>
                      <el-option
                        v-for="item in protocolItems"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </div>
                </el-form-item>

              </el-col>
              <el-col :span="2"></el-col>
              <el-col :span="11">
                <el-form-item prop="transferType">
                  <div class="el-input el-input--medium el-input-group el-input-group--prepend">
                    <div class="el-input-group__prepend">{{ $t('table.typeTransport') }}</div>
                    <el-select  v-model="formDataList.transferType"  class="m_select" clearable>
                      <el-option
                        v-for="item in transferOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </div> 
                </el-form-item>           
              </el-col>
            </el-form-item>

            <el-form-item>
              <el-col :span="22">
              <el-form-item prop="deviceIpAddress">
                <el-input  v-model="formDataList.deviceIpAddress">
                  <template slot="prepend">{{ $t('table.ipAddress') }}</template>
                </el-input> 
              </el-form-item>             
              </el-col>
            </el-form-item>
          </el-tab-pane>

          <!-- 网关接入信息 -->
          <el-tab-pane name="2" :label="$t('table.gatewayInfoLink')">
            <el-form-item>
              <el-col :span="11">
                <el-form-item prop="gatewayIpAddress">
                  <el-input  v-model="formDataList.gatewayIpAddress">
                    <template slot="prepend">{{ $t('table.ipGateway') }}</template>
                  </el-input> 
                </el-form-item>             
              </el-col>
              <el-col :span="2"></el-col>
              <el-col :span="11">
                <el-form-item prop="gatewayPort">
                  <el-input  v-model="formDataList.gatewayPort">
                    <template slot="prepend">{{ $t('table.port') }}</template>
                  </el-input> 
                </el-form-item>
              </el-col>
            </el-form-item>
          </el-tab-pane>

          <!-- 队列接入信息 -->
          <el-tab-pane name="3" :label="$t('table.queueInfoLink')">
            <el-form-item>
              <el-col :span="11">
                <el-form-item prop="queueIpPort">
                  <el-input  v-model="formDataList.queueIpPort">
                    <template slot="prepend">{{ $t('table.queueAddress') }}</template>
                  </el-input> 
                </el-form-item>
             
              </el-col>
              <el-col :span="2"></el-col>
              <el-col :span="11">
                <el-form-item prop="queueName">
                  <el-input  v-model="formDataList.queueName">
                    <template slot="prepend">{{ $t('table.queueMessage') }}</template>
                  </el-input>  
                </el-form-item>
              </el-col>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="dialogStatus!= $t('table.deviceSend')" @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus == $t('table.edit')" type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
        <el-button v-if="dialogStatus== $t('table.clone') || dialogStatus== $t('table.add')" type="primary" @click="cloneData">{{ $t('table.confirm') }}</el-button>
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
  name: "linkEquipment",
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
      tableKey: 0,
      tabIndex: "0",
      tableList: null,
      total: null,
      listLoading: true,
      dialogStatus: null,
      dialogFormVisible: false,
      formDataList: {},
      listQuery: {
        page: 0,
        size: 10,
        supplier: "",
        gatewayPort: "",
        protocol: "", // 0--tcp 1----udp
        startTime: "",
        endTime: "",
        isOnline: "", // 0---离线 1-----在线
        isDelete: 0,
        date: []
      },
      protocolItems: [
        {
          value: "0",
          label: "TCP"
        },
        {
          value: "1",
          label: "UDP"
        }
      ],
      isOnlineItems: [
        {
          value: "0",
          label: "离线"
        },
        {
          value: "1",
          label: "在线"
        }
      ],
      transferOptions: [
        {
          value: "0",
          label: "客户端"
        },
        {
          value: "1",
          label: "服务端"
        }
      ],
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
        deviceType: [
          {
            required: true,
            message: "Please Enter Device Type",
            trigger: "blur"
          },
          {
            min: 1,
            max: 30,
            message: "Please Enter 1-30 Strings",
            trigger: "change"
          }
        ],
        supplier: [
          {
            required: true,
            message: "Please Enter Device supplier",
            trigger: "blur"
          },
          {
            min: 1,
            max: 30,
            message: "Please Enter 1-30 Strings",
            trigger: "change"
          }
        ],
        model: [
          {
            required: true,
            message: "Please Enter Device model",
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
            type: "number",
            message: "Please Enter LowerLimit",
            trigger: "blur"
          }
        ],
        upperLimit: [
          {
            required: true,
            type: "number",
            message: "Please Enter UpperLimit",
            trigger: "blur"
          }
        ],
        description: [
          {
            required: true,
            message: "Please Enter Description",
            trigger: "blur"
          },
          {
            min: 1,
            max: 50,
            message: "Please Enter 1-50 Strings",
            trigger: "change"
          }
        ],

        protocol: [
          {
            required: true,
            message: "Please Select Protocol",
            trigger: "change"
          }
        ],
        transferType: [
          {
            required: true,
            message: "Please Select Transfer Type",
            trigger: "change"
          }
        ],
        deviceIpAddress: [
          {
            required: true,
            message:
              "Please Enter Device IpAddress, example: http://192.168.32.4",
            trigger: "change",
            type: "url"
          },
          {
            min: 1,
            max: 30,
            type: "url",
            message: "Please Enter 1-30 Strings",
            trigger: "change"
          }
        ],

        gatewayIpAddress: [
          {
            required: true,
            message:
              "Please Enter Gateway IpAddress, example: http://192.168.32.4",
            trigger: "change",
            type: "url"
          },
          {
            min: 1,
            max: 30,
            type: "url",
            message: "Please Enter 1-30 Strings",
            trigger: "change"
          }
        ],
        gatewayPort: [
          {
            required: true,
            message: "Please Enter Gateway port, example: 8080",
            trigger: "change"
          },
          {
            min: 1,
            max: 10,
            message: "Please Enter 1-10 Number",
            trigger: "change"
          }
        ],
        queueIpPort: [
          {
            required: true,
            message: "Please Enter QueueIP And QueuePort ",
            trigger: "change",
            type: "url"
          },
          {
            min: 1,
            max: 30,
            message: "Please Enter 1-30 Strings",
            trigger: "change",
            type: "url"
          }
        ],
        queueName: [
          {
            required: true,
            message: "Please Enter Queue Name ",
            trigger: "change"
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
  directives: {
    waves
  },

  methods: {
    getList() {
      var vm = this;
      vm.listLoading = true;
      let params = { ...vm.listQuery };
      params.page != 0 && (params.page = params.page - 1);
      if (params.date.length > 0) {
        params.startTime = params.date[0];
        params.endTime = params.date[1];
      }
      request({
        url: vm.url + "device/findPageDevice",
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
      request({
        url: vm.url + "device/copyDevice",
        data: {
          deviceId: params
        }
      }).then(res => {
        if (res.status == 200) {
          vm.formDataList = {
            ...res.data
          };
          if (vm.dialogStatus == "clone" || vm.dialogStatus == "克隆") {
            vm.formDataList.deviceCode = "";
          }
        }
      });
    },
    reset() {
      var vm = this;
      vm.listQuery = {
        page: 0,
        size: 10,
        supplier: "",
        gatewayPort: "",
        protocol: "", // 0--tcp 1----udp
        startTime: "",
        endTime: "",
        isOnline: "", // 0---离线 1-----在线
        isDelete: 0,
        date: []
      };
    },
    handleRefreash() {
      var vm = this;
      vm.reset();
      vm.getList();
    },
    handleSizeChange(val) {
      this.listQuery.page = 0;
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
      vm.tabIndex = "0";
      vm.dialogFormVisible = true;
      if (type != "添加" && type != "Add") {
        vm.getListNode(value.deviceId);
      } else {
        vm.$nextTick(() => {
          vm.$refs["dataForm"].clearValidate();
          vm.formDataList = value;
        });
      }
    },
    cloneData() {
      var vm = this;
      vm.$refs["dataForm"].validate((valid, fileds) => {
        var vm = this;
        if (!valid || vm.formDataList.lowerLimit > vm.formDataList.upperLimit) {
          if (
            fileds.description ||
            fileds.upperLimit ||
            fileds.lowerLimit ||
            fileds.model ||
            fileds.supplier ||
            fileds.deviceType ||
            fileds.deviceCode
          ) {
            vm.tabIndex = "0";
          } else if (
            fileds.deviceIpAddress ||
            fileds.transferType ||
            fileds.protocol
          ) {
            vm.tabIndex = "1";
          } else if (fileds.gatewayPort || fileds.gatewayIpAddress) {
            vm.tabIndex = "2";
          }
          if (fileds.queueIpPort || fileds.queueName) {
            vm.tabIndex = "3";
          }
          vm.$Message({
            type: "info",
            message: "验证未通过"
          });
          return false;
        } else {
          request({
            url: vm.url + "device/add",
            data: vm.formDataList
          }).then(res => {
            if (res.status == 200) {
              vm.$notify({
                title: "成功",
                message: "新增成功",
                type: "success",
                duration: 2000
              });
              vm.dialogFormVisible = false;
              vm.reset();
              vm.getList();
            }
          });
        }
      });
    },
    updateData() {
      var vm = this;
      vm.$refs["dataForm"].validate((valid, fileds) => {
        var vm = this;
        if (!valid || vm.formDataList.lowerLimit > vm.formDataList.upperLimit) {
          if (
            fileds.description ||
            fileds.upperLimit ||
            fileds.lowerLimit ||
            fileds.model ||
            fileds.supplier ||
            fileds.deviceType ||
            fileds.deviceCode
          ) {
            vm.tabIndex = "0";
          } else if (
            fileds.deviceIpAddress ||
            fileds.transferType ||
            fileds.protocol
          ) {
            vm.tabIndex = "1";
          } else if (fileds.gatewayPort || fileds.gatewayIpAddress) {
            vm.tabIndex = "2";
          }
          if (fileds.queueIpPort || fileds.queueName) {
            vm.tabIndex = "3";
          }
          vm.$Message({
            type: "info",
            message: "验证未通过"
          });
          return false;
        } else {
          request({
            url: vm.url + "device/updataDevice",
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
              vm.reset();
              vm.getList();
            }
          });
        }
      });
    },
    deleteData(data, type) {
      var vm = this;
      vm.dialogStatus = type;
      vm.$confirm("是否删除编码为【" + data.deviceCode + "】的设备", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true
      }).then(() => {
        request({
          url: vm.url + "device/isDelete",
          data: {
            deviceId: data.deviceId
          }
        }).then(res => {
          if (res.status == 200) {
            vm.$notify({
              title: "成功",
              message: "成功删除",
              type: "success",
              duration: 2000
            });
            vm.reset();
            vm.getList();
          }
        });
      });
    }
  },
  mounted() {
    var vm = this;
    vm.url = vm.$store.getters.serverUrl["https://cj-device"];
    vm.getList();
  }
};
</script>

<style  scoped>
.components-container {
  position: relative;
  height: 100vh;
}
.form {
  padding: 0px 25px;
}
.tabPanel {
  padding: 20px 0;
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
  text-align: center;
}
.el-form-item__error {
  margin-left: 20px;
}

.m_select .is-focus {
  border: 1px;
  border-style: dotted;
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
