<template>
  <div>
    <div class="btns">
      <el-button
        v-if="addItem"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="addPopRight"
      >
        新增</el-button
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
      ref="ruleForm"
      :selectArr="selectArr"
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      :fTableView="fTableViewItem[0]"
      :tableData="tableData"
    ></child-table>
    <!-- 新增字表数据 -->
    <el-drawer
      :append-to-body="true"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
      v-if="addItem"
    >
      <CreatFrom
        ref="ItemRuleForm"
        @closeBox="closeItemBox"
        :tableHead="tableHead"
        :tableName="fTableViewItem[0]"
        :formData="ruleForm"
        :fColumn="fColumn"
        :selData="selData"
      ></CreatFrom>
    </el-drawer>
  </div>
</template>

<script>
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { userLimit, compare } from "@/utils/common";
import {
  getTableHeadData,
  getTableBodyData,
  collectionData
} from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "./ChildFormHead";
import ChildTable from "./ChildTable";
import CreatFrom from "../Electronictag/components/CreatFrom";

export default {
  //strType:导入文件的类型
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "selectArr",
    "selectArr2",
    "alertArr",
    "strType"
  ],
  components: {
    ChildFormHead,
    ChildTable,
    CreatFrom
  },
  data() {
    return {
      drawer: false,
      //表格数据
      tableData: [],
      //表格数据表头
      tableHead: [],
      //excel
      file: null,
      ruleForm: {},
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      fColumn: ["fTypeName", "fStorageCode"],
      selData: [],
      switchArr: [
        { fColumn: "fTypeName", sfColumn: "fType" },
        { fColumn: "fStorageCode", sfColumn: "fPlaceID" }
      ]
    };
  },
  methods: {
    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    },

    //获取表格的表头
    async getTableHead() {
      let res = await getTableHeadData(this.fTableViewItem[0]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

      if (res.State) {
        this.tableHead = res.lstRet.sort(compare);
        console.log(this.tableHead, "从表表格表头");
      } else {
        this.$message.error(res.Message);
      }
    },
    //保存
    submitForm() {
      let formData = this.$refs.ruleForm.ruleForm;
      let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              insertData: [formData],
              headData: formHeadData,
              IdentityColumn: this.fTableViewHead[1]
            },
            {
              TableName: this.fTableViewItem[0],
              insertData: this.tableData,
              headData: this.tableHead,
              IdentityColumn: this.fTableViewItem[1]
            }
          ]);

          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

          if (res.State) {
            this.$message.success("新增成功!");
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
      let formData = this.$refs.ruleForm.ruleForm;

      if (formData.fIP && formData.fPort) {
        this.ruleForm = {
          fIP: formData.fIP,
          fPort: formData.fPort
        };
        this.drawer = true;
      } else {
        this.$message.warning("请先输入IP和Port");
      }
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭字表新增弹窗
    closeItemBox(value) {
      if (value) {
        // console.log(11111,value)
        this.$set(value, "fType", value.fTypeName);
        this.$set(value, "fPlaceID", value.fStorageCode);
        this.tableData.push(value);
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
