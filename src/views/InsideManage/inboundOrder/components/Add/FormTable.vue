<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        class="el-icon-bottom"
        @click="downloadTemp"
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
        <el-button type="primary" class="iconfont icon-excel" size="mini"
          >导入excel</el-button
        >
      </el-upload>
      <el-button
        v-if="addItem"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="addPopRight"
        >货品新增</el-button
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
    <mst-form-head
      :fTableViewHead="fTableViewHead[0]"
      ref="ruleForm"
      :selectArr="selectArr"
      :Amount="totalAmount"
      :Qtystr="totalQtystr"
      :Num="totalNum"
    ></mst-form-head>
    <!-- 表格 -->
    <child-table
      ref="childTable"
      :fTableView="fTableViewItem[0]"
      :tableData="tableData"
    ></child-table>
    <!-- 新增字表数据 -->
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
        :alertArr="alertArr"
        :fCustomerID="fCustomerID"
      ></child-form-head>
    </el-drawer>
  </div>
</template>

<script>
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { userLimit, compare } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import { collectionData, imPortExcel, getTableBodyData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "./ChildFormHead";
import mstFormHead from "./mstFormHead";
import ChildTable from "./ChildTable";
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
    mstFormHead
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
      fCustomerID: null,
      //主表总数量 总件数  总金额
      totalNum: 0,
      totalQtystr: 0,
      totalAmount: 0,
      isDestory: false
    };
  },
  methods: {
    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    },

    //保存
    submitForm() {
      let formData = this.$refs.ruleForm.ruleForm;
      let formHeadData = this.$refs.ruleForm.tableHead; //form表头数据
      let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据
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

          res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          // console.log(res);
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
      if (formData.fCustomerName) {
        this.fCustomerID = formData.fCustomerID;
        this.drawer = true;
      } else {
        this.$message.warning("请先选择所属客户");
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
        let Amount = 0;
        let Qtystr = 0;
        let num = 0;
        this.tableData.forEach(item => {
          if ("fQtystr" in item) {
          } else {
            this.$set(item, "fQtystr", 0);
          }
          if (item.fQtystr == "") {
            this.$set(item, "fQtystr", 0);
          }
          Amount += Number(item.fAmount);
          Qtystr += Number(item.fQtystr);
          num += Number(item.fInboundNum);
        });

        this.totalAmount = Amount;
        this.totalQtystr = Qtystr;
        this.totalNum = num;
        // console.log(this.totalAmount, this.totalQtystr, this.totalNum, "sum");
      }
      this.drawer = false;
    },
    // excel导入
    handleChange(file, fileList) {
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
    //下载模板
    downloadTemp() {
      if (this.strType.includes("Inbound")) {
        window.location.href = `${tempUrl}/ImportTempModFile/入库单导入模板.xlsx`;
      }
    },

    async importFile(strType, file) {
      let res = await imPortExcel({
        strType: strType,
        file: file
      });
      // console.log(res)
      if (res.state) {
        this.$message.success("导入成功!");
        let tableData = JSON.parse(res.resultString).sort(compare);
        this.tableData = [...tableData, ...this.tableData];
        let Amount = 0;
        let Qtystr = 0;
        let num = 0;

        this.tableData.forEach(element => {
          if ("fQtystr" in item) {
          } else {
            this.$set(item, "fQtystr", 0);
          }
          if (item.fQtystr == "") {
            this.$set(item, "fQtystr", 0);
          }
          Amount += Number(element.fAmount);
          Qtystr += Number(element.fQtystr);
          num += Number(element.fInboundNum);
        });
        this.totalAmount = Amount;
        this.totalQtystr = Qtystr;
        this.totalNum = num;
      } else {
        this.$message.error(res.message);
      }
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
