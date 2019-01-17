<template>
  <div class="components-container">
    <el-radio-group style="float:left" @change="handleRadio" v-model="radioValue">
      <el-radio-button :label="switchRadioItem[0]"></el-radio-button>
      <el-radio-button :label="switchRadioItem[1]"></el-radio-button>
    </el-radio-group>
    <el-button v-permission="['company-create']" icon="el-icon-plus" @click="handleDialog(null,$t('table.add'))" type="primary">{{  $t('table.add') }}</el-button>
    <tree-table v-loading="listLoading" style="margin-top: 25px" :data="data" :eval-func="func" :eval-args="args" :expand-all="expandAll" border>
      <el-table-column :label="$t('table.depNameTree')">
        <template slot-scope="scope">
          {{ scope.row.depName }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.depParentName')">
        <template slot-scope="scope">
            <el-tag type="success">{{ !scope.row.depParentName ? "顶级部门": scope.row.depParentName}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.setting')" width="400">
        <template slot-scope="scope">   
          <el-button v-permission="['company-detail']" size="mini" @click="handleDialog(scope.row,$t('table.detail'))" >{{ $t('table.detail') }}</el-button>
          <el-button v-permission="['company-edit']" type="primary"  @click="handleDialog(scope.row,$t('table.edit'))"   size="mini">{{ $t('table.edit') }}</el-button>
          <el-button v-permission="['company-permission']" size="mini" @click="handleDialog(scope.row,$t('table.auth'))"  type="warning">{{ $t('table.auth') }}</el-button>        
          <el-button v-permission="['company-delete']" size="mini" @click="handleDelete(scope.row.depId,scope.row.depName,$t('table.delete'))" type="danger">{{ $t('table.delete') }}</el-button>        
        </template>
      </el-table-column>
    </tree-table>

    <el-dialog :title="dialogStatus"  class="dialog" :width="dialogStatus == 'authorization' || dialogStatus == '授权'  ? '700px' : '500px'" :visible.sync="dialogFormVisible" >
      <el-form v-if= "dialogStatus != 'authorization' &&  dialogStatus != '授权'" ref="submitData" :rules="rules" :model="submitData" label-position="left" label-width="35px">
        <el-form-item>
          <div class="block blocks">
            <div class="el-input-group__prepend">{{ $t('table.depParentName') }}</div>
            <el-cascader slot="prepend"
                style= "display:table-cell;width:300px"
                expand-trigger="click"
                :options="data"
                :placeholder="$t('table.depParentText')"
                show-all-levels
                clearable
                :disabled="dialogStatus == 'detail' || dialogStatus == '查看'"
                change-on-select
                :props="{value:'depId',label:'depName',width:'300px'}"
                v-model="submitData.depPath"
                @change="handleChange">
            </el-cascader>
          </div> 
        </el-form-item>
        <el-form-item prop="depName">
          <el-input class="input" style= "width:397px"  :disabled="dialogStatus == 'detail' || dialogStatus == '查看'" v-model="submitData.depName" :placeholder="$t('table.depNameText')">
            <template slot="prepend">{{ $t('table.depName') }}</template>
          </el-input>
        </el-form-item>
      </el-form>
      <el-transfer class="transfer" :titles="[$t('table.permission'), $t('table.permissioned')]" :props="{ key: 'code',label: 'value' }"  :left-default-checked = []  v-if="dialogStatus == 'authorization' ||  dialogStatus == '授权'" v-model="roleNode" :data="roleList"></el-transfer>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="dialogStatus!='detail' && dialogStatus != '查看'" @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='Add' || dialogStatus == '添加'" type="primary" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-if="dialogStatus=='Edit' || dialogStatus == '编辑'" type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
        <el-button v-if="dialogStatus=='authorization' || dialogStatus == '授权'" type="primary" @click="setRole">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
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

export default {
  name: "company",
  components: { treeTable },
  data() {
    return {
      url: null,
      roleNode: [],
      roleList: [],
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
      dialogStatus: null,
      dialogFormVisible: false,
      rules: {
        depName: [
          {
            required: true,
            message: "Please Enter Departmenrt Name",
            trigger: "blur"
          },
          {
            min: 1,
            max: 30,
            message: "Please Enter 1-30 Strings",
            trigger: "change"
          }
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
  computed: {
    listenLan() {
      return this.$store.getters.language;
    }
  },
  watch: {
    listenLan: function(old, newd) {
      console.log(old);
      var vm = this;
      vm.language = old;
      vm.switchRadioItem = vm.switchRadio[vm.language];
    }
  },
  mounted() {
    var vm = this;
    vm.reset();
    vm.url = vm.$store.getters.serverUrl["https://cj-sy"];
    vm.switchRadioItem = vm.switchRadio[vm.language];
    vm.initTableTree();
  },
  methods: {
    // ---------------------------------------------------------------------------
    message(row) {},

    handleRadio() {
      var vm = this;
      if (vm.radioValue != "展开" && vm.radioValue != "exprand") {
        vm.expandAll = false;
      } else {
        vm.expandAll = true;
      }
      vm.initTableTree();
    },

    initTableTree() {
      var vm = this;
      vm.listLoading = true;
      vm.reset();
      request({
        url: vm.url + "demp/findByDepRolelast"
      }).then(res => {
        vm.data = parserTree(res.data.data, "depId", "parentId");
        parser(vm.data, "depId", "children");
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
    },
    setRole() {
      var vm = this;
      request({
        url:
          vm.url +
          "demp/addDepImpowerRole?roleDepId=" +
          vm.roleNode.toString() +
          "&depId=" +
          vm.submitData.depId
      }).then(res => {
        if (res.data.msg != "") {
          vm.$notify({
            title: "成功",
            message: "授权成功",
            type: "success",
            duration: 2000
          });
          vm.dialogFormVisible = false;
        }
      });
    },
    handleDialog(value, type) {
      var vm = this;
      vm.dialogStatus = type;
      vm.reset();
      if (type == "Add" || type == "添加") {
        vm.$nextTick(() => {
          vm.$refs["dataForm"].clearValidate();
        });
      } else if (
        type == "Edit" ||
        type == "编辑" ||
        type == "detail" ||
        type == "查看"
      ) {
        if (value.depName && value.depParentName) {
          vm.submitData.depPath = value.items;
        } else {
          vm.submitData.depPath = [];
        }
        vm.submitData.depName = value.depName;
        vm.submitData.depId = value.depId;
        vm.submitData.parentId = value.parentId;
      } else if (type == "authorization" || type == "授权") {
        vm.reset();
        vm.submitData.depId = value.depId;
        vm.getRoleList(value);
        vm.getRoleNode(value);
      }
      vm.dialogFormVisible = true;
    },
    getRoleNode(value) {
      var vm = this;
      request({
        url: vm.url + "demp/selectDepRoleList?depId=" + value.depId
      }).then(res => {
        vm.roleNode = [];
        res.data.data.forEach(function(item, i) {
          vm.roleNode.push(item.code);
        });
      });
    },
    getRoleList(value) {
      var vm = this;
      request({
        url: vm.url + "demp/findByDepIdRole?depId=" + value.depId
      }).then(res => {
        vm.roleList = res.data.data;
      });
    },
    handleChange(value) {
      var vm = this;
      vm.submitData.depPath = value;
      vm.submitData.parentId = value[value.length - 1];
    },

    handleDelete(depId, depName, type) {
      var vm = this;
      vm.$confirm("是否删除名称为【" + depName + "】的组织机构", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        center: true
      }).then(() => {
        request({
          url: vm.url + "demp/delDepOne?depId=" + depId
        }).then(res => {
          if (res.data.msg == "请求成功") {
            vm.$notify({
              title: "成功",
              message: "成功删除",
              type: "success",
              duration: 2000,
              onClose: function() {
                vm.initTableTree();
              }
            });
          }
        });
      });
    },
    createData() {
      var vm = this;
      if (vm.submitData.parentId == undefined) {
        vm.submitData.parentId = 0;
      }
      vm.$refs["dataForm"].validate(valid => {
        if(valid){
          request({
            url:
              vm.url +
              "demp/addDepOne?depName=" +
              vm.submitData.depName +
              "&parentId=" +
              vm.submitData.parentId
          }).then(res => {
            if (res.data.msg == "请求成功") {
              vm.dialogFormVisible = false;
              vm.$notify({
                title: "成功",
                message: "已添加",
                type: "success",
                duration: 2000
              });
              vm.initTableTree();
            }
          });
        }else{
          vm.$Message({
            type:"info",
            message: "验证未通过"
          })
        }
      })

    },

    updateData() {
      var vm = this;
      if (vm.submitData.parentId == undefined) {
        vm.submitData.parentId = 0;
      }
      vm.$refs["dataForm"].validate(valid => {
        if (valid) {
          const _submitData = Object.assign({}, vm.submitData);
          request({
            url:
              vm.url +
              "demp/updDepmentOne" +
              "?depId=" +
              _submitData.depId +
              "&depName=" +
              _submitData.depName +
              "&parentId=" +
              _submitData.parentId +
              "&isDelete=" +
              _submitData.isDelete
          }).then(res => {
            if (res.data.msg == "请求成功" || res.data.msg == "") {
              vm.dialogFormVisible = false;
              vm.$notify({
                title: "成功",
                message: "更新成功",
                type: "success",
                duration: 2000,
                onClose: function() {
                  vm.expandAll = true;
                  if (vm.language == "zh") {
                    vm.radioValue = "展开";
                  } else {
                    vm.radioValue = "exprand";
                  }
                  vm.initTableTree();
                }
              });
            }
          });
        }else{
          vm.$Message({
            type:"info",
            message: "验证未通过"
          })
        }
      });
    }

    // ---------------------------------------------------------------------------
  }
};
</script>
