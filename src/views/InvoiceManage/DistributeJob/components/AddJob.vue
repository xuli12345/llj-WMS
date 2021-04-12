<template>
  <div>
    <div class="btns">
      <el-button
        v-if="addItem"
        type="primary"
        size="mini"
        class="iconfont icon-shuaixuan "
        @click="addPopRight"
        >筛选</el-button
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
    ></child-form-head>
    <!-- 表格 -->
    <!-- <el-alert
      title="请双击表格中的内容选择对应的货品信息!"
      type="warning"
      :closable="false"
    >
    </el-alert> -->
    <child-table
      :fTableView="fTableViewItem[0]"
      :tableData="tableData"
      :ishow="true"
      @openEditDrawer="openEditDrawer"
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
        :fTableView="fTableViewAlert[0]"
        :homeSelArr="homeSelArr"
      ></alert-table>
    </el-dialog>
    <!-- 货品从表的从表 -->
    <!-- <el-drawer
      :modal="false"
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
      v-if="newisDestory"
    >
      <JobItemTable
        ref="ItemData"
        fTableView="t_JobProduct_Item"
        :ItmeOrderNO="ItmeOrderNO"
        @closeDrawer="closeDrawer"
      ></JobItemTable>
    </el-drawer> -->
  </div>
</template>

<script>
import {
  collectionData,
  getTableHeadData,
  getTableBodyData
} from "@/api/index";
import { decryptDesCbc } from "@/utils/cryptoJs.js";
import ChildFormHead from "@/components/ChildFormHead";
import JobItemTable from "./JobItemTable";
import ChildTable from "./ChildTable";
import alertTable from "./AlertTable";
import { compare } from "@/utils/common";

