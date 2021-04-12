<template>
  <div>
    <div class="btns">
      <el-button
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
      </el-upload>
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
      :Amount="totalAmount"
      :Qtystr="totalQtystr"
      :Num="totalNum"
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      ref="childTable"
      :fTableView="fTableViewItem"
      :insertData="insertData"
      :fID="rowData.fID"
      :isDisabled="isDisabled"
      :changeData="changeData"
      @getAmount="getAmount"
    ></child-table>
    <!-- 新增字表数据  -->
    <el-drawer
      :modal="false"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
      v-if="isDestory"
    >
      <child-form-head
        @closeBox="closeItemBox"
        :fTableViewHead="fTableViewItem[0]"
        ref="ItemRuleForm"
        :addItem="addItem"
        :selectArr="selectArr2"
        :fCustomerID="fCustomerID"
      ></child-form-head>
    </el-drawer>
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
    "selectArr2",
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
      drawer: false,
      //表格添加的数据
      insertData: {},
      isDisabled: false,
      totalAmount: 0,
      totalQtystr: 0,
      totalNum: 0,
      fCustomerID: null,
      isDestory: false,
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes
    };
  },
  methods: {
    getAmount(value) {
      this.totalAmount = value[0];
      this.totalQtystr = value[1];
      this.totalNum = value[2];
    },

    //保存
    submitForm() {
      let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
      let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据
      let formData = this.$refs.ruleForm.ruleForm; //表单的数据
      let tableData = this.$refs.childTable.tableData; //表格的数据
      let backData = this.$refs.childTable.backData; //表格原来的数据
      let wantData = handelData(backData, tableData); //处理数据，获取修改的，新增的，删除的数据
      let Amount = 0;
      let Qtystr = 0;
      let num = 0;
      tableData.forEach(item => {
        Amount += Number(item.fAmount);
        Qtystr += Number(item.fQtystr);
        num += Number(item.fInboundNum);
      });
      formData.fQtystr = Qtystr;
      formData.fTotalAmount = Amount;
      formData.fTotalNum = num;
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
      if (formData.fCustomerName) {
        this.fCustomerID = formData.fCustomerID;
        this.drawer = true;
      }
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭字表新增弹窗
    async closeItemBox(value) {
      if (value) {
        this.insertData = value;
        if (value.fQtystr == undefined) {
          this.$set(value, "fQtystr", 0);
        }
        this.totalAmount += Number(value.fAmount).toFixed(4);
        this.totalQtystr += Number(value.fQtystr);
        this.totalNum += Number(value.fInboundNum);
      }
      this.drawer = false;
    },
    //下载模板
    downloadTemp() {
      if (this.strType.includes("Inbound")) {
        window.location.href = `${tempUrl}/ImportTempModFile/入库单导入模板.xlsx`;
      }
    },
    // excel导入
    handleChange(file, fileList) {
      // console.log(file, fileList);
      this.fileTemp = file.raw;
      if (this.fileTemp) {
        if (
          this.fileTemp.type ==
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          this.fileTemp.type == "application/vnd.ms-excel"
        ) {
          this.importFile(this.strType, this.fileTemp);
        } else {
          this.$message({
            type: "warning",
            message: "附件格式错误，请删除后重新上传！"
          });
        }
      } else {
        this.$message({
          type: "warning",
          message: "请上传附件！"
        });
      }
    },

    handleRemove(file, fileList) {
      this.fileTemp = null;
    },

    async importFile(strType, file) {
      let res = await imPortExcel({
        strType: strType,
        file: file
      });

      if (res.state) {
        this.$message.success("导入成功!");
        let tableData = JSON.parse(res.resultString);
        let Amount = 0;
        let Qtystr = 0;
        let num = 0;

        tableData.forEach(element => {
          this.$set(element, "fMstID", this.rowData.fID);
          Amount += Number(element.fAmount);
          Qtystr += Number(element.fQtystr);
          num += Number(element.fInboundNum);
        });
        this.totalAmount = Amount.toFixed(4);
        this.totalQtystr = Qtystr;
        this.totalNum = num;
        this.insertData = [...tableData, ...this.insertData];
      } else {
        this.$message.error(res.message);
      }
    }
  },

  created() {
    this.fCustomerID = this.rowData.fCustomerID;
    if (this.rowData.fMstState && this.rowData.fMstState != 1) {
      this.isDisabled = true;
    }
  },
  watch: {
    drawer: function(val, old) {
      // console.log(val)
      if (val) {
        this.isDestory = true;
      } else {
        setTimeout(() => {
          this.isDestory = false;
        }, 500);
      }
    }
  }
};
</script>

<style></style>
