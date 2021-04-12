<template>
  <div>
    <div class="btns">
      <!-- :disabled="isDisabled" -->
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
      :rowData="rowData"
      ref="ruleForm"
      :selectArr="selectArr"
      @boxChecked="boxChecked"
    ></child-form-head>

    <!-- 表格 -->
    <child-table
      ref="childTable"
      :fTableView="fTableViewItem"
      :fID="rowData.fID"
      :isDisabled="isDisabled"
      :rowData="rowData"
    ></child-table>
  </div>
</template>

<script>
import { handelData, compare } from "@/utils/common";
import { collectionData, saveCollection, getTableHeadData } from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "./EditMstFormHead";
import ChildTable from "./EditChildTable";
export default {
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "selectArr",
    "selectArr2",
    "rowData"
  ],
  components: {
    ChildFormHead,
    ChildTable
  },
  data() {
    return {
      //已审核状态
      isDisabled: false,
      checkedValue: "",
      tableHeadData: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes
    };
  },
  methods: {
    boxChecked(val) {
      this.checkedValue = val;
    },
    //保存
    submitForm() {
      let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
      let formData = this.$refs.ruleForm.ruleForm; //表单的数据
      let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据
      let tableData = this.$refs.childTable.tableData; //表格的数据
      let noSortingData = tableData.filter(item => {
        return item.fItemIsEnd == 0;
      });
      if (this.checkedValue) {
        this.$confirm("实拣数量是否等于应拣数量?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(async () => {
            noSortingData.forEach(item => {
              this.$set(item, "fQty1", item.fQty);
              this.$set(item, "fQty2", item.fQty);
              this.$set(item, "fItemIsEnd", 1);
            });

            let res = await saveCollection([
              {
                TableName: this.fTableViewHead[0],
                updateData: [formData],
                headData: formHeadData
              },
              {
                TableName: this.fTableViewItem[0],
                updateData: noSortingData,
                headData: childTableData
              }
            ]);
            res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
            if (res.State) {
              let ItemTableData = [];
              let obj = {};
              noSortingData.forEach(async item => {
                obj = {
                  fMstID: item.fID,
                  fChengzhong: item.fQty,
                  fPizhong: 0,
                  fType: 0,
                  fCreateDate: new Date(),
                  fSupplier: "A",
                  fQty1: item.fQty
                };
                ItemTableData.push(obj);
                console.log(ItemTableData, "每一项的数据");
              });
              let res1 = await collectionData([
                {
                  TableName: "t_ChengzhongRenWu_Item1",
                  insertData: ItemTableData,
                  headData: this.tableHeadData
                }
              ]);
              res1 = JSON.parse(decryptDesCbc(res1, String(this.userDes)));

              if (res1.State) {
                this.$message.success("保存成功!");
                this.$emit("closeBox", res1.State);
              } else {
                this.$message.warning(res.Message);
              }
            } else {
              this.$message.warning(res.Message);
            }
          })
          .catch(async () => {
            noSortingData.forEach(item => {
              this.$set(item, "fQty1", 0);
              this.$set(item, "fQty2", 0);
              this.$set(item, "fItemIsEnd", 1);
            });
            let res2 = await saveCollection([
              {
                TableName: this.fTableViewHead[0],
                updateData: [formData],
                headData: formHeadData
              },
              {
                TableName: this.fTableViewItem[0],
                updateData: noSortingData,
                headData: childTableData
              }
            ]);
            res2 = JSON.parse(decryptDesCbc(res2, String(this.userDes)));
            if (res2.State) {
              // this.$message.success("保存成功");
              let ItemTableData2 = [];
              let obj = {};
              noSortingData.forEach(async item => {
                obj = {
                  fMstID: item.fID,
                  fChengzhong: 0,
                  fPizhong: 0,
                  fType: 0,
                  fCreateDate: new Date(),
                  fSupplier: "A",
                  fQty1: 0
                };
                ItemTableData2.push(obj);
              });
              let res3 = await collectionData([
                {
                  TableName: "t_ChengzhongRenWu_Item1",
                  insertData: ItemTableData2,
                  headData: this.tableHeadData
                }
              ]);
              res3 = JSON.parse(decryptDesCbc(res3, String(this.userDes)));

              if (res3.State) {
                this.$message.success("保存成功!");
                this.$emit("closeBox", res3.State);
              } else {
                this.$message.warning(res3.Message);
              }
            } else {
              this.$message.warning(res.Message);
            }
          });
      }
    },
    //取消
    resetForm() {
      this.$refs.ruleForm.$refs.ruleForm.resetFields();
      this.$emit("closeBox");
    },
    //获取表头数据
    async getTableHeadData() {
      let res = await getTableHeadData("t_ChengzhongRenWu_Item1");
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.tableHeadData = res.lstRet.sort(compare);
      }
    }
  },

  created() {
    this.getTableHeadData();
    if (this.rowData.fMstIsEnd == 1) {
      this.isDisabled = true;
    }
  }
};
</script>

<style></style>