export default {
  props: [
    "fTableViewHead",
    "fTableViewItem",
    "addItem",
    "selectArr",
    "homeSelArr",
    "fTableViewAlert",
    "StateObj"
  ],
  components: {
    ChildFormHead,
    ChildTable,
    alertTable,
    JobItemTable
  },
  data() {
    return {
      drawer: false,
      newisDestory: false,
      tableData: [],
      dialogFormVisible: false,
      openTitle: "选择配货单",
      insertData: [],
      ItmeOrderNO: "", //从表定单号
      selItemHead: [], //从表中的货品信息字段
      selItemList: [],
      userDes: JSON.parse(sessionStorage.getItem("user")).userDes
    };
  },
  methods: {
    //  判断某个数组是否包含在另一个数组中
    //判断arr2数组是否包含在arr1数组中
    includes(arr1, arr2) {
      return arr2.every(val => arr1.includes(val));
    },

    //保存
    async submitForm() {
      let formData = this.$refs.ruleForm.ruleForm;
      let allShopData = await this.shopIsInSystem();
      // console.log(this.tableData, allShopData);
      let shopCode = [];
      if (allShopData.length > 0) {
        allShopData.forEach(item => {
          shopCode.push(item.fShopName);
        });
      }

      shopCode = [...new Set(shopCode)];

      let arr = [];
      if (this.tableData.length > 0) {
        this.tableData.forEach(ele => {
          arr.push(ele.fShopName);
        });
      }
      let result = this.includes(shopCode, arr);
      if (result) {
        let formHeadData = this.$refs.ruleForm.tableHead; //表单头部数据
        let childTableData = this.$refs.childTable.tableHeadData; //从表表头数据
        this.$refs.ruleForm.$refs.ruleForm.validate(async valid => {
          if (valid) {
            for (let i = 0; i < this.tableData.length; i++) {
              let result = await this.getProductData(
                this.tableData[i].fOrderNo
              );
              this.selItemList = result;
              // console.log(result, "result");
            }
            if (this.selItemList.length >= 0) {
              let res = await collectionData([
                {
                  TableName: this.fTableViewHead[0],
                  insertData: [formData],
                  headData: formHeadData,
                  IdentityColumn: this.fTableViewHead[1]
                },
                {
                  TableName: "t_JobProduct_Item",
                  insertData: this.selItemList,
                  headData: this.selItemHead,
                  IdentityColumn: "fMstID"
                },
                {
                  TableName: this.fTableViewItem[0],
                  insertData: this.tableData,
                  headData: childTableData,
                  IdentityColumn: this.fTableViewItem[1]
                }
              ]);
              res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
              if (res.State) {
                this.$message.success("新增成功!");
                this.$emit("closeBox", JSON.parse(JSON.stringify(formData)));
                this.$refs.ruleForm.$refs.ruleForm.resetFields();
              } else {
                this.$message.error(res.Message);
              }
            }
          }
        });
      } else {
        // 筛选出两个数组不同的元素
        let list = [];
        list = arr.filter(item => {
          return shopCode.indexOf(item) === -1;
        });
        // console.log(list);
        list = [...new Set(list)];
        let message = list.join();
        this.$message({
          message: `${message}不在${formData.fSystemName}体系中`,
          showClose: true,
          type: "warning",
          duration: 0
        });
      }
    },
    //取消
    resetForm() {
      this.$refs.ruleForm.$refs.ruleForm.resetFields();
      this.$emit("closeBox");
    },
    //获取货品信息表格列头
    async getTableHeadData() {
      let res = await getTableHeadData("t_JobProduct_Item");

      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        this.selItemHead = res.lstRet.sort(compare);
        console.log(this.selItemHead, "表头1");
      } else {
        this.$message.error(res.Message);
      }
    },
    //新增按钮
    addPopRight() {
      // console.log(this.$refs.ruleForm.ruleForm);
      let ruleForm = this.$refs.ruleForm.ruleForm;
      if (ruleForm.fRouteSystemID == 0) {
        this.$message.warning("请选择线路体系");
      } else {
        this.dialogFormVisible = true;
      }
    },
    openEditDrawer(row) {
      this.ItmeOrderNO = row.fOrderNo;
      this.drawer = true;
    },
    //获取所有门店是否在当前线路中
    async shopIsInSystem() {
      let ruleForm = this.$refs.ruleForm.ruleForm;
      let where = [
        {
          Computer: "=",
          DataFile: "fMstID",
          Value: ruleForm.fRouteSystemID
        }
      ];
      let res = await getTableBodyData("v_Route_System_Item", where);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        // console.log(result);
        let arr = [];
        result.forEach(item => {
          arr.push(item.fID);
        });
        let allID = arr.join();
        let seachWhere = [
          {
            Computer: "in",
            DataFile: "fSystemItemID",
            Value: allID
          }
        ];
        let res1 = await getTableBodyData(
          "v_Route_System_ShopItem",
          seachWhere
        );
        res1 = JSON.parse(decryptDesCbc(res1, String(this.userDes)));
        if (res1.State) {
          let allShopData = JSON.parse(res1.Data);
          // console.log(allShopData,'all')
          return allShopData;
        } else {
          this.$message.error(res1.Message);
        }
      } else {
        this.$message.error(res.Message);
      }
    },

    //关闭子表新增弹窗
    async closeItemBox(value) {
      if (value) {
        value.forEach(item => {
          this.$set(item, "fStockID", item.fID);
          this.$set(item, "fSourceOrderNo", item.fOrgBillNo);
        });

        this.tableData = [...this.tableData, ...value];
      }
      this.dialogFormVisible = false;
    },
    //获取从表内容
    async getProductData(ItmeOrderNO) {
      let searchWhere = [
        {
          Computer: "=",
          DataFile: "fOrderNo",
          Value: ItmeOrderNO
        }
      ];
      let res = await getTableBodyData("v_DistributeNotice_Item", searchWhere);
      res = JSON.parse(decryptDesCbc(res, String(this.userDes)));
      if (res.State) {
        let result = JSON.parse(res.Data);
        result.forEach((item, index) => {
          this.$set(item, "fSort", index + 1);
          this.$set(item, "fAlcntcNo", item.fOrderNo);
        });

        this.selItemList = [...this.selItemList, ...result];
        return this.selItemList;
      }
    }
  },
  created() {
    this.getTableHeadData();
  },
  watch: {
    drawer: function(val, old) {
      if (val) {
        this.newisDestory = true;
      } else {
        setTimeout(() => {
          this.newisDestory = false;
        }, 500);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .el-dialog {
  margin: 50px auto !important;
}
</style>
