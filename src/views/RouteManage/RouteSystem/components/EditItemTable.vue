<template>
  <div>
    <div class="btns">
      <el-button
        type="primary"
        size="mini"
        class="iconfont icon-shuaixuan "
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
    <EditChildFormHead
      :fTableViewHead="fTableViewHead[0]"
      ref="ruleForm"
      :rowData="rowData"
      :selectArr="selectArr"
    ></EditChildFormHead>
    <!-- 表格 -->
    <EditChildTable
      ref="childTable"
      :fTableView="fTableViewItem"
      :insertData="insertData"
      :fID="rowData.fID"
    ></EditChildTable>
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
        :homeSelArr="homeSelArr"
      ></alert-table>
    </el-dialog>
  </div>
</template>
<script>
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import { collectionData, getTableHeadData } from "@/api/index";
import { handelData } from "@/utils/common";
import EditChildFormHead from "@/components/EditChildFormHead";
import EditChildTable from "./EditChildTable";
import AlertTable from "./AlertTable";
export default {
  props: ["fTableViewHead", "fTableViewItem", "selectArr", "rowData"],
  components: {
    EditChildFormHead,
    EditChildTable,
    AlertTable
  },
  data() {
    return {
      tableData: [],
      openTitle: "选择门店",
      dialogFormVisible: false,
      //表格添加的数据
      insertData: [],
      userDes: this.$store.state.user.userInfo.userDes,
      homeSelArr: []
    };
  },
  methods: {
    submitForm(formName) {
      let formData = this.$refs.ruleForm.ruleForm; //表单的数据
      let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
      let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据
      let tableData = this.$refs.childTable.tableData; //表格的数据
      let backData = this.$refs.childTable.backData; //表格原来的数据
      this.fID = this.$refs.ruleForm.ruleForm.fID; //字表添加数据时,需要手动添加的键
      let wantData = handelData(backData, tableData); //处理数据，获取修改的，新增的，删除的数据
      let updateArr = wantData[0];
      let insertArr = wantData[1];
      if (insertArr && insertArr.length > 0) {
        insertArr.forEach(element => {
          element.fSystemItemID = this.fID;
        });
      }

      let deletedArr = wantData[2];
      this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
        if (valid) {
          // //权限表
          let res = await collectionData([
            {
              TableName: this.fTableViewHead[0],
              updateData: [formData],
              headData: formHeadData
            }
          ]);
          let res2 = JSON.parse(decryptDesCbc(res, String(this.userDes)));

          if (res2.State) {
            let res = await collectionData([
              {
                TableName: this.fTableViewItem[0],
                updateData: updateArr,
                insertData: insertArr,
                deleteData: deletedArr,
                headData: childTableData
              }
            ]);
            res = JSON.parse(decryptDesCbc(res, String(this.userDes)));

            if (res.State) {
              this.$message.success("修改成功!");
              this.$emit("closeBox", res.State);
              this.$refs.ruleForm.$refs.ruleForm.resetFields();
            } else {
              this.$message.error(res.Message);
            }
          } else {
            this.$message.error(res.Message);
          }
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs.ruleForm.$refs.ruleForm.resetFields();
      this.$emit("closeBox");
    },

    //新增按钮
    addPopRight() {
      this.dialogFormVisible = true;
    },
    //关闭子表新增弹窗
    closeItemBox(value) {
      if (value) {
        // console.log(value)
        value.forEach(item => {
          this.$set(item, "fShopID", item.fID);
        });
      
        this.insertData = value;
      }
      this.dialogFormVisible = false;
    }
  }
};
</script>
<style lang="scss" scoped></style>
