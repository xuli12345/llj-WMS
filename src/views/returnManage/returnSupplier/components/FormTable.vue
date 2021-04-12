<template>
  <div>
    <div class="btns">
      <el-button
        v-if="addItem"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="addPopRight"
        >{{ strType == "Outbound" ? "货品新增" : "新增" }}</el-button
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
      :StateObj="StateObj"
      @openAlert="openAlert"
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      ref="childTable"
      :fTableView="fTableViewItem[0]"
      :tableData="tableData"
    ></child-table>

    <!-- 弹出框，选择退货货品 -->
    <el-dialog
      title="选择需要退货的货品"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
      :destroy-on-close="false"
    >
      <alert-table
        @closeAlert="closeAlert"
        :fTableView="'t_Stock'"
        :homeSelArr="homeSelArr"
        :dialogData="dialogData"
      ></alert-table>
    </el-dialog>
  </div>
</template>

<script>
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { userLimit, compare } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import { collectionData, imPortExcel, getTableBodyData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "./ChildFormHead";
import ChildTable from "./ChildTable";
import alertTable from "./alertTable";

export default {
  //strType:导入文件的类型
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "selectArr",
    "homeSelArr",
    "alertArr",
    "strType",
    "StateObj"
  ],
  components: {
    ChildFormHead,
    ChildTable,
    alertTable
  },
  data() {
    return {
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      drawer: false,
      //表格数据
      tableData: [],
      //excel
      fileTemp: null,
      file: null,
      fileName: "",
      dialogFormVisible: false,
      dialogData: {}
    };
  },
  methods: {
    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    },
    openAlert(val) {
      this.dialogData = val;
      this.dialogFormVisible = true;
      console.log("弹出", val);
    },
    closeAlert(v) {
      // console.log(v);
      if (v) {
        let vL = v.length;
        let tL = this.tableData.length;
        for (let i = 0; i < vL; i++) {
          for (let j = 0; j < tL; j++) {
            if (v[i].fID == this.tableData[j].fID) {
              this.$message.error("请勿添加重复货品!");
              return;
            }
          }
        }
        v.forEach(ele => {
          ele.fProdDate = ele.fProductionDate;
          ele.fExpireDate = ele.fExpiration;
          ele.fUnitID = ele.fUnit;
          ele.fQty = ele.fUsableNum;
        });
        this.tableData = this.tableData.concat(v);
      }
      this.dialogFormVisible = false;
      // console.log("关闭弹出", v);
    },
    //保存
    submitForm() {
      let formData = this.$refs.ruleForm.ruleForm;
      let formHeadData = this.$refs.ruleForm.tableHead; //form表头数据
      // formHeadData.fState = 1;
      let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据
      let finish = this.tableData.every(ele => {
        return ele.fQty && ele.fPrice;
      });
      if (!finish) {
        this.$message.warning("请输入单价和数量!");
        return;
      }
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
              headData: childTableData,
              IdentityColumn: this.fTableViewItem[1]
            }
          ]);
          //   console.log(res)
          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          console.log(res);
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
      if (this.$refs.ruleForm.ruleForm.fSupplierName) {
        this.dialogFormVisible = true;
      } else {
        this.$message.warning("请先选择供应商！");
        return;
      }
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭字表新增弹窗
    async closeItemBox(value) {
      if (value) {
        this.tableData.unshift(value);
      }
      this.drawer = false;
    },
    // excel导入
    handleChange(file, fileList) {
      this.fileTemp = file.raw;
      if (this.fileTemp) {
        //xlsx
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
    //下载模板
    downloadTemp() {
      if (this.strType.includes("Outbound")) {
        window.location.href = `${tempUrl}/ImportTempModFile/出库单导入模板.xlsx`;
      }
    },

    async importFile(strType, file) {
      let res = await imPortExcel({
        strType: strType,
        file: file
      });

      if (res.state) {
        this.$message.success("导入成功!");
        let tableData = JSON.parse(res.resultString);
        this.tableData = [...tableData, ...this.tableData];
      } else {
        this.$message.error(res.message);
      }
    }
  },
  watch: {
    dialogData: {
      handler(newVal, oldVal) {
        // console.log(newVal, oldVal);
        this.dialogData=newVal
      },
      deep: true
    }
  }
};
</script>

<style></style>
