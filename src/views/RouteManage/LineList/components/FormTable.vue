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
      @changeData="changeData"
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      ref="childTable"
      :fTableView="fTableViewItem[0]"
      :tableData="tableData"
      :JobidfID="JobidfID"
    ></child-table>
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
    "alertArr"
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
      openTitle: "选择配货作业信息",
      dialogFormVisible: false,
      fMstID: "",
      JobidfID:"",
    };
  },
  methods: {
    //根据用户权限，查询按钮是否禁用
    userLimit(val) {
      return userLimit(val);
    },
    changeData(val,fID) {
      // console.log(val,fID, "val");
      this.tableData = val;
      this.JobidfID=fID
    },
    //保存
    submitForm() {
      let formData = this.$refs.ruleForm.ruleForm;
      // console.log(formData);
      this.fMstID = formData.fJobid;
      this.$set(formData, "fMstID", this.fMstID);
      this.tableData.forEach(element => {
        this.$set(element, "fItemID", element.fID);
        this.$set(element, "fMstID", this.fMstID);
      });
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
          if (res.State === true) {
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
      this.dialogFormVisible = true;
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.dialogFormVisible = false;
    },
    //关闭字表新增弹窗
    async closeItemBox(value) {
      if (value) {
        this.tableData.unshift(...value);
        // console.log(this.tableData, value, "22e3i");
      }
      let hash = {};
      const data2 = this.tableData.reduce((preVal, curVal) => {
        hash[curVal.fID]
          ? ""
          : (hash[curVal.fID] = true && preVal.push(curVal));
        return preVal;
      }, []);
      this.tableData = data2;

      this.dialogFormVisible = false;
    }
  },
  watch:{
    JobidfID(newVal,oldVal){
      // console.log(newVal,oldVal)
      this.JobidfID=newVal
    }
  }
};
</script>

<style></style>
