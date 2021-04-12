<template>
  <div>
    <div class="btns">
      <el-button
        v-if="addItem"
        :disabled="isDisabled"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="addPopRight"
        >新增</el-button
      >
      <el-button
        :disabled="isDisabled"
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm()"
        size="mini"
        >保存</el-button
      >
      <el-button
        class="iconfont icon-quxiao"
        size="mini"
        @click="resetForm()"
        >取消</el-button
      >
    </div>
    <!-- 头部表单 -->
    <child-form-head
      :fTableViewHead="fTableViewHead[0]"
      :rowData="rowData"
      ref="ruleForm"
      :selectArr="selectArr"
      @changeData="changeData"
    ></child-form-head>
    <!-- 表格 -->
    <Edit-child-table
      ref="childTable"
      :fTableView="fTableViewItem"
      :insertData="insertData"
      :fID="rowData.fMstID"
      :isDisabled="isDisabled"
    ></Edit-child-table>
    <!-- 新增字表数据  -->
    <el-dialog
      :title="openTitle"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
      :destroy-on-close="false"
    >
      <alert-table
        @closeBox="closeItemBox"
        :fTableView="fTableViewItem[0]"
      ></alert-table>
    </el-dialog>
  </div>
</template>

<script>
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { compare, handleLineListData } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import { collectionData, imPortExcel, getTableBodyData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "./EditChildFormHead";
import EditChildTable from "./EditChildTable";
import alertTable from "./alertTable";
export default {
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "rowData",
    "tableHeadData",
    "selectArr"
  ],
  components: {
    ChildFormHead,
    EditChildTable,
    alertTable
  },
  data() {
    return {
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      drawer: false,
      //表格添加的数据
      insertData: {},
      isDisabled: false,
      openTitle: "选择配货作业信息",
      dialogFormVisible: false
    };
  },
  methods: {
    //保存
    async submitForm() {
      let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
      let formData = this.$refs.ruleForm.ruleForm; //表单的数据
      let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据
      let tableData = this.$refs.childTable.tableData; //表格的数据
      let backData = this.$refs.childTable.backData; //表格原来的数据
      let wantData = handleLineListData(backData, tableData); //处理数据，获取修改的，新增的，删除的数据
      let updateArr = wantData[0];
      let insertArr = wantData[1];
      let deletedArr = wantData[2];
      // console.log(formData, "formData", insertArr);
      let fMstID = formData.fMstID;
      if (insertArr != null) {
        insertArr.forEach(element => {
          this.$set(element, "fItemID", element.fID);
          this.$set(element, "fMstID", fMstID);
        });
      }
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
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res.State === true) {
            this.$message.success("修改成功!");
            this.$refs.ruleForm.$refs.ruleForm.resetFields();
            this.$emit("closeBox", res.State);
          } else {
            this.$message.error(res.Message);
          }
        }
      });
    },

    //取消
    resetForm() {
      this.$emit("closeBox");
    },
    changeData(val) {
      // this.insertData = val;
    },
    //新增按钮
    addPopRight() {
      this.dialogFormVisible = true;
    },

    //关闭字表新增弹窗
    async closeItemBox(value) {
      if (value) {
        this.insertData = value;
      }
      this.dialogFormVisible = false;
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
