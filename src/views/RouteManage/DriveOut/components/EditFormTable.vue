<template>
  <div>
    <div class="btns">
      <el-button
        :disabled="isDisabled"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="recordTruck"
        >出车登记</el-button
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
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      ref="childTable"
      :fTableView="fTableViewItem"
      :rowData="rowData"
    ></child-table>
    <!-- 出车登记需要填写出车时里程数 -->
    <el-dialog
      title="出车登记"
      :visible.sync="dialogFormVisible"
      :modal="false"
    >
      <el-form
        :model="form"
        style="width:100%"
        :rules="rules"
        ref="ruleForm2"
        label-width="120px"
      >
        <el-form-item label="出车时里程数" prop="fOutmileage">
          <el-input v-model="form.fOutmileage"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">
          <i class="iconfont icon-quxiao"></i>取 消</el-button
        >
        <el-button type="primary" size="mini" @click="recordConfirm">
          <i class="iconfont icon-baocun"></i>确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { collectionData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "./EditChildFormHead";
import ChildTable from "./EditChildTable";

export default {
  props: ["fTableViewHead", "fTableViewItem", "rowData"],
  components: {
    ChildFormHead,
    ChildTable
  },
  data() {
    return {
      inputValue: "",
      value: "",
      options: [],
      dialogForm: false,
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes,
      user: JSON.parse(sessionStorage.getItem("user")),
      drawer: false,
      isDisabled: false,
      formLabelWidth: "120",
      form: {
        fOutmileage: null,
        fOutDate: null,
        fOuterCode: null
      },
      dialogFormVisible: false,
      rules: {
        fOutmileage: [
          { required: true, message: "请输入里程数", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    recordTruck() {
      this.dialogFormVisible = true;
      return;
    },
    recordConfirm() {
      let _this = this;
      // console.log(this.$refs)
      this.$refs.ruleForm2.validate(async valid => {
        if (valid) {
          let formHeadData = _this.$refs.ruleForm.tableHead;
          let updateData = JSON.parse(JSON.stringify(_this.rowData));
          updateData.fOutDate = new Date();
          updateData.fOuter = _this.user.userId;
          updateData.fOutmileage = this.form.fOutmileage;
          let res = await collectionData([
            {
              TableName: _this.fTableViewHead[0],
              updateData: [updateData],
              headData: formHeadData
            }
          ]);
          res = JSON.parse(decryptDesCbc(res, String(_this.userDes)));
          if (res.State) {
            _this.dialogFormVisible = false;
            _this.$message.success("出车完成");
            _this.$emit("closeBox", true);
          } else {
            _this.$message.error(res.Message);
          }
        } else {
          return false;
        }
      });
    },
    //取消
    resetForm() {
      this.$refs.ruleForm.$refs.ruleForm.resetFields();
      this.$emit("closeBox");
    },
    //点击x关闭弹窗
    handleClose(done) {
      this.drawer = false;
    },
    //关闭字表新增弹窗
    async closeItemBox(value) {
      this.drawer = false;
    }
  },

  created() {
    this.inputValue = this.rowData.fID;
    if (this.rowData.fMstState && this.rowData.fMstState != 1) {
      this.isDisabled = true;
    }
  }
};
</script>

<style lang="scss" scoped>
// .dialog .el-input {
//   width: 200px;
// }
/deep/ .el-dialog {
  width: 40%;
}
.el-form-item {
  width: 50%;
}
</style>
