<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-shuaixuan"
        @click="addPopRight"
        >添加门店</el-button
      >
      <el-button
        type="primary"
        class="iconfont icon-baocun"
        @click="submitForm('ruleForm')"
        size="mini"
        >保存</el-button
      >
      <el-button
        class="iconfont icon-quxiao"
        size="mini"
        @click="resetForm('ruleForm')"
        >取消</el-button
      >
    </div>
    <!-- form表格  -->
    <child-form-head
      :fTableViewHead="fTableViewHead[0]"
      ref="ruleForm"
      :selectArr="selectArr"
    ></child-form-head>
    <!-- 表格 -->
    <child-table
      :fTableView="fTableViewItem[0]"
      :tableData="tableData"
      ref="childTable"
    ></child-table>
    <!-- 新增字表数据 -->
    <el-dialog
      :title="openTitle"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
      :destroy-on-close="true"
    >
      <alert-table
        @closeBox="closeItemBox"
        :fTableView="'t_ShopItem'"
      ></alert-table>
    </el-dialog>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { collectionData } from "@/api/index";
import ChildFormHead from "@/components/ChildFormHead";
import ChildTable from "@/components/ChildTable";
import AlertTable from "./AlertTable";
export default {
  props: ["fTableViewHead", "fTableViewItem", "selectArr"],
  components: {
    ChildFormHead,
    ChildTable,
    AlertTable
  },
  data() {
    return {
      tableData: [],
      openTitle: "选择门店",
      dialogFormVisible: false,
      userDes: this.$store.state.user.userInfo.userDes
    };
  },
  methods: {
    submitForm(formName) {
      let formData = this.$refs.ruleForm.ruleForm;
      let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
      let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据
      let fMstID = this.$store.state.common.changeValue;
      // console.log(fMstID);
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          formData.fMstID = fMstID;
          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              insertData: [formData],
              headData: formHeadData
            }
          ]);
          let res2 = JSON.parse(decryptDesCbc(res, String(this.userDes)));
          if (res2.State) {
            this.tableData.forEach(ele => {
              ele.fSystemItemID = res2.Identity;
            });
            let res = await collectionData([
              {
                TableName: this.fTableViewItem[0],
                insertData: this.tableData,
                headData: childTableData
              }
            ]);
            res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

            if (res.State) {
              this.$message.success("新增成功!");
              this.$emit("closeBox", res.State);
            } else {
              this.$message.error(res.Message);
            }
          } else {
            this.$message.error(res2.Message);
          }
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$emit("closeBox");
    },
    //新增按钮
    addPopRight() {
      this.dialogFormVisible = true;
    },
    //关闭子表新增弹窗
    closeItemBox(value) {
      if (value) {
        // console.log(value, "value");
        value.forEach(item => {
          this.$set(item, "fShopID", item.fID);
          this.$set(item, "fSort", this.tableData.length + 1);
        });
        if (this.tableData.length == 0) {
          this.tableData = value;
        } else {
          let res = this.tableData.every(item => {
            return item.fShopID != value[0].fShopID;
          });
          if (res) {
            this.tableData = [...this.tableData, ...value];
          } else {
            this.$message.warning("此门店已存在!");
          }
        }
      }
      this.dialogFormVisible = false;
    }
  }
};
</script>
<style lang="scss" scoped></style>
