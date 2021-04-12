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
      ref="ruleForm"
      :selectArr="selectArr"
      :time="time"
      :StartTime="StartTime"
      :EndTime="EndTime"
      :Dock="Dock"
      :allQtystr="allQtystr"
      :allAmount="allAmount"
      @ItemTableData="ItemTableData"
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      :fTableView="fTableViewItem[0]"
      :tableData="tableData"
      ref="childTable"
    ></child-table>
  
  </div>
</template>

<script>
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { userLimit, compare } from "@/utils/common";
import { tempUrl } from "@/utils/tempUrl";
import { collectionData, saveRGBookRegData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "./ChildFormHead";
import ChildTable from "@/components/ChildTable";
export default {
  //strType:导入文件的类型
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "selectArr",
    "selectArr2",
    "time",
    "StartTime",
    "EndTime",
    "Dock"
  ],
  components: {
    ChildFormHead,
    ChildTable
  },
  data() {
    return {
      tableHeadData: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      drawer: false,
      //表格数据
      tableData: [],
      //表格数据表头
      tableHead: [],
      //excel
      fileTemp: null,
      file: null,
      fileName: "",
      //总件数
      allQtystr: 0,
      //总价格
      allAmount: 0
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
      let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
      let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据

      if (this.tableData.length <= 0) {
        this.$message.warning("请选择有货品信息的供应商!");
        return;
      }
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          let res = await saveRGBookRegData([
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

          if (res.State === true) {
            this.$message.success("新增成功!");
            this.$emit("closeBox", res.State);
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
    //根据供应商选择的从表数据
    ItemTableData(val) {
      // console.log(val);
      val.forEach((item, index) => {
        this.$set(item, "fOrdnum", item.fInboundOrderNo);
        this.$set(item, "fTotal", item.fTotalAmount);
        this.$set(item, "fSort", index + 1);
        this.$set(item, "fOrdID", item.fID);
        this.$set(item, "fExpireDate", item.fExpireDate);
      });

      this.tableData = val;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭字表新增弹窗
    closeItemBox(value) {
      if (value) {
        this.tableData.unshift(value);
      }
      this.drawer = false;
    }
  },
  watch: {
    tableData(newVal, oldVal) {
      // console.log(newVal, oldVal);
      let newArr = [];
      newArr = newVal;
      let num = 0;
      let allAmount = 0;
      newArr.forEach(item => {
        num += Number(item.fQtystr);
        allAmount += Number(item.fTotal);
      });
      this.allQtystr = num;
      this.allAmount = allAmount;
      // console.log(this.allQtystr, this.allAmount);
    }
  }
};
</script>

<style></style>
