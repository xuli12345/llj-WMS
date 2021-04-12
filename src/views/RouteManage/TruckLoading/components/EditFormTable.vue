<template>
  <div>
    <div class="btns">
      <el-button
        :disabled="isDisabled"
        type="primary"
        size="mini"
        class="iconfont icon-xinzeng add"
        @click="finishTruck"
      >完成装车</el-button>
      <el-button
        class="iconfont icon-quxiao"
        size="mini"
        @click="resetForm()"
      >取消</el-button>
    </div>
    <!-- 头部表单 -->
    <child-form-head :fTableViewHead="fTableViewHead[0]" :rowData="rowData" ref="ruleForm"></child-form-head>
    <!-- 表格 -->
    <child-table ref="childTable" :fTableView="fTableViewItem" :rowData="rowData"></child-table>
    <!-- 如果还有货品未完成拣货，提示 -->
    <el-dialog
      title="以下门店尚未完成拣货，不能装车!"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
      :destroy-on-close="false"
    >
      <alert-table :tableData="tableData" @closeAlert="closeAlert"></alert-table>
    </el-dialog>
  </div>
</template>

<script>
import { timeCycle, updateTime } from "@/utils/updateTime"; //格式化时间
import { compare, handelData } from "@/utils/common";
import { collectionData, getTableBodyData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "./EditChildFormHead";
import ChildTable from "./EditChildTable";
import alertTable from "./alertTable";
export default {
  props: ["fTableViewHead", "fTableViewItem", "rowData"],
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
      user: JSON.parse(sessionStorage.getItem("user")),
      drawer: false,
      isDisabled: false,
      dialogFormVisible: false,
      tableData: []
    };
  },
  methods: {
    async finishTruck() {
      let _this = this;
      let data = this.$refs.childTable.tableData;
      let shopValue = "";
      for (let i = 0; i < data.length; i++) {
        if (i == 0) {
          shopValue = shopValue + data[i].fShopID;
        } else {
          shopValue = shopValue + "," + data[i].fShopID;
        }
      }
      let check = await getTableBodyData("v_OutboundOrderNoReceive", [
        {
          Computer: "=",
          DataFile: "fJobID",
          Value: this.rowData.fPaicheSn
        },
        {
          Computer: "in",
          DataFile: "fShopID",
          Value: shopValue
        }
      ]);
      check = JSON.parse(decryptDesCbc(check, String(this.user.userDes)));
      console.log(check);
      // return;
      if (check.State) {
        if (check.Data == "[]") {
          this.$confirm("已经完成装车了吗", "提示", {
            confirmButtonText: "完成了",
            cancelButtonText: "还没有",
            type: "info"
          })
            .then(async () => {
              let formHeadData = _this.$refs.ruleForm.tableHead;
              let updateData = JSON.parse(JSON.stringify(_this.rowData));
              updateData.fLoading = new Date();
              updateData.fLoader = _this.user.userId;
              let res = await collectionData([
                {
                  TableName: _this.fTableViewHead[0],
                  updateData: [updateData],
                  headData: formHeadData
                }
              ]);
              res = JSON.parse(decryptDesCbc(res, String(_this.userDes)));
              if (res.State) {
                _this.$message.success("装车完成");
                _this.$emit("closeBox", true);
              } else {
                _this.$message.error(res.Message);
              }
            })
            .catch(() => {
              this.$message({
                type: "info",
                message: "还没有"
              });
            });
        } else {
          this.tableData = JSON.parse(check.Data);
          this.dialogFormVisible = true;
        }
     }
    },
    //完成chang
    async closeAlert(v) {
      if (v) {
        let formHeadData = this.$refs.ruleForm.tableHead;
        let updateData = JSON.parse(JSON.stringify(this.rowData));
        updateData.fLoading = new Date();
        updateData.fLoader = this.user.userId;
        let res = await collectionData([
          {
            TableName: this.fTableViewHead[0],
            updateData: [updateData],
            headData: formHeadData
          }
        ]);
        res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
        if (res.State) {
          this.$message.success("装车完成");
          this.$emit("closeBox", true);
        } else {
          this.$message.error(res.Message);
        }
      }
      this.dialogFormVisible = false;
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
    if (this.rowData.fLoader) {
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
