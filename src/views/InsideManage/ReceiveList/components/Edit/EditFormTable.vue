<template>
  <div>
    <div class="btns">
      <!-- <el-button
        type="primary"
        class="el-icon-bottom"
        @click="downloadTemp"
        :disabled="isDisabled"
        size="mini"
        >下载模板</el-button
      >
      <el-upload
        style="margin-right:5px;float:left"
        ref="upload"
        class="upload"
        action=""
        :on-change="handleChange"
        :on-remove="handleRemove"
        :auto-upload="false"
        :show-file-list="false"
        accept="application/vnd.openxmlformats-    
        officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
      >
        <el-button
          type="primary"
          :disabled="isDisabled"
          class="iconfont icon-excel"
          size="mini"
          >导入excel</el-button
        >
      </el-upload> -->
      <!-- <el-button
        v-if="addItem"
        :disabled="isDisabled"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="addPopRight"
        >新增</el-button
      > -->
      <!-- <el-button
        :disabled="isDisabled"
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm()"
        size="mini"
        >保存</el-button
      >
      <el-button
        :disabled="isDisabled"
        class="iconfont icon-quxiao"
        size="mini"
        @click="resetForm()"
        >取消</el-button
      > -->
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
      :fID="rowData.fID"
      :isDisabled="isDisabled"
      :changeData="changeData"
    ></child-table>
    <!-- 新增字表数据  -->
    <!-- <el-drawer
      v-if="addItem"
      :append-to-body="true"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
    >
      <child-form-head
        @closeBox="closeItemBox"
        :fTableViewHead="fTableViewItem[0]"
        ref="ItemRuleForm"
        :addItem="addItem"
        :selectArr="selectArr2"
        :fCustomerID="fCustomerID"
      ></child-form-head>
    </el-drawer> -->
  </div>
</template>

<script>
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { compare, handelData } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import { collectionData, imPortExcel, getTableBodyData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "./EditChildFormHead";
import ChildTable from "./EditChildTable";
export default {
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "selectArr",
    "rowData",
    "changeData",
    "strType"
  ],
  components: {
    ChildFormHead,
    ChildTable
  },
  data() {
    return {
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      drawer: false,
      //表格添加的数据
      insertData: {},
      isDisabled: false
    };
  },
  methods: {
    //保存
    submitForm() {
      let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
      let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据
      let formData = this.$refs.ruleForm.ruleForm; //表单的数据
      let tableData = this.$refs.childTable.tableData; //表格的数据
      let backData = this.$refs.childTable.backData; //表格原来的数据
      let wantData = handelData(backData, tableData); //处理数据，获取修改的，新增的，删除的数据

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
              headData: childTableData
            }
          ]);
          //   console.log(res)
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

          if (res.State === true) {
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
      let formData = this.$refs.ruleForm.ruleForm;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭字表新增弹窗
    async closeItemBox(value) {
      if (value) {
        let where = [
          {
            Computer: "=",
            DataFile: "fID",
            Value: value.fProductID
          }
        ];
        let res = await getTableBodyData("v_Product", where);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

        if (res.State) {
          let data = JSON.parse(res.Data);
          data.forEach(element => {
            this.$set(value, "fProductCode", element.fProductCode);
            this.$set(value, "fProductName", element.fProductName);
          });
          this.insertData = value;
        }
      }
      this.drawer = false;
    }
  },

  created() {
    if (this.rowData.fMstState && this.rowData.fMstState != 1) {
      this.isDisabled = true;
    }
  }
};
</script>

<style></style>
