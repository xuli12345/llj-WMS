<template>
  <div>
    <div class="btns">
      <!-- <el-button
        type="primary"
        class="el-icon-bottom"
        @click="downloadTemp"
        :disabled="isDisabled"
        size="mini"
      >下载模板</el-button>
      <el-upload
        style="margin-right:5px;float:left"
        ref="upload"
        class="upload"
        action
        :on-change="handleChange"
        :on-remove="handleRemove"
        :auto-upload="false"
        :show-file-list="false"
        accept="application/vnd.openxmlformats-    
        officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      >
        <el-button
          type="primary"
          :disabled="isDisabled"
          class="iconfont icon-excel"
          size="mini"
        >导入excel</el-button>
      </el-upload>-->
      <el-button
        v-if="addItem"
        :disabled="isDisabled"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="addPopRight"
        >货品新增</el-button
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
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      ref="childTable"
      :fTableView="fTableViewItem"
      :insertData="insertData"
      :fID="rowData.fID"
      :changeData="changeData"
      :isDisabled="isDisabled"
    ></child-table>
    <!-- 弹出框，选择退货货品 -->
    <el-dialog
      title="选择需要退货的货品"
      :visible.sync="drawer"
      :append-to-body="true"
      :destroy-on-close="false"
    >
<<<<<<< HEAD
      <alert-table @closeAlert="closeAlert" :fTableView="'t_Stock'" :dialogData="rowData"></alert-table>
=======
      <alert-table
        @closeAlert="closeAlert"
        :fTableView="'t_Stock'"
      ></alert-table>
>>>>>>> master
    </el-dialog>
  </div>
</template>

<script>
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { compare, handelData } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import {
  collectionData,
  imPortExcel,
  savePickingList,
  getTableBodyData
} from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "./EditChildFormHead";
import ChildTable from "./EditChildTable";
import alertTable from "./alertTable";
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
    ChildTable,
    alertTable
  },
  data() {
    return {
      inputValue: "",
      value: "",
      options: [],
      dialogForm: false,
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      drawer: false,
      //表格添加的数据
      insertData: [],
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
      let finish = tableData.every(ele => {
        return ele.fQty && ele.fPrice;
      });
      if (!finish) {
        this.$message.warning("请输入单价和数量!");
        return;
      }
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
          // console.log(res)
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          console.log(res);
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
      this.drawer = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭字表新增弹窗
    async closeAlert(v) {
      if (v) {
        let vL = v.length;
        let tL = this.insertData.length;
        for (let i = 0; i < vL; i++) {
          for (let j = 0; j < tL; j++) {
            if (v[i].fID == this.insertData[j].fID) {
              this.$message.error("请勿添加相同货品!");
              return;
            }
          }
        }
        v.forEach(ele => {
          if (ele.fProductionDate) {
            ele.fProdDate = updateTime(ele.fProductionDate);
          } else {
            ele.fProductionDate = null;
          }
          if (ele.fExpiration) {
            ele.fExpireDate = updateTime(ele.fExpiration);
          } else {
            ele.fExpiration = null;
          }
          ele.fUnitID = ele.fUnit;
        });

        this.insertData = v;
      }
      this.drawer = false;
    },

    //下载模板
    // downloadTemp() {
    //   if (this.strType.includes("Outbound")) {
    //     window.location.href = `${tempUrl}/ImportTempModFile/出库单导入模板.xlsx`;
    //   }
    // },
    // excel导入
    // handleChange(file, fileList) {
    //   this.fileTemp = file.raw;
    //   if (this.fileTemp) {
    //     if (
    //       this.fileTemp.type ==
    //         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    //       this.fileTemp.type == "application/vnd.ms-excel"
    //     ) {
    //       this.importFile(this.strType, this.fileTemp);
    //     } else {
    //       this.$message({
    //         type: "warning",
    //         message: "附件格式错误，请删除后重新上传！"
    //       });
    //     }
    //   } else {
    //     this.$message({
    //       type: "warning",
    //       message: "请上传附件！"
    //     });
    //   }
    // },

    // handleRemove(file, fileList) {
    //   this.fileTemp = null;
    // },

    // async importFile(strType, file) {
    //   let res = await imPortExcel({
    //     strType: strType,
    //     file: file
    //   });

    //   if (res.state) {
    //     this.$message.success("导入成功!");
    //     let tableData = JSON.parse(res.resultString);
    //     tableData.forEach(element => {
    //       this.$set(element, "fMstID", this.rowData.fID);
    //     });

    //     this.insertData = [...tableData, ...this.insertData];
    //   } else {
    //     this.$message.error(res.message);
    //   }
    // },

    async save() {
      let res = await savePickingList([
        {
          fID: this.inputValue,
          RplwayID: this.value
        },
        { userDes: this.userDes, userId: this.userId }
      ]);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      console.log(res);
      if (res.State) {
        this.$message.success("保存成功!");
        // this.$message.success(res.Message);
        this.dialogForm = false;
      } else {
        this.$message.warning(res.Message);
      }
    }
  },

  created() {
    this.inputValue = this.rowData.fID;
    if (this.rowData.fState && this.rowData.fState != 1) {
      this.isDisabled = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog .el-input {
  width: 200px;
}
</style>
