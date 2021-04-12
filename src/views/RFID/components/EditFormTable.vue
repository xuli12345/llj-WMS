<template>
  <div>
    <div class="btns">
      <el-button
        v-if="addItem"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="addPopRight"
        >新增</el-button
      >
      <el-button
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm()"
        size="mini"
        >保存</el-button
      >
      <el-button class="iconfont icon-quxiao" size="mini" @click="resetForm()"
        >取消</el-button
      >
    </div>
    <!-- 头部表单 -->
    <child-form-head
      :fTableViewHead="fTableViewHead[0]"
      :rowData="rowData"
      ref="ruleForm"
      :selectArr="selectArr"
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      ref="childTable"
      :fTableView="fTableViewItem"
      :insertData="insertData"
      :fID="rowData.fIP"
    ></child-table>
    <!-- 新增字表数据 -->
    <el-drawer
      :append-to-body="true"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
      v-if="addItem"
    >
      <editCreatFrom
        @closeBox="closeItemBox"
        ref="ItemRuleForm"
        :tableHead="tableHead"
        :tableName="fTableViewItem[0]"
        :rowData="formData"
        :fColumn="fColumn"
        :selData="selData"
      ></editCreatFrom>
    </el-drawer>
  </div>
</template>

<script>
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { compare, handleRFIDData } from "@/utils/common";
import {
  getTableHeadData,
  getTableBodyData,
  collectionData
} from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "./EditChildFormHead";
import ChildTable from "./EditChildTable";
import editCreatFrom from "../Electronictag/components/editCreatFrom";
export default {
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "selectArr",
    "rowData",
    "formData"
  ],
  components: {
    ChildFormHead,
    ChildTable,
    editCreatFrom
  },
  data() {
    return {
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      drawer: false,
      //表格添加的数据
      insertData: {},
      //表格数据表头
      tableHead: [],
      fColumn: ["fTypeName", "fStorageCode"],
      selData: []
    };
  },
  methods: {
    //获取表格的表头，保存的时候需要用到
    async getTableHead() {
      let res = await getTableHeadData(this.fTableViewItem[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
      } else {
        this.$message.error(res.Message);
      }
    },

    //保存
    submitForm() {
      let formData = this.$refs.ruleForm.ruleForm; //表单的数据
      let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
      let tableData = this.$refs.childTable.tableData; //表格的数据
      let backData = this.$refs.childTable.backData; //表格原来的数据

      // backData.forEach(element => {
      //   for (const key in element) {
      //     if (element[key] == null) {
      //       this.$set(element, key, 0);
      //     }
      //   }
      // });
      // tableData.forEach(element => {
      //   for (const key in element) {
      //     if (element[key] == null) {
      //       this.$set(element, key, 0);
      //     }
      //   }
      // });
      let wantData = handleRFIDData(backData, tableData); //处理数据，获取修改的，新增的，删除的数据

      let updateArr = wantData[0];
      let insertArr = wantData[1];
      let deletedArr = wantData[2];
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              updateData: [formData],
              headData: formHeadData
            },
            {
              TableName: this.fTableViewItem[0],
              updateData: updateArr,
              insertData: insertArr,
              deleteData: deletedArr,
              headData: this.tableHead
            }
          ]);

          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

          if (res.State) {
            this.$message.success("修改成功!");
            this.$emit("closeBox", JSON.parse(JSON.stringify(formData)));
            this.$refs.ruleForm.$refs.ruleForm.resetFields();
          } else {
            this.$message.error(res.Message);
          }
        }
      });
    },
    //取消
    resetForm() {
      this.$refs.ruleForm.$refs.ruleForm.resetFields();
      this.$emit("closeBox");
    },
    //新增按钮
    addPopRight() {
      this.drawer = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭字表新增弹窗
    closeItemBox(value) {
      if (value) {
        this.$set(value, "fType", value.fTypeName);
        this.$set(value, "fPlaceID", value.fStorageCode);
        this.insertData = value;
      }
      this.drawer = false;
    },
    //获取类型名称
    async getType() {
      let res = await getTableBodyData("v_Type_Electronictag");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        let CustomerType = [];
        let data = [];
        result.forEach(element => {
          let parmsObj = {
            fType: element.fID,
            fColumnDes: element.fTypeName
          };
          data.push(parmsObj);
        });
        let object = {
          name: "fTypeName",
          data: data
        };
        CustomerType.push(object);
        this.selData = [...this.selData, ...CustomerType];
      }
    },
    //获取库位类型
    async getStorageType() {
      let res = await getTableBodyData("v_Storage_Item");

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        let result = JSON.parse(res.Data);
        // console.log(result, "原数据");
        let InvoiceType = [];
        let data = [];
        result.forEach(element => {
          let obj = {
            fType: element.fID,
            fColumnDes: element.fStorageCode
          };
          data.push(obj);
        });
        let object = {
          name: "fStorageCode",
          data: data
        };
        InvoiceType.push(object);
        this.selData = [...this.selData, ...InvoiceType];
      }
    }
  },

  created() {
    this.getTableHead();
    this.getType();
    this.getStorageType();
  }
};
</script>

<style></style>
